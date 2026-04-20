const http = require('http');
const fs = require('fs');
const path = require('path');
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

const GNEWS_RSS = {
    general: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
    business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
    science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNR1p0YldZU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
    health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en',
    sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
    entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlBQVAB?hl=en-US&gl=US&ceid=US:en',
};

const FALLBACK_IMAGES = {
    general: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    technology: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    business: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800',
    science: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800',
    health: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    sports: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
    entertainment: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
};

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

                            const items = [];
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
        let urlToImage = FALLBACK_IMAGES[validCat] || FALLBACK_IMAGES.general;
        const imgTagMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgTagMatch && imgTagMatch[1] && !imgTagMatch[1].includes('1x1')) {
          urlToImage = imgTagMatch[1];
        }
        // Also check media:thumbnail in item XML
        const mediaThumbnailMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
        if (mediaThumbnailMatch) urlToImage = mediaThumbnailMatch[1];
        let description = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (description.length > 300) description = description.substring(0, 297) + '...';
        if (!description || description.length < 10) description = title;

        items.push({
          id: 'gnews_' + validCat + '_' + idx,
          title,
          description,
          url: link,
          urlToImage,
                            publishedAt,
                            source: { name: sourceName },
                            author: sourceName,
                            content: description,
                            category: validCat,
                });
                                      idx++;
                            }

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
                                                                                                                                                                          <p style="color:#71717a;margin-top:24px;font-size:13px">Bu baglantiyi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
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

                    // Static file serving (React build)
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
