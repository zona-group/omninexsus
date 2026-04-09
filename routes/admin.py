from functools import wraps
from flask import Blueprint, render_template, redirect, url_for, request, jsonify, flash, current_app
from flask_login import login_required, current_user
from flask_mail import Message
from app import db, mail
from models import User, Comment, PushSubscription

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            flash('Bu sayfaya erisiminiz yok.', 'error')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return login_required(decorated)


@admin_bp.route('/')
@admin_required
def dashboard():
    total_users     = User.query.count()
    active_users    = User.query.filter_by(is_active=True).count()
    pending_users   = User.query.filter_by(is_active=False).count()
    admin_users     = User.query.filter_by(role='admin').count()
    total_comments  = Comment.query.filter_by(is_deleted=False).count()
    push_subs       = PushSubscription.query.count()
    recent_users    = User.query.order_by(User.created_at.desc()).limit(10).all()
    return render_template('admin/dashboard.html',
        total_users=total_users, active_users=active_users,
        pending_users=pending_users, admin_users=admin_users,
        total_comments=total_comments, push_subs=push_subs,
        recent_users=recent_users)


@admin_bp.route('/users')
@admin_required
def users():
    page  = request.args.get('page', 1, type=int)
    q     = request.args.get('q', '').strip()
    query = User.query
    if q:
        query = query.filter(
            User.username.ilike(f'%{q}%') | User.email.ilike(f'%{q}%')
        )
    users_page = query.order_by(User.created_at.desc()).paginate(page=page, per_page=25)
    return render_template('admin/users.html', users_page=users_page, q=q)


@admin_bp.route('/users/<int:user_id>/role', methods=['POST'])
@admin_required
def set_role(user_id):
    try:
        user = User.query.get_or_404(user_id)
        if user.id == current_user.id:
            return jsonify({'success': False, 'error': 'Kendi rolunuzu degistiremezsiniz.'}), 400
        data = request.get_json(silent=True) or {}
        role = data.get('role', 'user')
        if role not in ('user', 'admin'):
            return jsonify({'success': False, 'error': 'Gecersiz rol.'}), 400
        user.role = role
        db.session.commit()
        return jsonify({'success': True, 'username': user.username, 'role': user.role})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"set_role error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['POST'])
@admin_required
def toggle_active(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({'success': False, 'error': 'Kendi hesabinizi pasiflestiremezsiniz.'}), 400
    user.is_active = not user.is_active
    db.session.commit()
    status = 'aktif' if user.is_active else 'pasif'
    return jsonify({'success': True, 'username': user.username, 'is_active': user.is_active,
                    'message': f'{user.username} kullanicisi {status} yapildi.'})


@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@admin_required
def activate_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active      = True
    user.email_verified = True
    user.verification_token = None
    db.session.commit()
    return jsonify({'success': True, 'message': f'{user.username} aktif edildi.'})


@admin_bp.route('/notify', methods=['POST'])
@admin_required
def send_notification():
    """Send push notification to all subscribers."""
    data  = request.get_json(silent=True) or {}
    title = data.get('title', 'OmniNexus').strip()
    body  = data.get('body', '').strip()
    url   = data.get('url', '/')

    if not body:
        return jsonify({'success': False, 'error': 'Bildirim metni gerekli.'}), 400

    subs = PushSubscription.query.all()
    sent, failed = 0, 0

    try:
        from pywebpush import webpush, WebPushException
        import json
        vapid_private = current_app.config['VAPID_PRIVATE_KEY']
        vapid_claims  = current_app.config['VAPID_CLAIMS']

        for sub in subs:
            try:
                webpush(
                    subscription_info={
                        'endpoint': sub.endpoint,
                        'keys': {'p256dh': sub.p256dh, 'auth': sub.auth}
                    },
                    data=json.dumps({'title': title, 'body': body, 'url': url}),
                    vapid_private_key=vapid_private,
                    vapid_claims=vapid_claims
                )
                sent += 1
            except WebPushException as e:
                if '410' in str(e) or '404' in str(e):
                    db.session.delete(sub)
                failed += 1

        db.session.commit()
    except ImportError:
        return jsonify({'success': False, 'error': 'pywebpush modulu yuklu degil.'}), 500

    return jsonify({'success': True, 'sent': sent, 'failed': failed,
                    'message': f'{sent} aboneye bildirim gonderildi.'})


@admin_bp.route('/mail-test', methods=['POST'])
@admin_required
def mail_test():
    try:
        msg = Message(
            subject='OmniNexus — Mail Test',
            recipients=[current_user.email],
            body='OmniNexus mail sistemi calisiyor!'
        )
        mail.send(msg)
        return jsonify({'success': True, 'message': f'Test maili {current_user.email} adresine gonderildi.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/mail-user', methods=['POST'])
@admin_required
def mail_user():
    """Send a personal email to a specific address (reply-to support)."""
    data     = request.get_json(silent=True) or {}
    to_email = data.get('to_email', '').strip()
    subject  = data.get('subject', '').strip()
    body     = data.get('body', '').strip()

    if not to_email or not subject or not body:
        return jsonify({'success': False, 'error': 'Alici, konu ve mesaj zorunludur.'}), 400
    if '@' not in to_email:
        return jsonify({'success': False, 'error': 'Gecersiz e-posta adresi.'}), 400

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:32px;">
    <h1 style="color:#818cf8;margin-top:0;font-size:1.4rem;">OmniNexus</h1>
    <div style="color:#e2e8f0;font-size:15px;line-height:1.7;white-space:pre-line;">{body}</div>
    <hr style="border:none;border-top:1px solid #334155;margin:24px 0;">
    <p style="color:#475569;font-size:12px;margin:0;">
      OmniNexus ekibi tarafindan gonderilmistir.<br>
      <a href="https://www.omninexsus.com" style="color:#6366f1;">www.omninexsus.com</a>
    </p>
  </div>
</body></html>"""

    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=html_body,
            reply_to=current_user.email
        )
        mail.send(msg)
        return jsonify({'success': True, 'message': f'{to_email} adresine mail gonderildi.'})
    except Exception as e:
        current_app.logger.error(f"[mail-user] {to_email}: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users/search')
@admin_required
def search_users():
    """Autocomplete: search users by email or username."""
    q = request.args.get('q', '').strip()
    if len(q) < 2:
        return jsonify([])
    users = User.query.filter(
        User.email.isnot(None),
        (User.email.ilike(f'%{q}%') | User.username.ilike(f'%{q}%'))
    ).limit(8).all()
    return jsonify([{'email': u.email, 'username': u.username} for u in users])


@admin_bp.route('/mail-users', methods=['POST'])
@admin_required
def mail_users():
    """Send bulk email — fires in background thread, returns immediately."""
    import threading
    data    = request.get_json(silent=True) or {}
    subject = data.get('subject', '').strip()
    body    = data.get('body', '').strip()
    target  = data.get('target', 'active')

    if not subject or not body:
        return jsonify({'success': False, 'error': 'Konu ve mesaj zorunludur.'}), 400

    if target == 'all':
        users = User.query.filter(User.email != None).all()
    else:
        users = User.query.filter_by(is_active=True).filter(User.email != None).all()

    if not users:
        return jsonify({'success': False, 'error': 'Gondesilecek uye bulunamadi.'}), 400

    recipient_emails = [u.email for u in users]
    count = len(recipient_emails)

    html_template = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:32px;">
    <h1 style="color:#818cf8;margin-top:0;font-size:1.4rem;">OmniNexus</h1>
    <div style="color:#e2e8f0;font-size:15px;line-height:1.7;white-space:pre-line;">{BODY}</div>
    <hr style="border:none;border-top:1px solid #334155;margin:24px 0;">
    <p style="color:#475569;font-size:12px;margin:0;">
      Bu e-posta OmniNexus ekibi tarafindan gonderilmistir.<br>
      <a href="https://www.omninexsus.com" style="color:#6366f1;">www.omninexsus.com</a>
    </p>
  </div>
</body></html>"""

    html_content = html_template.replace('{BODY}', body)
    app = current_app._get_current_object()

    def send_bulk():
        with app.app_context():
            for email in recipient_emails:
                try:
                    msg = Message(
                        subject=subject,
                        recipients=[email],
                        html=html_content
                    )
                    mail.send(msg)
                except Exception as e:
                    app.logger.error(f"[mail-users] {email}: {e}")

    t = threading.Thread(target=send_bulk, daemon=True)
    t.start()

    return jsonify({
        'success': True,
        'message': f'{count} kisiiye mail gonderimi baslatildi. Arka planda devam ediyor.'
    })
