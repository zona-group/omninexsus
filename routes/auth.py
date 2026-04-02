import secrets
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from app import db, oauth
from models import User

auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        remember = bool(data.get('remember', False))

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password) and user.is_active:
            login_user(user, remember=remember)
            if request.is_json:
                return jsonify({'success': True, 'username': user.username})
            return redirect(url_for('main.index'))

        if request.is_json:
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
        flash('Invalid email or password.', 'error')

    return render_template('auth/login.html')


@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            msg = 'All fields are required.'
            if request.is_json:
                return jsonify({'success': False, 'error': msg}), 400
            flash(msg, 'error')
            return render_template('auth/register.html')

        if User.query.filter_by(email=email).first():
            msg = 'Email already registered.'
            if request.is_json:
                return jsonify({'success': False, 'error': msg}), 400
            flash(msg, 'error')
            return render_template('auth/register.html')

        if User.query.filter_by(username=username).first():
            msg = 'Username already taken.'
            if request.is_json:
                return jsonify({'success': False, 'error': msg}), 400
            flash(msg, 'error')
            return render_template('auth/register.html')

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        if request.is_json:
            return jsonify({'success': True, 'username': user.username})
        return redirect(url_for('main.index'))

    return render_template('auth/register.html')


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))


@auth.route('/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    if request.method == 'PUT':
        data = request.get_json(silent=True) or {}
        bio = data.get('bio', current_user.bio)
        avatar = data.get('avatar', current_user.avatar)
        current_user.bio = bio[:300]
        current_user.avatar = avatar[:500]
        db.session.commit()
        return jsonify({'success': True})
    return render_template('auth/profile.html', user=current_user)


@auth.route('/google')
def google_login():
    if not current_app.config.get('GOOGLE_CLIENT_ID'):
        flash('Google login is not configured.', 'error')
        return redirect(url_for('main.index'))
    redirect_uri = url_for('auth.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@auth.route('/google/callback')
def google_callback():
    if not current_app.config.get('GOOGLE_CLIENT_ID'):
        return redirect(url_for('main.index'))

    try:
        token = oauth.google.authorize_access_token()
        userinfo = token.get('userinfo') or oauth.google.userinfo()
    except Exception as e:
        flash(f'Google login failed: {e}', 'error')
        return redirect(url_for('main.index'))

    google_id = str(userinfo.get('sub', ''))
    email     = (userinfo.get('email') or '').strip().lower()
    name      = userinfo.get('name') or email.split('@')[0]
    avatar    = userinfo.get('picture') or ''

    if not google_id or not email:
        flash('Could not retrieve account info from Google.', 'error')
        return redirect(url_for('main.index'))

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=email).first()

    if user:
        if not user.google_id:
            user.google_id = google_id
        if avatar and not user.avatar:
            user.avatar = avatar
        db.session.commit()
    else:
        username = _unique_username(name)
        user = User(username=username,email=email,google_id=google_id,avatar=avatar)
        db.session.add(user)
        db.session.commit()

    login_user(user, remember=True)
    return redirect(url_for('main.index'))


def _unique_username(base):
    import re
    slug = re.sub(r'[^a-zA-Z0-9_]', '', base.replace(' ', '_'))[:32] or 'user'
    username = slug
    i = 1
    while User.query.filter_by(username=username).first():
        username = f"{slug}{i}"
        i += 1
    return username
