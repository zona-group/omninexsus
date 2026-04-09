import os


def _build_db_url():
    """
    Railway MySQL plugin injects variables WITHOUT underscores:
      MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT, MYSQL_URL
    We also accept DATABASE_URL (set manually in Railway Variables).
    Priority: DATABASE_URL > MYSQL_URL > individual vars
    """
    # 1. Explicit DATABASE_URL (manually set or via Railway reference var)
    url = os.environ.get('DATABASE_URL', '')
    if url:
        if url.startswith('mysql://'):
            url = url.replace('mysql://', 'mysql+pymysql://', 1)
        return url

    # 2. MYSQL_URL injected by Railway MySQL plugin
    url = os.environ.get('MYSQL_URL', '')
    if url:
        if url.startswith('mysql://'):
            url = url.replace('mysql://', 'mysql+pymysql://', 1)
        return url

    # 3. Individual variables — Railway MySQL plugin uses NO-underscore names
    host     = (os.environ.get('MYSQLHOST')     or os.environ.get('MYSQL_HOST',     'localhost'))
    user     = (os.environ.get('MYSQLUSER')     or os.environ.get('MYSQL_USER',     'root'))
    password = (os.environ.get('MYSQLPASSWORD') or os.environ.get('MYSQL_PASSWORD', ''))
    database = (os.environ.get('MYSQLDATABASE') or os.environ.get('MYSQL_DB',       'railway'))
    port     = (os.environ.get('MYSQLPORT')     or os.environ.get('MYSQL_PORT',     '3306'))

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'omninexus-secret-key-change-in-production'

    SQLALCHEMY_DATABASE_URI = _build_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,        # Test connections before using them
        'pool_recycle': 280,          # Recycle connections every ~5 min
        'connect_args': {'connect_timeout': 10},
    }

    # NewsAPI — https://newsapi.org
    NEWS_API_KEY = os.environ.get('NEWS_API_KEY', 'YOUR_NEWSAPI_KEY_HERE')
    NEWS_CACHE_MINUTES = 5

    # Google Translate API (optional)
    GOOGLE_TRANSLATE_KEY = os.environ.get('GOOGLE_TRANSLATE_KEY', '')

    # Google OAuth (optional — add in Railway Variables to enable)
    GOOGLE_CLIENT_ID     = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

    # ── Flask-Mail (SMTP) ──────────────────────────────────────────────────────
    MAIL_SERVER   = os.environ.get('MAIL_SERVER',   'smtp.gmail.com')
    MAIL_PORT     = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS  = os.environ.get('MAIL_USE_TLS',  'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@omminexsus.com')
    SITE_URL         = os.environ.get('SITE_URL', 'https://www.omninexsus.com')
    CONTACT_EMAIL    = os.environ.get('CONTACT_EMAIL', '')    # genel iletisim -> defaults to MAIL_USERNAME
    ISBIRLIGI_EMAIL  = os.environ.get('ISBIRLIGI_EMAIL', '')  # isbirligi     -> defaults to MAIL_USERNAME

    # ── VAPID Push Notifications ───────────────────────────────────────────────
    VAPID_PUBLIC_KEY  = os.environ.get('VAPID_PUBLIC_KEY',  'BFpiirOZsoMKpDenm9Lr8rqLmWms4vc3IrjRO8KSj1AUCqpDFrFjbCh0AGp92mnKKy_R2YJIe-kbaCj7AMFhwSA')
    VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', '0PS0l-BioW2ILRUkqYH70nms1imBikOmrdKHqhDvL10')
    VAPID_CLAIMS      = {'sub': 'mailto:' + os.environ.get('MAIL_USERNAME', 'admin@omninexsus.com')}

    # Supported languages
    LANGUAGES = ['en', 'tr', 'de', 'ja', 'fr', 'es']
    BABEL_DEFAULT_LOCALE = os.environ.get('BABEL_DEFAULT_LOCALE', 'tr')
