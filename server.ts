import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeUserInput } from './src/services/schemes/validator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Ephemeral Live Token endpoint
app.get('/api/session-token', async (_req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'GEMINI_API_KEY is not configured' });
    }

    const serverAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const token = await serverAi.authTokens.create({
      config: { uses: 1 },
    });

    res.json({ ok: true, token: token.name });
  } catch (err: any) {
    console.error('[Server] Token error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Failed to create token' });
  }
});

// Chat fallback endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing' });
    }

    const rawMessage = typeof req.body?.message === 'string' ? req.body.message : 'வணக்கம்';
    const cleanMessage = sanitizeUserInput(rawMessage).cleanText;
    const langCode = typeof req.body?.language === 'string' ? req.body.language : 'ta-IN';

    const serverAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const response = await serverAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: cleanMessage,
      config: {
        systemInstruction:
          `You are SakhiSetu AI, an empathetic rural guide for women in India. Speak in 1 to 2 short sentences in the requested language (${langCode}). Do not ask for Aadhaar or passwords.`,
      },
    });

    res.json({ reply: response.text });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : 'Chat error';
    console.error('[Server] Chat fallback error:', err);
    res.status(500).json({ error: errMessage });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'SakhiSetu AI', timestamp: new Date().toISOString() });
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

import { WebSocketServer } from 'ws';
import { setupLiveWebSocketBridge } from './src/services/gemini/liveBridge';

const server = app.listen(port, () => {
  console.log(`[SakhiSetu AI] Full-stack server running on port ${port}`);
});

const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/api/live-ws')) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  }
});
setupLiveWebSocketBridge(wss);
