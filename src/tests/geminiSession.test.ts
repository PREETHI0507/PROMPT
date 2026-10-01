import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { getSystemInstructions } from '../services/gemini/instructions';
import { GEMINI_LIVE_TOOLS } from '../services/gemini/tools';
import {
  validateActionName,
  validateApplicationRoute,
  validateApplicationStep,
  validateGuidanceStep,
  validateHighlightTarget,
  validateOfficialUrl,
  validateSchemeId,
  validateSector,
} from '../services/schemes/validator';

describe('Gemini Session & Continuity Tests', () => {
  it('configures system instruction per language emphasizing rural single-question guidance', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const prompt = getSystemInstructions(lang.code);
      expect(prompt).toContain(lang.englishName);
      expect(prompt).toContain('1-3 SHORT SENTENCES PER TURN');
      expect(prompt).toContain('NEVER ask for Aadhaar numbers');
      expect(prompt).toContain('startApplicationGuidance');
    }
  });

  it('declares valid function tools for Gemini Live', () => {
    const tools = GEMINI_LIVE_TOOLS[0].functionDeclarations;
    expect(tools.length).toBe(5);

    const names = tools.map((t) => t.name);
    expect(names).toContain('showSchemeResults');
    expect(names).toContain('openScheme');
    expect(names).toContain('highlightSection');
    expect(names).toContain('showGuidanceStep');
    expect(names).toContain('startApplicationGuidance');
  });

  it('maps both SCREAMING_SNAKE_CASE and camelCase actions canonically', () => {
    const actionsToTest = [
      { input: 'SHOW_SCHEME_RESULTS', expected: 'showSchemeResults' },
      { input: 'showSchemeResults', expected: 'showSchemeResults' },
      { input: 'OPEN_SCHEME', expected: 'openScheme' },
      { input: 'openScheme', expected: 'openScheme' },
      { input: 'HIGHLIGHT_TARGET', expected: 'highlightSection' },
      { input: 'highlightSection', expected: 'highlightSection' },
      { input: 'SCROLL_TO_TARGET', expected: 'highlightSection' },
      { input: 'scrollToTarget', expected: 'highlightSection' },
      { input: 'SHOW_GUIDANCE_STEP', expected: 'showGuidanceStep' },
      { input: 'showGuidanceStep', expected: 'showGuidanceStep' },
      { input: 'START_APPLICATION_GUIDANCE', expected: 'startApplicationGuidance' },
      { input: 'startApplicationGuidance', expected: 'startApplicationGuidance' },
      { input: 'OPEN_OFFICIAL_SOURCE', expected: 'openOfficialSource' },
      { input: 'openOfficialSource', expected: 'openOfficialSource' },
    ];

    for (const { input, expected } of actionsToTest) {
      const res = validateActionName(input);
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(expected);
    }
  });

  it('rejects unauthorized or arbitrary actions from model hallucination', () => {
    const invalidActions = [
      'EXECUTE_SCRIPT',
      'DROP_TABLE',
      'FETCH_API_KEY',
      'DELETE_USER',
      'NAVIGATE_TO_EVIL',
      '__proto__',
    ];

    for (const act of invalidActions) {
      const res = validateActionName(act);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('not an allowed application action');
    }
  });

  it('validates action parameters comprehensively', () => {
    // Valid parameters
    expect(validateSector('EDUCATION').isValid).toBe(true);
    expect(validateSchemeId('aicte-pragati-degree').isValid).toBe(true);
    expect(validateHighlightTarget('scheme-documents').isValid).toBe(true);
    expect(validateGuidanceStep('APPLICATION').isValid).toBe(true);
    expect(validateApplicationRoute('CSC').isValid).toBe(true);
    expect(validateApplicationStep('CHECKLIST').isValid).toBe(true);
    expect(validateOfficialUrl('https://scholarships.gov.in').isValid).toBe(true);

    // Invalid parameters safely rejected
    expect(validateSector('CRYPTO').isValid).toBe(false);
    expect(validateSchemeId('fake-scheme').isValid).toBe(false);
    expect(validateHighlightTarget('danger-zone').isValid).toBe(false);
    expect(validateGuidanceStep('PAYMENT').isValid).toBe(false);
    expect(validateOfficialUrl('http://insecure.org').isValid).toBe(false);
  });
});
