from flask import Blueprint, jsonify, request, current_app, Response, render_template, redirect, url_for
from flask_login import login_required, current_user
from app import db
from models import SavedArticle
import requests
import hashlib
import time
import re
from datetime import datetime, timezone, timedelta

news = Blueprint('news', __name__)

_cache = {}

# Language code -> NewsAPI country code
LANG_TO_COUNTRY = {
    'en': 'us',
    'tr': 'tr',
    'de': 'de',
    'fr': 'fr',
    'es': 'mx',
    'ja': 'jp',
    'ar': 'ae',
    'pt': 'br',
    'ru': 'ru',
    'zh': 'cn',
}

# Category fallback images (Unsplash topic-based)
CATEGORY_IMAGES = {
    'general':       'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
    'technology':    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    'business':      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    'science':       'https://images.unsplash.com/photo-1532094349884-543559be69d2?w=600&q=80',
    'health':        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    'sports':        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
    'entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
}


def _cache_get(key):
    entry = _cache.get(key)
    if entry:
        ts, data = entry
        ttl = current_app.config.get('NEWS_CACHE_MINUTES', 5) * 60
        if time.time() - ts < ttl:
            return data
    return None


def _cache_set(key, data):
    _cache[key] = (time.time(), data)


def fetch_news(category='general', country='us', page_size=20, page=1):
    cache_key = f'{category}_{country}_{page}'
    cached = _cache_get(cache_key)
    if cached:
        return cached

    api_key = current_app.config.get('NEWS_API_KEY', '')
    if not api_key or api_key == 'YOUR_NEWSAPI_KEY_HERE':
        return {'articles': [], 'error': 'NewsAPI key not configured'}

    params = {
        'apiKey': api_key,
        'category': category,
        'country': country,
        'pageSize': page_size,
        'page': page,
    }
    try:
        resp = requests.get('https://newsapi.org/v2/top-headlines', params=params, timeout=10)
        data = resp.json()
        if data.get('status') == 'ok':
            articles = data.get('articles', [])
            fallback = CATEGORY_IMAGES.get(category, CATEGORY_IMAGES['general'])
            # Filter out articles older than 36 hours
            cutoff = datetime.now(timezone.utc) - timedelta(hours=36)
            fresh_articles = []
            for a in articles:
                published = a.get('publishedAt', '')
                try:
                    pub_dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
                    if pub_dt < cutoff:
                        continue
                except Exception:
                    pass
                url = a.get('url', '')
                a['id'] = hashlib.md5(url.encode()).hexdigest()
                if not a.get('urlToImage'):
                    a['urlToImage'] = fallback
                fresh_articles.append(a)
            articles = fresh_articles if fresh_articles else articles
            result = {'articles': articles, 'totalResults': len(articles)}
            _cache_set(cache_key, result)
            return result
        return {'articles': [], 'error': data.get('message', 'API error')}
    except Exception as e:
        return {'articles': [], 'error': str(e)}


@news.route('/')
def index():
    category = request.args.get('category', 'general')
    country  = request.args.get('country', 'us')
    page     = int(request.args.get('page', 1))
    return jsonify(fetch_news(category, country, page=page))


@news.route('/imgproxy')
def img_proxy():
    url = request.args.get('url', '')
    if not url or not url.startswith('http'):
        return '', 400
    try:
        r = requests.get(url, timeout=8, stream=True,
                         headers={'User-Agent': 'Mozilla/5.0', 'Referer': ''})
        ct = r.headers.get('Content-Type', 'image/jpeg')
        def gen():
            for chunk in r.iter_content(8192):
                yield chunk
        return Response(gen(), content_type=ct)
    except Exception:
        return '', 502


@news.route('/search')
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'articles': []})
    cached = _cache_get(f'search_{q}')
    if cached:
        return jsonify(cached)
    api_key = current_app.config.get('NEWS_API_KEY', '')
    try:
        resp = requests.get('https://newsapi.org/v2/everything',
            params={
                'apiKey': api_key, 'q': q,
                'sortBy': 'publishedAt', 'pageSize': 20,
                'language': 'en',
            },
            timeout=10
        )
        data = resp.json()
        if data.get('status') == 'ok':
            result = {'articles': data.get('articles', [])}
            _cache_set(f'search_{q}', result)
            return jsonify(result)
        return jsonify({'articles': []})
    except Exception as e:
        return jsonify({'articles': [], 'error': str(e)})


@news.route('/save', methods=['POST'])
@login_required
def save_article():
    try:
        data = request.get_json(silent=True) or {}
        article_id = data.get('article_id', '')
        title      = data.get('title', '')
        url        = data.get('url', '')
        img        = data.get('image', '')
        src        = data.get('source', '')
        desc       = data.get('description', '')
        if not article_id:
            return jsonify({'success': False, 'error': 'No article_id'}), 400
        existing = SavedArticle.query.filter_by(article_id=article_id, user_id=current_user.id).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'success': True, 'saved': False})
        art = SavedArticle(article_id=article_id, user_id=current_user.id,
        article_id=article_id,
        title=data.get('title', ''),
        url=data.get('url', ''),
        image_url=data.get('image', ''),
        source_name=data.get('source', ''),
        description=data.get('description', ''))
        db.session.add(art)
        db.session.commit()
        return jsonify({'success': True, 'saved': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@news.route('/read')
def read_article():
    url        = request.args.get('url', '')
    title      = request.args.get('title', '')
    src        = request.args.get('src', '')
    img        = request.args.get('img', '')
    desc       = request.args.get('desc', '')
    date       = request.args.get('date', '')
    article_id = request.args.get('id', '')
    if not url:
        return redirect(url_for('main.index'))
    extra_paragraphs = []
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        r = requests.get(url, headers=headers, timeout=6, allow_redirects=True)
        if r.status_code == 200:
            html = r.text
            html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html, flags=re.DOTALL | re.IGNORECASE)
            raw_tags = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL | re.IGNORECASE)
            for raw_p in raw_tags:
                text = re.sub(r'<[^>]+>', '', raw_p).strip()
                text = re.sub(r'\s+', ' ', text)
                if len(text) > 80:
                    extra_paragraphs.append(text)
                if len(extra_paragraphs) >= 12:
                    break
    except Exception:
        pass
    return render_template('article.html',
        url=url, title=title, src=src, img=img, desc=desc,
        date=date, article_id=article_id,
        extra_paragraphs=extra_paragraphs)


@news.route('/saved')
@login_required
def saved_articles():
    articles = SavedArticle.query.filter_by(user_id=current_user.id)\
        .order_by(SavedArticle.saved_at.desc()).all()
    return jsonify({'articles': [
        {
            'id': a.article_id,
            'title': a.title,
            'url': a.url,
            'image': a.image_url,
            'source': a.source_name,
            'saved_at': a.saved_at.isoformat()
        } for a in articles
    ]})
