from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import current_user
import requests

main = Blueprint('main', __name__)


@main.route('/')
def index():
    return render_template('index.html', user=current_user, config=current_app.config)


@main.route('/contact')
def contact():
    return render_template('contact.html', user=current_user, config=current_app.config)


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
