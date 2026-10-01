import { describe, expect, it } from 'vitest';
import {
  base64ToPcm16,
  downsampleBuffer,
  floatTo16BitPCM,
  pcm16ToBase64,
} from '../services/voice/pcm';

describe('Voice Audio & PCM Pipeline Tests', () => {
  it('converts Float32 audio samples to 16-bit PCM little-endian bytes', () => {
    const floatSamples = new Float32Array([0.0, 1.0, -1.0, 0.5, -0.5]);
    const pcmBytes = floatTo16BitPCM(floatSamples);

    expect(pcmBytes.length).toBe(floatSamples.length * 2);

    const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
    // 0.0 -> 0
    expect(view.getInt16(0, true)).toBe(0);
    // 1.0 -> 32767
    expect(view.getInt16(2, true)).toBe(32767);
    // -1.0 -> -32768
    expect(view.getInt16(4, true)).toBe(-32768);
    // 0.5 -> 16383
    expect(view.getInt16(6, true)).toBe(16383);
  });

  it('encodes PCM bytes to base64 and decodes back with zero byte loss', () => {
    const original = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc]);
    const base64 = pcm16ToBase64(original);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);

    const decoded = base64ToPcm16(base64);
    expect(decoded.length).toBe(original.length);
    for (let i = 0; i < original.length; i++) {
      expect(decoded[i]).toBe(original[i]);
    }
  });

  it('correctly downsamples audio buffer from 48000 Hz to 16000 Hz', () => {
    const inputSampleRate = 48000;
    const outputSampleRate = 16000;
    // 480 samples at 48kHz = 10ms -> should downsample to 160 samples at 16kHz
    const input = new Float32Array(480);
    for (let i = 0; i < input.length; i++) {
      input[i] = Math.sin((i / 480) * Math.PI * 2);
    }

    const downsampled = downsampleBuffer(input, inputSampleRate, outputSampleRate);
    expect(downsampled.length).toBe(160);
  });
});
