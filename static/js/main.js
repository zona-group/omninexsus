/* ===== OmniNexus — main.js v2 (Production) ===== */

/* --- Config --- */
const API_BASE = '';
const API_NEWS = API_BASE + '/api/news';
const API_TRANS = API_BASE + '/api/translate';
const API_COMM = API_BASE + '/api/comments';
const API_LOGIN = API_BASE + '/auth/ajax-login';
const API_REGISTER = API_BASE + '/auth/ajax-register';
const CATERYORY_LABELS = {
  general:       'Latest Headlines',    technology: 'Tech News',
  business:      'Business & Finance',  science:    'Science & Space',
  health:        'Health & Wellness',   sports:     'Sports Updates',
  entertainment: 'Entertainment',
};

/* --- State --- */
let state = {
  lang: 'en', cat: 'general', page: 1, hasMore: false,
  articles: [], currentArticleId: null, loading: false,
};

/* --- DOM Refs --- */
const el = {
  newsGrid:       document.getElementById('newsGrid'),
  heroSlot:       document.getElementById('heroSlot'),
  sectionTitle:   document.getElementById('sectionTitle'),
  loadMoreBtn:    document.getElementById('loadMoreBtn'),
  langSelect:     document.getElementById('langSelect'),
  searchInput:    document.getElementById('searchInput'),
  searchBtn:      document.getElementById('searchBtn'),
  toast:          document.getElementById('toast'),
  commentsPanel:  document.getElementById('commentsPanel'),
  commentsBody:   document.getElementById('commentsBody'),
  commentInput:   document.getElementById('commentInput'),
  submitComment:  document.getElementById('submitComment'),
  commentInputWrap:document.getElementById('commentInputWrap'),
  tickerInner:    document.getElementById('tickerInner'),
  loginModal:     document.getElementById('loginModal'),
  registerModal:  document.getElementById('registerModal'),
  loginEmail:     document.getElementById('loginEmail'),
  loginPassword:  document.getElementById('loginPassword'),
  loginRemember:  document.getElementById('loginRemember'),
  loginError:     document.getElementById('loginError'),
  regUsername:    document.getElementById('regUsername'),
  regEmail:       document.getElementById('regEmail'),
  regPassword:    document.getElementById('regPassword'),
  regError:       document.getElementById('registerError'),
};

/* --- Util --- */
const fmtTime = dt => {
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  const diff = Date.now() - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff/60000)+'m ago';
  if (diff < 86400000) return Math.floor(diff/3600000)+'h ago';
  return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
};

const showToast = (msg, dur = 2500) => {
  if (!el.toast) return;
  el.toast.textContent = msg;
  el.toast.classList.remove('hidden');
  setTimeout(() => el.toast.classList.add('hidden'), dur);
};

const imgFallback = i => { i.style.display = 'none'; };

/* --- Fetch with retry --- */
await async function fetchJ(url, opts, retries=2) {
  for (let i=0; i<=retries; i++) {
    try {
      const r = await fetch(url, opts);
      if (!r.ok && r.status < 500) return r;
      if (r.ok) return r;
    } catch(e) { if (i === retries) throw e; }
    await new Promise(r => setTimeout(r, 300*(i+1)));
  }
}

/* --- News Fetch --- */
async function loadNews(reset=true) {
  if (state.loading) return;
  state.loading = true;
  if (reset) { state.page=1; state.articles=[]; }

  const params = new URLSearchParams({
    category: state.cat, lang: state.lang, page: state.page,
  });
  if (state.search) params.set('q', state.search);

  try {
    const res = await fetchJ(API_NEWS + '?' + params);
    const data = await res.json();
    state.articles = reset ? data.articles : [...state.articles, ...data.articles];
    state.hasMore = data.has_more;
    renderNews(reset);
  } catch(e) {
    showToast('🙡 Failed to load news. Retrying...');
    if (reset) el.newsGrid.innerHTML = '<p style="color:var(--text2);padding:32px">Unable to load news. Please refresh.</p>';
  } finally { state.loading = false; }
}

/* --- Render News --- */
function renderNews(reset) {
  if (el.sectionTitle) el.sectionTitle.textContent = CATERYORY_LABELS[state.cat] || 'Latest';
  const arts = state.articles;

  if (!arts.length) {
    el.newsGrid.innerHTML = '<p style="color:var(--text2);padding:32px">No news found for this selection.</p>';
    if (el.heroSlot) el.heroSlot.innerHTML = '';
    if (el.loadMoreBtn) el.loadMoreBtn.style.display = 'none';
    return;
  }

  /* Hero */
  if (reset && el.heroSlot) {
    const h = arts[0];
    el.heroSlot.innerHTML = `
      <div class="hero-card" onclick="window.open('${h.url}','_blank')">
        ${h.image_url ? `<img class="hero-img" src="${h.image_url}" alt="" onerror="imgFallback(this)">` : ''}
        <div class="hero-overlay">
          <div class="hero-src">${h.source || '🌍 Breaking'}</div>
          <div class="hero-title">${h.title}</div>
          <div class="hero-meta">${fmtTime(h.published_at)}</div>
        </div>
      </div>`;
  }

  /* Grid */
  const gridArts = reset ? arts.slice(1) : arts.slice(arts.length - (arts.length - state.articles.length + (arts.length - 1)));
  const targetArts = reset ? arts.slice(1) : state.articles.slice(reset ? 1 : -(arts.length));

  if (reset) el.newsGrid.innerHTML = '';

  const frag = document.createDocumentFragment();
  const renderArts = reset ? arts.slice(1) : arts;
  renderArts.forEach((a, idx) => {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.setAttribute('data-id', a.id);
    card.innerHTML = `
      <div class="news-img-wrap">
        ${a.image_url ? `<img src="${a.image_url}" alt="" onerror="imgFallback(this)">` : '<div style="height:175px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:2.5rem">🌍</div>'}
      </div>
      <div class="news-body">
        <div class="news-src">${a.source || 'News'}</div>
        <div class="news-title">${a.title}</div>
        ${a.description ? `<div class="news-desc">${a.description}</div>` : ''}
        <div class="news-footer">
          <span>${fmtTime(a.published_at)}</span>
          <button class="news-comments" data-id="${a.id}">
            <span>💬</span> <span class="cnt-${a.id}">0</span>
          </button>
        </div>
      </div>`;
    card.addEventListener('click', evt => {
      if (evt.target.closest('.news-comments')) return;
      window.open(a.url, '_blank');
    });
    frag.appendChild(card);
  });

  el.newsGrid.appendChild(frag);

  /* Comment buttons */
  document.querySelectorAll('.news-comments').forEach(btn => {
    btn.addEventListener('click', () => openComments(btn.dataset.id));
  });

  if (el.loadMoreBtn) el.loadMoreBtn.style.display = state.hasMore ? 'inline-flex' : 'none';
  loadCommentCounts();
}

/* --- Comment Counts --- */
function loadCommentCounts() {
  document.querySelectorAll('.news-comments').forEach(btn => {
    const id = btn.dataset.id;
    fetch(API_COMM + '/count/' + id)
      .then(r => r.json())
      .then(d => {
        const span = document.querySelector('span.cnt-' + id);
        if (span) span.textContent = d.count || 0;
      }).catch(() => {});
  });
}

/* --- Comments Panel --- */
async function openComments(id) {
  state.currentArticleId = id;
  el.commentsPanel.classList.remove('hidden');
  el.commentsBody.innerHTML = '<p style="color:var(--text2);padding:16px">Loading...</p>';
  try {
    const r = await fetch(API_COMM + '/' + id);
    const d = await r.json();
    renderComments(d.comments);
  } catch(_) {
    el.commentsBody.innerHTML = '<p style="color:var(--text2);padding:16px">Failed to load comments.</p>';
  }
}

function renderComments(comments) {
  if (!comments.length) {
    el.commentsBody.innerHTML = '<p style="color:var(--text2);padding:16px">No comments yet. Be the first!</p>';
    return;
  }
  el.commentsBody.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-user">
        <div class="avatar-dot" style="width:28px;height:28px">${c.username[0].toUpperCase()}</div>
        <span>${c.username}</span>
        <span style="color:var(--text3);font-weight:400;font-size:0.7rem">${fmtTime(c.created_at)}</span>
      </div>
      <div class="comment-text">${c.text}</div>
    </div>`).join('');
}

window.closeComments = () => el.commentsPanel.classList.add('hidden');

/* --- Submit Comment --- */
if (el.submitComment) {
  el.submitComment.addEventListener('click', async () => {
    const text = el.commentInput.value.trim();
    if (!text) return;
    try {
      const r = await fetch(API_COMM + '/' + state.currentArticleId, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text}),
      });
      if (r.ok) {
        el.commentInput.value = '';
        await openComments(state.currentArticleId);
        showToast('✅ Comment posted!');
      } else {
        const d = await r.json();
        showToast(d.error || 'Failed');
      }
    } catch(_) { showToast('Failed to post'); }
  });
}

/* --- Modals --- */
window.openModal = name => {
  const m = document.getElementById(name);
  if (m) m.classList.remove('hidden');
};
window.closeModal = name => {
  const m = document.getElementById(name);
  if (m) m.classList.add('hidden');
};
window.switchModal = (from, to) => { closeModal(from); openModal(to); };

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.add('hidden');
  });
});

/* --- Auth --- */
window.doLogin = async () => {
  const email = el.loginEmail?.value.trim();
  const pass  = el.loginPassword?.value;
  const remem = el.loginRemember?.checked;
  if (!email || !pass) { showError('loginError', 'Enter email and password'); return; }
  try {
    const r = await fetch(API_LOGIN, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email, password:pass, remember:remem}),
    });
    const d = await r.json();
    if (d.ok) { location.reload(); } else { showError('loginError', d.error || 'Login failed'); }
  } catch(e) { showError('loginError', 'Network error'); }
};

window.doRegister = async () => {
  const user = el.regUsername?.value.trim();
  const email = el.regEmail?.value.trim();
  const pass  = el.regPassword?.value;
  if (!user || !email || !pass) { showError('registerError', 'All fields required'); return; }
  if (pass.length < 6) { showError('registerError', 'Password must be at least 6 chars'); return; }
  try {
    const r = await fetch(API_REGISTER, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({username:user, email, password:pass}),
    });
    const d = await r.json();
    if (d.ok) { location.reload(); } else { showError('registerError', d.error || 'Failed'); }
  } catch(e) { showError('registerError', 'Network error'); }
};

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

/* --- Lang / Cat --- */
if (el.langSelect) {
  el.langSelect.addEventListener('change', e => {
    state.lang = e.target.value;
    loadNews();
  });
}

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.cat = btn.dataset.cat;
    state.search = '';
    loadNews();
  });
});

if (el.loadMoreBtn) {
  el.loadMoreBtn.addEventListener('click', () => {
    state.page++;
    loadNews(false);
  });
}

/* --- Search --- */
if (el.searchBtn) {
  el.searchBtn.addEventListener('click', () => {
    state.search = el.searchInput.value.trim();
    loadNews();
  });
  el.searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') el.searchBtn.click();
  });
}

/* --- Ticker update from API --- */
async function updateTicker() {
  try {
    const r = await fetch(API_NEWS + '?category=general&lang=en&page=1');
    const d = await r.json();
    if (d.articles && d.articles.length && el.tickerInner) {
      const items = [...d.articles.slice(0,6), ...d.articles.slice(0,6)];
      el.tickerInner.innerHTML = items.map(a =>
        `<span class="ticker-item">${a.title.substr(0,70)}</span><span class="ticker-sep">◆</span>`
      ).join('');
    }
  } catch({});
}

/* --- Init --- */
loadNews();
updateTicker();
