import { base64ToPcm16, pcm16ToAudioBuffer } from './pcm';

export interface AudioPlayerListener {
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onError?: (error: Error) => void;
  onBytesReceived?: (bytes: number) => void;
}

export class GeminiAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isCurrentlyPlaying: boolean = false;
  private listener?: AudioPlayerListener;
  private totalBytesPlayed: number = 0;
  private chunksCount: number = 0;
  private checkPlayingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(listener?: AudioPlayerListener) {
    this.listener = listener;
  }

  public setListener(listener: AudioPlayerListener) {
    this.listener = listener;
  }

  public async initialize(): Promise<void> {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public enqueueAudio(base64Data: string): void {
    if (!base64Data) return;

    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      }

      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }

      const pcm16Bytes = base64ToPcm16(base64Data);
      this.totalBytesPlayed += pcm16Bytes.byteLength;
      this.chunksCount++;
      this.listener?.onBytesReceived?.(pcm16Bytes.byteLength);

      const audioBuffer = pcm16ToAudioBuffer(pcm16Bytes, this.audioCtx, 24000);
      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      // Schedule gapless playback with a small 30ms latency buffer if starting fresh
      if (this.nextStartTime < now) {
        this.nextStartTime = now + 0.03;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.activeSources.push(source);

      if (!this.isCurrentlyPlaying) {
        this.isCurrentlyPlaying = true;
        this.listener?.onPlaybackStateChange?.(true);
      }

      source.onended = () => {
        try {
          source.disconnect();
        } catch {
          // Ignore
        }
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
        this.evaluatePlayingState();
      };

      // Set safety timeout to evaluate end of queue
      if (this.checkPlayingTimer) clearTimeout(this.checkPlayingTimer);
      const remainingDurationMs = Math.max(0, (this.nextStartTime - now) * 1000 + 100);
      this.checkPlayingTimer = setTimeout(() => {
        this.evaluatePlayingState();
      }, remainingDurationMs);
    } catch (err) {
      console.error('[GeminiAudioPlayer] Error enqueuing audio:', err);
      this.listener?.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private evaluatePlayingState(): void {
    if (!this.audioCtx) {
      if (this.isCurrentlyPlaying) {
        this.isCurrentlyPlaying = false;
        this.listener?.onPlaybackStateChange?.(false);
      }
      return;
    }

    if (this.activeSources.length === 0 && this.audioCtx.currentTime >= this.nextStartTime - 0.05) {
      if (this.isCurrentlyPlaying) {
        this.isCurrentlyPlaying = false;
        this.listener?.onPlaybackStateChange?.(false);
      }
    }
  }

  public stopImmediately(): void {
    if (this.checkPlayingTimer) {
      clearTimeout(this.checkPlayingTimer);
      this.checkPlayingTimer = null;
    }

    for (const source of this.activeSources) {
      try {
        source.onended = null;
        source.stop();
        source.disconnect();
      } catch {
        // Ignore already stopped sources
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }

    if (this.isCurrentlyPlaying) {
      this.isCurrentlyPlaying = false;
      this.listener?.onPlaybackStateChange?.(false);
    }
  }

  public clearQueue(): void {
    this.stopImmediately();
  }

  public isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public getTotalBytes(): number {
    return this.totalBytesPlayed;
  }

  public getChunksCount(): number {
    return this.chunksCount;
  }

  public getAudioContextState(): AudioContextState | 'uninitialized' {
    return this.audioCtx ? this.audioCtx.state : 'uninitialized';
  }

  public dispose(): void {
    this.stopImmediately();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        void this.audioCtx.close();
      } catch {
        // Ignore
      }
      this.audioCtx = null;
    }
  }
}
