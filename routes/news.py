from flask import Blueprint, jsonify, request, current_app, Response
from flask_login import login_required, current_user
from app import db
from models import SavedArticle
import requests
import hashlib
import time

news = Blueprint('news', __name__)

_cache = {}

LANG_TO_COUNTRY = {
    'en': 'us', 'tr': 'tr', 'de': 'de', 'fr': 'fr',
    'es': 'mx', 'ja': 'jp', 'ar': 'ae', 'pt': 'br',
    'ru': 'ru', 'zh': 'cn',
}

CATEGORY_IMAGES = {
    'general': 'https://images.unsplash.com/photo-15047114349969-e33886168f5c?w=600&u=80',
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&u=80',
    'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&u=80'