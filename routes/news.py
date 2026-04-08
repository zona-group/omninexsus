from flask import Blueprint, jsonify, request, current_app, Response, render_template, redirect, url_for
from flask_login import login_required, current_user
from app import db
from models import SavedArticle
import requests
import hashlib
import time
import re
import feedparser
from datetime import datetime, timezone, timedelta

news = Blueprint('news', __name__)

_cache = {}

# RSS feeds mapped to categories
RSS_FEEDS = {
    'general': [
        'http://feeds.bbci.co.uk/news/rss.xml',
        'https://www.aljazeera.com/xml/rss/all.xml',
        'https://www.trtworld.com/rss',
        'https://feeds.skynews.com/feeds/rss/home.xml',
    ],
    'technology': [
        'http://feeds.bbci.co.uk/news/technology/rss.xml',
        'https://feeds.feedburner.com/TechCrunch/',
        'https://www.theverge.com/rss/index.xml',
        'https://www.wired.com/feed/rss',
    ],
    'business': [
        'http://feeds.bbci.co.uk/news/business/rss.xml',
        'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
        'https://www.ft.com/?format=rss',
    ],
    'science': [
        'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
        'https://www.sciencedaily.com/rss/all.xml',
        'https://www.newscientist.com/feed/home/',
    ],
    'health': [
        'http://feeds.bbci.co.uk/news/health/rss.xml',
        'https://www.medicalnewstoday.com/rss/word',
        'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
    ],
    'sports': [
        'http://feeds.bbci.co.uk/news/sport/rss.xml',
        'https://www.espn.com/espn/rss/news',
        'https://www.skysports.com/rss/12040',
    ],
    'entertainment': [
        'http://feeds.bbci.co.uk/news/entertainment_arts/rss.xml',
        'https://variety.com/feed/',
        'https://deadline.com/feed/',
    ],
}

# Category fallback images (Unsplash)
CATEGORY_IMAGES = {
    'general':       'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
    'technology':    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    'business':      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    'science':       'https://images.unsplash.com/photo-1532094349884-543559be69d2?w=600&q=80',
    'health':        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    'sports':        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
    'entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; OmniNexus/1.0; +https://omninexsus.com)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
}


def _cache_get(key):
    entry = _cache.get(key)
    if entry:
        ts, data = entry
        ttl = current_app.config.get('NEWS_CACHE_MINUTES', 15) * 60
        if time.time() - ts < ttl:
            return data
    return None


def _cache_set(key, data):
    _cache[key] = (time.time(), data)


def _get_image(entry):
    """Extract best image URL from an RSS entry."""
    # media:thumbnail (BBC, Reuters)
    if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
        url = entry.media_thumbnail[0].get('url', '')
        if url:
            return url
    # media:content
    if hasattr(entry, 'media_content') and entry.media_content:
        for m in entry.media_content:
            if m.get('url'):
                t = m.get('type', '')
                if not t or 'image' in t:
                    return m['url']
    # enclosures
    if hasattr(entry, 'enclosures') and entry.enclosures:
        for enc in entry.enclosures:
            href = enc.get('href', enc.get('url', ''))
            if href and 'image' in enc.get('type', 'image'):
                return href
    # links with image type
    if hasattr(entry, 'links'):
        for link in entry.links:
            if 'image' in link.get('type', ''):
                return link.get('href', '')
    # Try to find img tag in summary
    if hasattr(entry, 'summary'):
        match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', entry.summary)
        if match:
            return match.group(1)
    return ''


def _parse_date(entry):
    """Parse entry date to ISO 8601 string."""
    for attr in ('published_parsed', 'updated_parsed'):
        val = getattr(entry, attr, None)
        if val:
            try:
                dt = datetime(val[0], val[1], val[2], val[3], val[4], val[5],
                              tzinfo=timezone.utc)
                return dt.isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def _fetch_feed(feed_url):
    """Fetch and parse a single RSS feed, returns feedparser object or None."""
    try:
        resp = requests.get(feed_url, headers=HEADERS, timeout=8)
        if resp.status_code == 200:
            return feedparser.parse(resp.content)
    except Exception:
        pass
    try:
        # Fallback: let feedparser handle it directly
        return feedparser.parse(feed_url)
    except Exception:
        return None

def fetch_rss_articles(category='general', page_size=20, page=1):
    """Fetch and aggregate articles from RSS feeds for the given category."""
    cache_key = f'rss_{category}_{page}'
    cached = _cache_get(cache_key)
    if cached:
        return cached

    feeds = RSS_FEEDS.get(category, RSS_FEEDS['general'])
    fallback_img = CATEGORY_IMAGES.get(category, CATEGORY_IMAGES['general'])

    all_articles = []
    seen_urls = set()

    for feed_url in feeds:
        feed = _fetch_feed(feed_url)
        if not feed or not hasattr(feed, 'entries'):
            continue

        source_name = ''
        if hasattr(feed, 'feed'):
            source_name = feed.feed.get('title', '')
        if not source_name:
            try:
                source_name = feed_url.split('/')[2].replace('www.', '').replace('feeds.', '')
            except Exception:
                source_name = 'News'

        for entry in feed.entries[:15]:
            url = entry.get('link', '')
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)

            img = _get_image(entry) or fallback_img

            description = ''
            if hasattr(entry, 'summary'):
                description = re.sub(r'<[^>]+>', '', entry.summary).strip()
                description = re.sub(r'\s+', ' ', description)[:400]

            published_at = _parse_date(entry)

            article = {
                'id': hashlib.md5(url.encode()).hexdigest(),
                'title': entry.get('title', '').strip(),
                'description': description,
                'url': url,
                'urlToImage': img,
                'publishedAt': published_at,
                'source': {'id': None, 'name': source_name},
            }
            all_articles.append(article)

    # Sort by newest first
    all_articles.sort(key=lambda a: a.get('publishedAt', ''), reverse=True)

    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    page_articles = all_articles[start:end]

    result = {'articles': page_articles, 'totalResults': len(all_articles)}
    _cache_set(cache_key, result)
    return result


def fetch_news(category='general', country='us', page_size=20, page=1):
    """Main news fetch function - now powered by RSS feeds."""
    return fetch_rss_articles(category=category, page_size=page_size, page=page)


@news.route('/')
def index():
    category = request.args.get('category', 'general')
    country  = request.args.get('country', 'us')
    page     = int(request.args.get('page', 1))
    return jsonify(fetch_news(category, country, page=page))


@news.route('/imgproxy')
def img_proxy():
    """Proxy news images to avoid CORS/hotlink issues."""
    url = request.args.get('url', '')
    if not url or not url.startswith('http'):
        return '', 400
    try:
        r = requests.get(url, timeout=8, stream=True,
                         headers={'User-Agent': 'Mozilla/5.0'})
        ct = r.headers.get('Content-Type', 'image/jpeg')
        return Response(r.content, content_type=ct,
                        headers={'Cache-Control': 'public, max-age=86400'})
    except Exception:
        return '', 502


@news.route('/search')
def search():
    q = request.args.get('q', '').strip().lower()
    if not q:
        return jsonify({'articles': [], 'error': 'Query required'})

    cache_key = f'search_{q}'
    cached = _cache_get(cache_key)
    if cached:
        return jsonify(cached)

    # Search across all categories
    all_articles = []
    seen_urls = set()
    for category in RSS_FEEDS:
        result = fetch_rss_articles(category=category, page_size=50, page=1)
        for a in result.get('articles', []):
            if a['url'] not in seen_urls:
                seen_urls.add(a['url'])
                all_articles.append(a)

    matched = [
        a for a in all_articles
        if q in a.get('title', '').lower() or q in a.get('description', '').lower()
    ]
    result = {'articles': matched[:20]}
    _cache_set(cache_key, result)
    return jsonify(result)

@news.route('/save', methods=['POST'])
@login_required
def save_article():
    data = request.get_json() or {}
    article_id = data.get('article_id')
    if not article_id:
        return jsonify({'success': False, 'error': 'article_id required'}), 400

    existing = SavedArticle.query.filter_by(
        user_id=current_user.id, article_id=article_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'success': True, 'saved': False})

    saved = SavedArticle(
        user_id=current_user.id,
        article_id=article_id,
        title=data.get('title', ''),
        url=data.get('url', ''),
        image=data.get('image', ''),
        source=data.get('source', '')
    )
    db.session.add(saved)
    db.session.commit()
    return jsonify({'success': True, 'saved': True})


@news.route('/read')
def read_article():
    """In-site article reader -- shows article metadata in a clean reader layout."""
    url        = request.args.get('url', '')
    title      = request.args.get('title', '')
    src        = request.args.get('src', '')
    img        = request.args.get('img', '')
    desc       = request.args.get('desc', '')
    date       = request.args.get('date', '')
    article_id = request.args.get('id', '')

    if not url:
        return redirect(url_for('main.index'))

    # Best-effort: extract article paragraphs for reader mode
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
            raw = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL | re.IGNORECASE)
            for raw_p in raw:
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
            'image': a.image,
            'source': a.source,
            'saved_at': a.saved_at.isoformat()
        } for a in articles
    ]})
