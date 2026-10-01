import { describe, expect, it } from 'vitest';
import { getLanguageConfig, SUPPORTED_LANGUAGES, SupportedLanguageCode } from '../data/languages';
import { getSystemInstructions } from '../services/gemini/instructions';
import { GEMINI_LIVE_TOOLS } from '../services/gemini/tools';

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

  it('gracefully falls back to default language for unknown language codes', () => {
    const fallback = getLanguageConfig('unknown-code' as SupportedLanguageCode);
    expect(fallback).toBeDefined();
    expect(fallback.code).toBe('ta-IN');
  });

  it('declares all 5 controlled tool functions in GEMINI_LIVE_TOOLS', () => {
    const declarations = GEMINI_LIVE_TOOLS[0].functionDeclarations;
    expect(declarations.length).toBe(5);

    const names = declarations.map((d) => d.name);
    expect(names).toContain('showSchemeResults');
    expect(names).toContain('openScheme');
    expect(names).toContain('highlightSection');
    expect(names).toContain('showGuidanceStep');
    expect(names).toContain('startApplicationGuidance');
  });
});
