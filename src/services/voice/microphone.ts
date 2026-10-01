import { downsampleBuffer, floatTo16BitPCM, pcm16ToBase64 } from './pcm';

export type MicErrorType =
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'UNSUPPORTED'
  | 'AUDIO_CONTEXT_FAILED'
  | 'UNKNOWN';

export interface MicListener {
  onAudioData: (base64Pcm16: string) => void;
  onVolumeChange?: (rmsVolume: number) => void;
  onError?: (errorType: MicErrorType, originalError: Error) => void;
  onStateChange?: (isActive: boolean) => void;
}

export class MicrophoneService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private listener: MicListener | null = null;
  private isCapturing: boolean = false;
  private isMuted: boolean = false;
  private totalInputBytes: number = 0;

  constructor(listener?: MicListener) {
    this.listener = listener || null;
  }

  public setListener(listener: MicListener) {
    this.listener = listener;
  }

  public async start(): Promise<void> {
    if (this.isCapturing && this.mediaStream) {
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error('Microphone mediaDevices API unsupported in this browser environment');
      this.listener?.onError?.('UNSUPPORTED', err);
      throw err;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtxClass();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      // 4096 samples provides good low-latency chunks (~85ms chunks)
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isCapturing || this.isMuted) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Compute RMS volume for UI pulse
        let sumSquares = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sumSquares += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sumSquares / inputChannelData.length);
        this.listener?.onVolumeChange?.(Math.min(1, rms * 5));

        // Downsample input to exactly 16000 Hz for Gemini Live
        const downsampled = downsampleBuffer(
          inputChannelData,
          this.audioContext?.sampleRate || 48000,
          16000
        );

        const pcm16Bytes = floatTo16BitPCM(downsampled);
        this.totalInputBytes += pcm16Bytes.byteLength;
        const base64Chunk = pcm16ToBase64(pcm16Bytes);

        this.listener?.onAudioData(base64Chunk);
      };

      this.sourceNode.connect(this.processorNode);
      // Connect to destination to keep pipeline active, with zero gain to prevent local loopback
      const muteGain = this.audioContext.createGain();
      muteGain.gain.value = 0;
      this.processorNode.connect(muteGain);
      muteGain.connect(this.audioContext.destination);

      this.isCapturing = true;
      this.listener?.onStateChange?.(true);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      let errorType: MicErrorType = 'UNKNOWN';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'PERMISSION_DENIED';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorType = 'DEVICE_NOT_FOUND';
      } else if (error.name === 'NotSupportedError') {
        errorType = 'UNSUPPORTED';
      }
      this.listener?.onError?.(errorType, error);
      this.stop();
      throw error;
    }
  }

  public pause(): void {
    this.isMuted = true;
    this.listener?.onStateChange?.(false);
  }

  public resume(): void {
    this.isMuted = false;
    this.listener?.onStateChange?.(this.isCapturing);
  }

  public stop(): void {
    this.isCapturing = false;
    this.isMuted = false;

    if (this.processorNode) {
      try {
        this.processorNode.onaudioprocess = null;
        this.processorNode.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        void this.audioContext.close();
      } catch {
        // Ignore
      }
      this.audioContext = null;
    }

    this.listener?.onStateChange?.(false);
  }

  public isActive(): boolean {
    return this.isCapturing && !this.isMuted;
  }

  public getTotalBytes(): number {
    return this.totalInputBytes;
  }
}
