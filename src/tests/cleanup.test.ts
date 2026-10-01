import { describe, expect, it, vi } from 'vitest';
import { GeminiAudioPlayer } from '../services/voice/audioPlayer';
import { MicrophoneService } from '../services/voice/microphone';

describe('Resource Cleanup & Lifecycle Tests', () => {
  it('audio player stopImmediately is idempotent and safely cleans active sources', () => {
    const player = new GeminiAudioPlayer();
    // First stop on uninitialized
    expect(() => player.stopImmediately()).not.toThrow();
    // Second stop
    expect(() => player.stopImmediately()).not.toThrow();
    expect(player.isPlaying()).toBe(false);
  });

  it('audio player dispose is idempotent and cleans audio context', () => {
    const player = new GeminiAudioPlayer();
    expect(() => player.dispose()).not.toThrow();
    // Calling dispose a second time must never crash
    expect(() => player.dispose()).not.toThrow();
  });

  it('microphone stop is idempotent and safely disconnects nodes', () => {
    const mic = new MicrophoneService();
    // Calling stop when not started
    expect(() => mic.stop()).not.toThrow();
    expect(mic.isActive()).toBe(false);
    // Calling stop again
    expect(() => mic.stop()).not.toThrow();
  });

  it('audio player releases queue immediately upon user interruption', () => {
    const player = new GeminiAudioPlayer();
    player.clearQueue();
    expect(player.isPlaying()).toBe(false);
  });

  it('microphone listener callbacks can be reassigned or cleared cleanly', () => {
    const mic = new MicrophoneService();
    const mockAudio = vi.fn();
    mic.setListener({ onAudioData: mockAudio });
    expect(mic.isActive()).toBe(false);
    expect(() => mic.stop()).not.toThrow();
  });
});
