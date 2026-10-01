import { GoogleGenAI, Modality, Session } from '@google/genai';
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { SupportedLanguageCode, getLanguageConfig } from '../../data/languages';
import { sanitizeUserInput } from '../schemes/validator';
import { getSystemInstructions } from './instructions';
import { GEMINI_LIVE_TOOLS } from './tools';

export function setupLiveWebSocketBridge(wss: WebSocketServer) {
  wss.on('connection', async (clientWs: WebSocket, req: IncomingMessage) => {
    console.log('[LiveBridge] Client connected from URL:', req.url);

    let session: Session | null = null;
    let isClosed = false;

    // Parse language from URL query string
    let langCode: SupportedLanguageCode = 'ta-IN';
    try {
      const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
      const langParam = parsedUrl.searchParams.get('lang');
      if (
        langParam &&
        ['ta-IN', 'hi-IN', 'te-IN', 'bn-IN', 'mr-IN', 'kn-IN'].includes(langParam)
      ) {
        langCode = langParam as SupportedLanguageCode;
      }
    } catch {
      // Default to Tamil
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[LiveBridge] GEMINI_API_KEY is not defined in server environment');
      clientWs.send(
        JSON.stringify({
          error: 'GEMINI_API_KEY is not set on the server.',
        })
      );
      clientWs.close(1011, 'Missing API Key');
      return;
    }

    const langConfig = getLanguageConfig(langCode);

    try {
      const serverAi = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      console.log(`[LiveBridge] Connecting to gemini-3.8-live in ${langConfig.englishName}...`);

      session = await serverAi.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: langConfig.voiceName,
              },
            },
          },
          systemInstruction: getSystemInstructions(langCode),
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: GEMINI_LIVE_TOOLS,
        },
        callbacks: {
          onopen: () => {
            console.log('[LiveBridge] Upstream Gemini Live socket opened');
          },
          onmessage: (m) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

            // Audio output from model turn
            const parts = m.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
              }
            }

            // Output transcription
            if (m.serverContent?.outputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  outputTranscription: m.serverContent.outputTranscription.text,
                })
              );
            }

            // Input transcription
            if (m.serverContent?.inputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  inputTranscription: m.serverContent.inputTranscription.text,
                })
              );
            }

            // Interruption
            if (m.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }

            // Turn complete
            if (m.serverContent?.turnComplete || m.serverContent?.generationComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }

            // Tool / function call
            if (m.toolCall?.functionCalls && Array.isArray(m.toolCall.functionCalls)) {
              clientWs.send(
                JSON.stringify({
                  toolCall: m.toolCall.functionCalls,
                })
              );
            }
          },
          onerror: (err) => {
            console.error('[LiveBridge] Upstream error from Gemini Live:', err);
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  error: err instanceof Error ? err.message : String(err),
                })
              );
            }
          },
          onclose: (closeEvent) => {
            console.log(
              '[LiveBridge] Upstream Gemini Live closed:',
              closeEvent.code,
              closeEvent.reason
            );
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ closed: true }));
            }
          },
        },
      });

      console.log('[LiveBridge] Live session successfully connected to upstream Gemini');

      if (clientWs.readyState === WebSocket.OPEN) {
        // Inform client that server Live session is ready
        clientWs.send(JSON.stringify({ ready: true, language: langCode }));

        // Automatically trigger the first turn greeting
        const initialPrompt = `The user selected ${langConfig.englishName} (${langConfig.name}). Greet her warmly in ${langConfig.name}, introduce yourself as SakhiSetu AI, tell her she does not need to know any government scheme names, and ask what help she needs today. Speak in ${langConfig.name}.`;
        session.sendRealtimeInput({
          text: initialPrompt,
        });
      }

      // Handle messages from client
      clientWs.on('message', (rawData: unknown) => {
        if (!session || isClosed) return;

        try {
          const textData = typeof rawData === 'string' ? rawData : rawData instanceof Buffer ? rawData.toString() : String(rawData);
          const msg = JSON.parse(textData);

          // User microphone PCM audio
          if (msg.audio && typeof msg.audio === 'string') {
            session.sendRealtimeInput({
              audio: {
                data: msg.audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          }

          // User text - sanitized to remove sensitive numbers (Aadhaar, OTP) before sending to Gemini
          if (msg.text && typeof msg.text === 'string') {
            const sanitized = sanitizeUserInput(msg.text);
            session.sendRealtimeInput({
              text: sanitized.cleanText,
            });
          }

          // Client tool response
          if (msg.toolResponse && Array.isArray(msg.toolResponse)) {
            const anySession = session as unknown as { sendToolResponse?: (arg: { functionResponses: unknown[] }) => void };
            if (typeof anySession.sendToolResponse === 'function') {
              anySession.sendToolResponse({ functionResponses: msg.toolResponse });
            } else {
              session.sendRealtimeInput({
                text: `Tool result: ${JSON.stringify(msg.toolResponse)}`,
              });
            }
          }
        } catch (msgErr) {
          console.warn('[LiveBridge] Failed to process message from client:', msgErr);
        }
      });

      clientWs.on('close', () => {
        isClosed = true;
        if (session) {
          try {
            session.close();
          } catch {
            // Ignore
          }
          session = null;
        }
      });

      clientWs.on('error', (err) => {
        console.error('[LiveBridge] Client socket error:', err);
        isClosed = true;
        if (session) {
          try {
            session.close();
          } catch {
            // Ignore
          }
          session = null;
        }
      });
    } catch (connectErr: unknown) {
      console.error('[LiveBridge] Failed to connect to Gemini Live upstream:', connectErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        const errorMsg = connectErr instanceof Error ? connectErr.message : 'Failed to connect to Gemini Live service';
        clientWs.send(
          JSON.stringify({
            error: errorMsg,
          })
        );
      }
    }
  });
}
