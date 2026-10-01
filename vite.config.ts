import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

import { WebSocketServer } from 'ws';
import { setupLiveWebSocketBridge } from './src/services/gemini/liveBridge';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(express.json());

      if (server.httpServer) {
        const wss = new WebSocketServer({ noServer: true });
        server.httpServer.on('upgrade', (req, socket, head) => {
          if (req.url?.startsWith('/api/live-ws')) {
            wss.handleUpgrade(req, socket, head, (ws) => {
              wss.emit('connection', ws, req);
            });
          }
        });
        setupLiveWebSocketBridge(wss);
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');

        // Ephemeral Live Session Token Endpoint
        if (url.pathname === '/api/session-token') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  ok: false,
                  error: 'GEMINI_API_KEY is not configured in server environment',
                })
              );
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const serverAi = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: { 'User-Agent': 'aistudio-build' },
              },
            });

            // Mint single-use ephemeral token for Live API
            const token = await serverAi.authTokens.create({
              config: { uses: 1 },
            });

            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, token: token.name }));
          } catch (err: any) {
            console.error('[API Server] Error creating ephemeral token:', err);
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                ok: false,
                error: err?.message || 'Failed to mint ephemeral session token',
              })
            );
          }
          return;
        }

        // Server-Side Text Chat Fallback Endpoint
        if (url.pathname === '/api/gemini/chat' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = (req as any).body || {};
            const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY missing' }));
                return;
              }

              const { GoogleGenAI } = await import('@google/genai');
              const serverAi = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: { 'User-Agent': 'aistudio-build' },
                },
              });

              let responseText = '';
              try {
                const response = await serverAi.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: body.message || 'வணக்கம்',
                  config: {
                    systemInstruction:
                      'You are SakhiSetu AI, an empathetic rural guide for women in India. Speak in 1 to 2 short sentences in the requested language. Do not ask for Aadhaar or passwords.',
                  },
                });
                responseText = response.text || '';
              } catch (modelErr: any) {
                console.warn('[API Server] Primary model spike, trying gemini-3.1-flash-lite:', modelErr?.message);
                const fallbackResponse = await serverAi.models.generateContent({
                  model: 'gemini-3.1-flash-lite',
                  contents: body.message || 'வணக்கம்',
                  config: {
                    systemInstruction:
                      'You are SakhiSetu AI, an empathetic rural guide for women in India. Speak in 1 to 2 short sentences in the requested language.',
                  },
                });
                responseText = fallbackResponse.text || '';
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ reply: responseText }));
            } catch (err: any) {
              console.error('[API Server] Chat fallback error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Chat error' }));
            }
          return;
        }

        // Health endpoint
        if (url.pathname === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              status: 'ok',
              app: 'SakhiSetu AI',
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
