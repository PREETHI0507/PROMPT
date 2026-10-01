import { SupportedLanguageCode, getLanguageConfig } from '../../data/languages';
import { GeminiAudioPlayer } from '../voice/audioPlayer';

export type VoiceState =
  | 'INITIALIZING'
  | 'CONNECTING'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'RECOVERING'
  | 'TEXT_FALLBACK'
  | 'ERROR';

export interface LiveMessageTranscriptItem {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface LiveToolCallPayload {
  name: string;
  args: Record<string, unknown>;
  id?: string;
}

export interface LiveSessionCallbacks {
  onVoiceStateChange: (state: VoiceState) => void;
  onTranscriptUpdate: (transcripts: LiveMessageTranscriptItem[]) => void;
  onToolCall: (call: LiveToolCallPayload) => Promise<Record<string, unknown>>;
  onError: (error: Error) => void;
  onAudioBytesReceived?: (bytes: number) => void;
}

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private audioPlayer: GeminiAudioPlayer;
  private currentLanguage: SupportedLanguageCode = 'ta-IN';
  private callbacks: LiveSessionCallbacks;
  private currentState: VoiceState = 'INITIALIZING';
  private transcripts: LiveMessageTranscriptItem[] = [];
  private currentAiTranscript: string = '';
  private currentUserTranscript: string = '';
  private isDestroyed: boolean = false;
  private isConnecting: boolean = false;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
    this.audioPlayer = new GeminiAudioPlayer({
      onPlaybackStateChange: (isPlaying) => {
        if (this.isDestroyed) return;
        if (isPlaying) {
          this.setState('SPEAKING');
        } else {
          // Playback finished, transition to listening mode automatically
          if (this.currentState === 'SPEAKING' || this.currentState === 'THINKING') {
            this.setState('LISTENING');
          }
        }
      },
      onError: (err) => {
        console.warn('[GeminiLiveService] Audio playback warning:', err);
      },
      onBytesReceived: (bytes) => {
        this.callbacks.onAudioBytesReceived?.(bytes);
      },
    });
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public getAudioPlayer(): GeminiAudioPlayer {
    return this.audioPlayer;
  }

  public getTranscripts(): LiveMessageTranscriptItem[] {
    return [...this.transcripts];
  }

  private setState(newState: VoiceState): void {
    if (this.currentState === newState || this.isDestroyed) return;
    this.currentState = newState;
    this.callbacks.onVoiceStateChange(newState);
  }

  public async startSession(langCode: SupportedLanguageCode): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;
    this.currentLanguage = langCode;
    this.setState('CONNECTING');

    try {
      // 1. Initialize audio player (Web Audio AudioContext must resume inside user gesture)
      await this.audioPlayer.initialize();

      // 2. Connect to server-side Gemini Live WebSocket bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws?lang=${encodeURIComponent(langCode)}`;

      console.log('[GeminiLiveService] Connecting to Live bridge at:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[GeminiLiveService] WebSocket bridge connection open');
      };

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          await this.handleServerBridgeMessage(msg);
        } catch (parseErr) {
          console.error('[GeminiLiveService] Error parsing bridge message:', parseErr);
        }
      };

      this.ws.onerror = (event) => {
        console.warn('[GeminiLiveService] WebSocket error event:', event);
        if (this.currentState !== 'TEXT_FALLBACK') {
          this.setState('TEXT_FALLBACK');
        }
      };

      this.ws.onclose = (event) => {
        console.log('[GeminiLiveService] WebSocket bridge closed:', event.code, event.reason);
        if (!this.isDestroyed && this.currentState !== 'TEXT_FALLBACK') {
          this.setState('RECOVERING');
        }
      };

      this.isConnecting = false;
    } catch (err: unknown) {
      this.isConnecting = false;
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[GeminiLiveService] Failed to establish Live bridge session:', error);
      this.setState('TEXT_FALLBACK');
      this.callbacks.onError(error);
    }
  }

  private async handleServerBridgeMessage(msg: Record<string, any>): Promise<void> {
    if (this.isDestroyed) return;

    // Server confirmed connection and ready
    if (msg.ready) {
      console.log('[GeminiLiveService] Gemini Live is ready');
      this.setState('THINKING');
      return;
    }

    // Interruption detection: user spoke over the AI
    if (msg.interrupted) {
      this.audioPlayer.stopImmediately();
      this.currentAiTranscript = '';
      this.setState('LISTENING');
      return;
    }

    // Audio chunks from Gemini Live model turn
    if (msg.audio) {
      this.audioPlayer.enqueueAudio(msg.audio);
    }

    // Output audio transcription (AI speech in text)
    if (msg.outputTranscription) {
      this.currentAiTranscript += msg.outputTranscription;
      this.updateTranscriptEntry('ai', this.currentAiTranscript);
    }

    // Input audio transcription (User speech in text)
    if (msg.inputTranscription) {
      this.currentUserTranscript += msg.inputTranscription;
      this.updateTranscriptEntry('user', this.currentUserTranscript);
    }

    // Turn complete
    if (msg.turnComplete) {
      this.currentAiTranscript = '';
      this.currentUserTranscript = '';
      if (!this.audioPlayer.isPlaying()) {
        this.setState('LISTENING');
      }
    }

    // Error from server
    if (msg.error) {
      console.warn('[GeminiLiveService] Server reported warning:', msg.error);
      if (this.currentState === 'CONNECTING') {
        this.setState('TEXT_FALLBACK');
      }
    }

    // Tool / Function Calls
    if (msg.toolCall && Array.isArray(msg.toolCall)) {
      this.setState('THINKING');
      const functionResponses = [];
      for (const call of msg.toolCall) {
        try {
          const result = await this.callbacks.onToolCall({
            name: call.name,
            args: call.args || {},
            id: call.id,
          });
          functionResponses.push({
            name: call.name,
            id: call.id,
            response: result,
          });
        } catch (callErr) {
          console.error('[GeminiLiveService] Tool call error:', callErr);
          functionResponses.push({
            name: call.name,
            id: call.id,
            response: { error: 'Failed to execute tool' },
          });
        }
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN && functionResponses.length > 0) {
        this.ws.send(JSON.stringify({ toolResponse: functionResponses }));
      }
    }
  }

  private updateTranscriptEntry(sender: 'ai' | 'user', text: string): void {
    if (!text.trim()) return;

    const last = this.transcripts[this.transcripts.length - 1];
    if (last && last.sender === sender) {
      last.text = text;
      last.timestamp = Date.now();
    } else {
      this.transcripts.push({
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender,
        text,
        timestamp: Date.now(),
      });
    }
    this.callbacks.onTranscriptUpdate([...this.transcripts]);
  }

  public sendAudioChunk(base64Pcm16: string): void {
    if (this.isDestroyed || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.ws.send(JSON.stringify({ audio: base64Pcm16 }));
    } catch (err) {
      console.warn('[GeminiLiveService] Error streaming audio chunk:', err);
    }
  }

  public sendUserTextMessage(text: string): void {
    if (!text.trim()) return;

    this.updateTranscriptEntry('user', text);
    this.setState('THINKING');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ text }));
        return;
      } catch (err) {
        console.warn('[GeminiLiveService] Failed to send text via Live bridge, fallback to HTTP:', err);
      }
    }

    // If WebSocket is not open, send via server text fallback
    void this.fallbackServerChat(text);
  }

  private async fallbackServerChat(text: string): Promise<void> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: this.currentLanguage,
          history: this.transcripts.slice(-6).map((t) => ({
            role: t.sender === 'ai' ? 'model' : 'user',
            text: t.text,
          })),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        this.updateTranscriptEntry('ai', data.reply);
        this.setState('LISTENING');
      }
    } catch (apiErr) {
      console.error('[GeminiLiveService] Fallback chat failed:', apiErr);
      this.setState('ERROR');
    }
  }

  public stop(): void {
    this.isDestroyed = true;
    this.audioPlayer.stopImmediately();
    this.audioPlayer.dispose();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // Ignore
      }
      this.ws = null;
    }
  }
}
