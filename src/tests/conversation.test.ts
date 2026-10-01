import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { getSystemInstructions } from '../services/gemini/instructions';

describe('Conversation & Language Tests', () => {
  it('generates system instructions for all 6 supported languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const instructions = getSystemInstructions(lang.code);
      expect(instructions).toContain(lang.englishName);
      expect(instructions).toContain('SakhiSetu AI');
      expect(instructions).toContain('CRITICAL PRINCIPLES');
      expect(instructions).toContain('NEVER ask for Aadhaar numbers');
    }
  });

  it('guarantees unique language codes across supported options', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(6);
  });

  it('provides native greetings and explanations for all languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.greetingText.length).toBeGreaterThan(5);
      expect(lang.explanationText.length).toBeGreaterThan(5);
      expect(lang.questionText.length).toBeGreaterThan(5);
      expect(lang.sampleQueries.length).toBeGreaterThan(0);
    }
  });
});
