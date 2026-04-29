import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ── CORS for local dev ──
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Claude API proxy ──
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
      model: 'claude-3-5-haiku-20241022',
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

// ── Health check ──
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Serve React build in production ──
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OmniNexus server running on port ${PORT}`);
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('⚠  CLAUDE_API_KEY is not set — /api/chat will return 503');
  }
});
