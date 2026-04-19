const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_DEFAULT_SENDER || 'OmniNexus <noreply@omninexsus.com>';
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
  return res.ok;
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

  // Welcome email after registration
  if (req.method === 'POST' && url === '/api/email/welcome') {
    try {
      const { name, email } = JSON.parse(await readBody(req));
      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:40px;border-radius:12px">
          <div style="margin-bottom:24px">
            <span style="font-size:24px;font-weight:bold;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">OmniNexus</span>
          </div>
          <h2 style="color:#c4b5fd;margin-bottom:8px">Hoş Geldiniz, ${name}! 🌍</h2>
          <p style="color:#a1a1aa;line-height:1.7;font-size:15px">
            OmniNexus'a üye olduğunuz için teşekkürler. Artık dünyadan gerçek zamanlı haberlere,
            AI destekli çeviriye ve kişiselleştirilmiş içeriklere erişebilirsiniz.
          </p>
          <a href="${SITE_URL}" style="display:inline-block;margin-top:28px;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px">
            Haberleri Keşfet →
          </a>
          <hr style="border:none;border-top:1px solid #27272a;margin:32px 0">
          <p style="color:#52525b;font-size:12px">© 2026 OmniNexus · <a href="${SITE_URL}" style="color:#6366f1;text-decoration:none">www.omninexsus.com</a></p>
        </div>`;
      const ok = await sendEmail(email, 'OmniNexus'a Hoş Geldiniz! 🎉', html);
      res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: ok }));
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
          <h2 style="color:#c4b5fd;margin-bottom:8px">Şifre Sıfırlama 🔐</h2>
          <p style="color:#a1a1aa;line-height:1.7;font-size:15px">
            Merhaba <strong style="color:#fff">${name || 'Kullanıcı'}</strong>,<br><br>
            OmniNexus hesabınız için bir şifre sıfırlama isteği aldık.
            Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
          </p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:28px;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px">
            Şifremi Sıfırla →
          </a>
          <p style="color:#71717a;margin-top:24px;font-size:13px">
            ⚠️ Bu bağlantı 24 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
          </p>
          <hr style="border:none;border-top:1px solid #27272a;margin:32px 0">
          <p style="color:#52525b;font-size:12px">© 2026 OmniNexus · <a href="${SITE_URL}" style="color:#6366f1;text-decoration:none">www.omninexsus.com</a></p>
        </div>`;
      const ok = await sendEmail(email, 'OmniNexus - Şifre Sıfırlama Talebi', html);
      res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: ok }));
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
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });

}).listen(port, '0.0.0.0', () => console.log('OmniNexus live on port ' + port));
