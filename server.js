import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ââ CORS for local dev ââ
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ââ Claude API proxy ââ
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'API key not configured. Set CLAUDE_API_KEY as an environment variable.',
    });
  }

  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages array required' });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    res.json({ content });
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: err.message || 'Claude API error' });
  }
});

// ââ Google OAuth ââ
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://www.omninexsus.com/api/auth/google/callback';

app.get('/api/auth/google', (_req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).send('Google OAuth not configured (missing GOOGLE_CLIENT_ID).');
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect('/?error=google_auth_failed');
  }
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('No access token received');
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();
    const userData = {
      email: profile.email || '',
      name: profile.name || profile.email?.split('@')[0] || 'User',
      avatar: profile.picture || '',
    };
    const encoded = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`/auth/callback?user=${encoded}`);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.redirect('/?error=google_auth_error');
  }
});

// ââ Health check ââ
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OmniNexus server running on port ${PORT}`);
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('â¢'WARN: CLAUDE_API_KEY not set');
  }
});
