from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import current_user
import requests

main = Blueprint('main', __name__)


@main.route('/contact', methods=['POST'])
def contact():
    from flask_mail import Message
    from app import mail

    data     = request.get_json(silent=True) or {}
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    message  = data.get('message', '').strip()
    msg_type = data.get('type', 'contact')   # 'contact' | 'isbirligi'

    if not name or not email or not message:
        return jsonify({'success': False, 'error': 'Tüm alanlar zorunludur.'}), 400
    if '@' not in email:
        return jsonify({'success': False, 'error': 'Geçersiz e-posta adresi.'}), 400

    admin_email = current_app.config.get('MAIL_USERNAME', '')

    if msg_type == 'isbirligi':
        recipient  = current_app.config.get('ISBIRLIGI_EMAIL') or admin_email
        subject    = f'\U0001f91d [İşbirliği] {name}'
        tag_label  = 'İşbirliği Teklifi'
        tag_color  = '#a855f7'
    else:
        recipient  = current_app.config.get('CONTACT_EMAIL') or admin_email
        subject    = f'\U0001f4ec [İletişim] {name}'
        tag_label  = 'Genel İletişim'
        tag_color  = '#6366f1'

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#1e293b;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:20px 32px;">
      <h1 style="margin:0;color:white;font-size:1.3rem;">⚡ OmniNexus</h1>
      <span style="background:{tag_color};color:white;padding:3px 12px;border-radius:20px;font-size:0.8rem;margin-top:8px;display:inline-block;">{tag_label}</span>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="color:#94a3b8;font-size:0.85rem;padding:6px 0;width:110px;">Ad Soyad</td><td style="color:#e2e8f0;font-weight:600;">{name}</td></tr>
        <tr><td style="color:#94a3b8;font-size:0.85rem;padding:6px 0;">E-posta</td><td><a href="mailto:{email}" style="color:#818cf8;">{email}</a></td></tr>
      </table>
      <div style="background:#0f172a;border-radius:8px;padding:20px;border-left:3px solid {tag_color};">
        <p style="color:#94a3b8;font-size:0.78rem;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em;">Mesaj</p>
        <p style="color:#e2e8f0;line-height:1.75;white-space:pre-line;margin:0;">{message}</p>
      </div>
      <a href="mailto:{email}" style="display:inline-block;margin-top:24px;background:{tag_color};color:white;padding:11px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.9rem;">↩ Yanıtla</a>
    </div>
    <div style="padding:14px 32px;border-top:1px solid #334155;">
      <p style="color:#475569;font-size:0.75rem;margin:0;">
        OmniNexus Contact Form — <a href="https://www.omninexsus.com" style="color:#6366f1;">www.omninexsus.com</a>
      </p>
    </div>
  </div>
</body></html>"""

    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            html=html_body,
            reply_to=email
        )
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Mesajınız iletildi! En kısa sürede geri döneceğiz.'})
    except Exception as e:
        current_app.logger.error(f"[contact] {e}")
        return jsonify({'success': False, 'error': 'Mail gönderilemedi. Lütfen tekrar deneyin.'}), 500


@main.route('/')
def index():
    return render_template('index.html', user=current_user, config=current_app.config)


@main.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    target_lang = data.get('target', 'en')

    google_key = current_app.config.get('GOOGLE_TRANSLATE_KEY', '')

    if google_key:
        try:
            resp = requests.post(
                'https://translation.googleapis.com/language/translate/v2',
                params={'key': google_key},
                json={'q': text, 'target': target_lang}
            )
            result = resp.json()
            translated = result['data']['translations'][0]['translatedText']
            return jsonify({'translated': translated})
        except Exception:
            pass

    # LibreTranslate fallback
    try:
        resp = requests.post(
            'https://libretranslate.de/translate',
            json={'q': text, 'source': 'auto', 'target': target_lang},
            timeout=5
        )
        result = resp.json()
        return jsonify({'translated': result.get('translatedText', text)})
    except Exception:
        return jsonify({'translated': text, 'error': 'Translation unavailable'})


@main.route('/health')
def health():
    return jsonify({'status': 'ok', 'app': 'OmniNexus'})
