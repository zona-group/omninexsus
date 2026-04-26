const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const port = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = "OmniNexus <onboarding@resend.dev>";
const SITE_URL = 'https://www.omninexsus.com';

const mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

// Google News RSS - in-memory cache (5 min TTL)
const newsCache = {};
const NEWS_CACHE_TTL = 5 * 60 * 1000;

const ogImageCache = {};
const welcomedEmails = new Set();

// MySQL connection pool
const dbUrl = (process.env.DATABASE_URL || '').replace('mysql+pymysql://', 'mysql://');
let pool = null;
if (dbUrl) { try { const u = new URL(dbUrl); pool = mysql.createPool({ host: u.hostname, port: parseInt(u.port) || 3306, user: u.username, password: u.password, database: u.pathname.slice(1), waitForConnections: true, connectionLimit: 10 }); console.log('MySQL pool created'); } catch(e) { console.error('MySQL pool error:', e.message); } }
const userArticles = [];

async function fetchOGImage(url, fallback, timeoutMs = 4000) {
  if (ogImageCache[url]) return ogImageCache[url];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    });
    clearTimeout(timer);
    const html = await resp.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
           || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    const img = (m && m[1] && m[1].startsWith('http')) ? m[1] : fallback;
    ogImageCache[url] = img;
    return img;
  } catch (e) {
    return fallback;
  }
}

const GNEWS_RSS = {
    general: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
    business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
    gaming: 'https://news.google.com/rss/search?q=gaming+video+games+esports&hl=en-US&gl=US&ceid=US:en',
    hardware: 'https://news.google.com/rss/search?q=PC+hardware+GPU+CPU+processor&hl=en-US&gl=US&ceid=US:en',
    sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
};

// Image pools per category - picked by title hash for variety
const IMAGE_POOLS = {
  general: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800',
    'https://images.unsplash.com/photo-1557992260-ec58e38d363c?w=800',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
    'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=800',
    'https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?w=800',
  ],
  technology: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  ],
  business: [
    'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800',
    'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
  ],
  gaming: [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800',
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800',
  ],
  hardware: [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'https://images.unsplash.com/photo-1562976540-1502c2145851?w=800',
    'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800',
  ],
 sports: [
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    'https://images.unsplash.com/photo-1567879640-87bcfe9459aa?w=800',
  ],
};
function pickImage(category, title) {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.general;
  let hash = 0;
  for (let i = 0; i < title.length; i++) { hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff; }
  return pool[Math.abs(hash) % pool.length];
}

async function sendEmail(to, subject, html) {
    const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
                  'Authorization': 'Bearer ' + RESEND_API_KEY,
                  'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, html }),
    });
    const data = await res.json();
    console.log('Email send result:', res.status, JSON.stringify(data));
    return { ok: res.ok, status: res.status, data };
}

function readBody(req) {
    return new Promise((resolve) => {
          let body = '';
          req.on('data', (chunk) => { body += chunk.toString(); });
          req.on('end', () => resolve(body));
    });
}

http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                    if (req.method === 'OPTIONS') {
                          res.writeHead(200);
                          res.end();
                          return;
                    }

                    // Auth routes
if (req.method === 'POST' && url === '/api/auth/register') {
  try {
    const {name,email,password} = JSON.parse(await readBody(req));
    if (!name||!email||!password) {res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Missing fields'}));return;}
    if (!pool) {res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'DB unavailable'}));return;}
    const hash = require('crypto').createHash('sha256').update(password).digest('hex');
    const id = 'u_'+Date.now();
    const av = 'https://ui-avatars.com/api/?name='+encodeURIComponent(name)+'&background=6366f1&color=fff';
    try { await pool.execute('INSERT INTO users (id,name,email,password_hash,avatar,created_at) VALUES (?,?,?,?,?,NOW())',[id,name,email,hash,av]); }
    catch(de) { if(de.code==='ER_DUP_ENTRY'){res.writeHead(409,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Email already registered'}));return;} throw de; }
    const [[user]] = await pool.execute('SELECT id,name,email,avatar,created_at FROM users WHERE email=?',[email]);
    res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({user})); return;
  } catch(e) {res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));return;}
}
if (req.method === 'POST' && url === '/api/auth/login') {
  try {
    const {email,password} = JSON.parse(await readBody(req));
    if (!pool) {res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'DB unavailable'}));return;}
    const hash = require('crypto').createHash('sha256').update(password||'').digest('hex');
    const [[user]] = await pool.execute('SELECT id,name,email,avatar,created_at FROM users WHERE email=? AND password_hash=?',[email,hash]);
    if (!user) {res.writeHead(401,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Invalid email or password'}));return;}
    res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({user})); return;
  } catch(e) {res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));return;}
}
if (req.method === 'POST' && url === '/api/auth/google') {
  try {
    const {email,name,avatar,googleId} = JSON.parse(await readBody(req));
    if (!pool) {res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'DB unavailable'}));return;}
    const [[existing]] = await pool.execute('SELECT id,name,email,avatar,created_at FROM users WHERE email=?',[email]);
    if (existing) {res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({user:existing,isNew:false}));return;}
    const id = 'g_'+(googleId||Date.now());
    await pool.execute('INSERT INTO users (id,name,email,avatar,created_at) VALUES (?,?,?,?,NOW())',[id,name,email,avatar]);
    const [[user]] = await pool.execute('SELECT id,name,email,avatar,created_at FROM users WHERE email=?',[email]);
    res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({user,isNew:true})); return;
  } catch(e) {res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));return;}
}
// Google News RSS proxy endpoint
                    if (req.method === 'GET' && url === '/api/news') {
                          const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
                          const params = new URLSearchParams(qs);
                          const category = params.get('category') || 'general';
                          const validCat = GNEWS_RSS[category] ? category : 'general';

      // Serve from cache if fresh
      const cached = newsCache[validCat];
                          if (cached && (Date.now() - cached.time) < NEWS_CACHE_TTL) {
                                  res.writeHead(200, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify(cached.data));
                                  return;
                          }

      try {
              const rssUrl = GNEWS_RSS[validCat];
              const rssRes = await fetch(rssUrl, {
                        headers: {
                                    'User-Agent': 'Mozilla/5.0 (compatible; OmniNexus/1.0)',
                                    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                        },
              });

                            if (!rssRes.ok) throw new Error('RSS fetch failed: ' + rssRes.status);
              const xml = await rssRes.text();

                            let items = [];
              const itemRegex = /<item>([\s\S]*?)<\/item>/g;
              let match;
              let idx = 0;

                            while ((match = itemRegex.exec(xml)) !== null && idx < 25) {
                                      const itemXml = match[1];

                // Title
                const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
                                      let title = titleMatch ? titleMatch[1].trim() : '';
                                      title = title
                                        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                                        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");

                if (!title) { idx++; continue; }

                // Source name
                const sourceTagMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);
                                      let sourceName = sourceTagMatch ? sourceTagMatch[1].trim() : '';

                // Google News title format: "Headline - Source Name"
                if (!sourceName && title.includes(' - ')) {
                            const parts = title.split(' - ');
                            sourceName = parts[parts.length - 1].trim();
                            title = parts.slice(0, -1).join(' - ').trim();
                }
                                      if (!sourceName) sourceName = 'Google News';

                // Link
                const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
                                      const link = linkMatch ? linkMatch[1].trim() : '';

                // PubDate
                const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
                                      let publishedAt = new Date().toISOString();
                                      if (pubDateMatch) {
                                                  try { publishedAt = new Date(pubDateMatch[1].trim()).toISOString(); } catch (e) {}
                                      }

                // Description - decode entities, extract image, then strip HTML
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
        let rawDesc = descMatch ? descMatch[1] : '';
        rawDesc = rawDesc
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        // Extract image from description <img> tag before stripping HTML
        let urlToImage = pickImage(validCat, title);
        const imgTagMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgTagMatch && imgTagMatch[1] && !imgTagMatch[1].includes('1x1')) {
          urlToImage = imgTagMatch[1];
        }
        // Also check media:thumbnail in item XML
        const mediaThumbnailMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
        if (mediaThumbnailMatch) { urlToImage = mediaThumbnailMatch[1]; }
        // Track if description contained an article-specific image
        const hasDescImage = !!(imgTagMatch && imgTagMatch[1] && !imgTagMatch[1].includes('1x1')) || !!mediaThumbnailMatch;
        // Extract real source article URL from description href (bypasses Google News redirect)
        const descHrefMatch = rawDesc.match(/<a[^>]+href=["'](https?:\/\/(?!news\.google)[^"']+)["']/i);
        const realUrl = descHrefMatch ? descHrefMatch[1] : '';
        let description = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (description.length > 300) description = description.substring(0, 297) + '...';
        if (!description || description.length < 10) description = title;

        items.push({
          id: 'gnews_' + validCat + '_' + idx,
          title,
          description,
          url: link,
          urlToImage,
          hasDescImage,
          realUrl,
                            publishedAt,
                            source: { name: sourceName },
                            author: sourceName,
                            content: description,
                            category: validCat,
                });
                                      idx++;
                            }

                            // Fetch real og:image for each article in parallel
  const imageResults = await Promise.all(
    items.map((item, i) => {
      // If description already had an article image, use it directly
      // Google RSS thumbnails skipped - use OG image or Unsplash instead
      // Otherwise fetch OG image from real article URL (not Google redirect)
      return (item.hasDescImage && item.urlToImage && !item.urlToImage.includes('news.google.com')) ? item.urlToImage : (IMAGE_POOLS[validCat]||IMAGE_POOLS.general)[i%(IMAGE_POOLS[validCat]||IMAGE_POOLS.general).length];
      // fetchOGImage removed - using Unsplash pool instead
    })
  );
  items = items.map((item, i) => ({ ...item, urlToImage: imageResults[i] }));

  newsCache[validCat] = { data: items, time: Date.now() };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(items));
      } catch (e) {
              console.error('News RSS error:', e.message);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify([]));
      }
                          return;
                    }

                    // Welcome email after registration
                    if (req.method === 'POST' && url === '/api/email/welcome') {
                          try {
                                  const { name, email } = JSON.parse(await readBody(req));
                                          if (welcomedEmails.has(email)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, alreadySent: true }));
          return;
        }
        welcomedEmails.add(email);
                                  const html = `
                                          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:40px;border-radius:12px">
                                                    <div style="margin-bottom:24px">
                                                                <span style="font-size:24px;font-weight:bold;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">OmniNexus</span>
                                                                          </div>
                                                                                    <h2 style="color:#c4b5fd;margin-bottom:8px">Hos Geldiniz, ${name}!</h2>
                                                                                              <p style="color:#a1a1aa;line-height:1.7;font-size:15px">
                                                                                                          OmniNexus'a uye oldugunuz icin tesekkurler. Artik dunyadan gercek zamanli haberlere erisebilirsiniz.
                                                                                                                    </p>
                                                                                                                              <a href="${SITE_URL}" style="display:inline-block;margin-top:28px;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px">
                                                                                                                                          Haberleri Kesf Et
                                                                                                                                                    </a>
                                                                                                                                                              <hr style="border:none;border-top:1px solid #27272a;margin:32px 0">
                                                                                                                                                                        <p style="color:#52525b;font-size:12px">2026 OmniNexus - <a href="${SITE_URL}" style="color:#6366f1;text-decoration:none">www.omninexsus.com</a></p>
                                                                                                                                                                                </div>`;
                                  const result = await sendEmail(email, "OmniNexus'a Hos Geldiniz!", html);
                                  res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify({ success: result.ok, resendData: result.data }));
                          } catch (e) {
                                  console.error('Welcome email error:', e);
                                  res.writeHead(500, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify({ success: false, error: e.message }));
                          }
                          return;
                    }

                    // Password reset email
                    if (req.method === 'POST' && url === '/api/email/reset-password') {
                          try {
                                  const { email, token, name } = JSON.parse(await readBody(req));
                                  const resetUrl = SITE_URL + '/reset-password?token=' + encodeURIComponent(token);
                                  const html = `
                                          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:40px;border-radius:12px">
                                                    <div style="margin-bottom:24px">
                                                                <span style="font-size:24px;font-weight:bold;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">OmniNexus</span>
                                                                          </div>
                                                                                    <h2 style="color:#c4b5fd;margin-bottom:8px">Sifre Sifirlama</h2>
                                                                                              <p style="color:#a1a1aa;line-height:1.7;font-size:15px">
                                                                                                          Merhaba <strong style="color:#fff">${name || 'Kullanici'}</strong>,<br><br>
                                                                                                                      OmniNexus hesabiniz icin bir sifre sifirlama istegi aldik.
                                                                                                                                </p>
                                                                                                                                          <a href="${resetUrl}" style="display:inline-block;margin-top:28px;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px">
                                                                                                                                                      Sifremi Sifirla
                                                                                                                                                                </a>
                                                                                                                                                                          <p style="color:#71717a;margin-top:24px;font-size:13px">Bu baglantiyi siz yapmadÄ±ysanÄ±z bu e-postayÄ± gÃ¶rmezden gelebilirsiniz.</p>
                                                                                                                                                                                    <hr style="border:none;border-top:1px solid #27272a;margin:32px 0">
                                                                                                                                                                                              <p style="color:#52525b;font-size:12px">2026 OmniNexus - <a href="${SITE_URL}" style="color:#6366f1;text-decoration:none">www.omninexsus.com</a></p>
                                                                                                                                                                                                      </div>`;
                                  const result = await sendEmail(email, 'OmniNexus - Sifre Sifirlama Talebi', html);
                                  res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify({ success: result.ok, resendData: result.data }));
                          } catch (e) {
                                  console.error('Reset email error:', e);
                                  res.writeHead(500, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify({ success: false, error: e.message }));
                          }
                          return;
                    }

  // User-submitted articles
                        if (req.method === 'POST' && url === '/api/articles') {
    try {
      const body = JSON.parse(await readBody(req));
      const article = { id: Date.now().toString(), title: body.title, category: body.category, urlToImage: body.imageUrl || '', content: body.content, author: body.author || 'Editor', publishedAt: new Date().toISOString(), url: '' };
      userArticles.unshift(article);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, article }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }
  if (req.method === 'GET' && url === '/api/articles') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userArticles));
    return;
  }
                    let fp = path.join(__dirname, 'dist', url === '/' ? 'index.html' : url);
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
          fp = path.join(__dirname, 'dist', 'index.html');
    }
    const ct = mime[path.extname(fp)] || 'application/octet-stream';
    fs.readFile(fp, (err, data) => {
          if (err) {
                  res.writeHead(404);
                  res.end('Not found');
                  return;
          }
          res.writeHead(200, { 'Content-Type': ct });
          res.end(data);
    });
}).listen(port, '0.0.0.0', () => console.log('OmniNexus live on port ' + port));
