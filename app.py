import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_babel import Babel
from authlib.integrations.flask_client import OAuth
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = SQLAlchemy()
login_manager = LoginManager()
babel = Babel()
oauth = OAuth()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Log which DB URL is being used (mask password)
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    import re
    masked = re.sub(r'://([^:]+):([^@]+)@', r'://\1:***@', db_url)
    logger.info(f"[OmniNexus] Connecting to DB: {masked}")

    db.init_app(app)
    login_manager.init_app(app)
    babel.init_app(app)
    oauth.init_app(app)

    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'

    # Register Google OAuth if credentials are configured
    if app.config.get('GOOGLE_CLIENT_ID') and app.config.get('GOOGLE_CLIENT_SECRET'):
        oauth.register(
            name='google',
            client_id=app.config.get('GOOGLE_CLIENT_ID'),
            client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid email profile'},
        )
        logger.info("[OmniNexus] Google OAuth configured.")
    else:
        logger.info("[OmniNexus] Google OAuth not configured (GOOGLE_CLIENT_ID/SECRET missing).")

    from routes.main import main as main_bp
    from routes.auth import auth as auth_bp
    from routes.news import news as news_bp
    from routes.comments import comments as comments_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(news_bp, url_prefix='/news')
    app.register_blueprint(comments_bp, url_prefix='/comments')

    with app.app_context():
        try:
            db.create_all()
            # Add new columns if they don't exist (migration-safe)
            _safe_migrate(db)
            logger.info("[OmniNexus] Database tables created/verified successfully.")
        except Exception as e:
            logger.error(f"[OmniNexus] DB init failed: {e}")

    return app


def _safe_migrate(db):
    """Add new columns to existing tables without breaking existing data."""
    try:
        with db.engine.connect() as conn:
            # Add google_id column if missing
            try:
                conn.execute(db.text(
                    "ALTER TABLE users ADD COLUMN google_id VARCHAR(128) UL¢ÑUQUUCHUNE NULL"
                ))
                conn.commit()
                logger.info("[OmniNexus] Added google_id column to users table.")
            except Exception:
                pass  # Column already exists
            # Make password_hash nullable if not already
            try:
                conn.execute(db.text(
                    "ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(256) NULL"
                ))
                conn.commit()
            except Exception:
                pass
            # Extend avatar column
            try:
                conn.execute(db.text(
                    "ALTER TABLE users MODIFY COLUMN avatar VARCHAR(500) NULL DEFAULT ''"
                ))
                conn.commit()
            except Exception:
                pass
    except Exception as e:
            logger.warning(f"[OmniNexus] Migration warning: {e}")


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
