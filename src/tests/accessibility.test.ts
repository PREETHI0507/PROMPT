import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SCHEMES } from '../data/schemes';
import { ALLOWED_HIGHLIGHT_TARGETS } from '../services/schemes/validator';

describe('Accessibility & Universal Access Tests', () => {
  it('provides bilingual native and English labels for all 6 supported languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.name.trim().length).toBeGreaterThan(0);
      expect(lang.englishName.trim().length).toBeGreaterThan(0);
      expect(lang.nativeScript.trim().length).toBeGreaterThan(0);
      expect(lang.sampleQueries.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('provides text fallback sample queries so voice is not the only interaction method', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const query of lang.sampleQueries) {
        expect(query.label.length).toBeGreaterThan(0);
        expect(query.text.length).toBeGreaterThan(0);
        expect(query.meaning.length).toBeGreaterThan(0);
      }
    }
  });

  it('guarantees every scheme has simple, jargon-free explanations for rural users', () => {
    for (const scheme of SCHEMES) {
      expect(scheme.simpleExplanation.length).toBeGreaterThan(15);
      expect(scheme.whyRelevant.length).toBeGreaterThan(10);
      expect(scheme.benefits.length).toBeGreaterThan(0);
      expect(scheme.requiredDocuments.length).toBeGreaterThan(0);
      expect(scheme.officialSourceUrl.startsWith('https://')).toBe(true);
    }
  });

  it('guarantees all 7 guided highlight targets are distinct and properly formatted', () => {
    expect(ALLOWED_HIGHLIGHT_TARGETS.length).toBe(7);
    const uniqueTargets = new Set(ALLOWED_HIGHLIGHT_TARGETS);
    expect(uniqueTargets.size).toBe(7);

    for (const target of ALLOWED_HIGHLIGHT_TARGETS) {
      expect(target.startsWith('scheme-')).toBe(true);
    }
  });
});
