import { describe, expect, it } from 'vitest';
import { getSchemeById } from '../data/schemes';
import {
  ALLOWED_HIGHLIGHT_TARGETS,
  ALLOWED_SCREENS,
  validateHighlightTarget,
  validateOfficialUrl,
  validateSchemeId,
  validateScreen,
} from '../services/schemes/validator';

describe('Navigation & Action Validation Tests', () => {
  it('allows navigation to all defined valid screens', () => {
    for (const screen of ALLOWED_SCREENS) {
      const res = validateScreen(screen);
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(screen);
    }
  });

  it('rejects navigation to invalid or arbitrary screen names', () => {
    const invalidScreens = ['ADMIN_PANEL', 'PAYMENT_GATEWAY', '', '   ', 'null', 'undefined'];
    for (const s of invalidScreens) {
      const res = validateScreen(s);
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    }
  });

  it('validates opening existing schemes and loads verified details', () => {
    const validId = 'pm-matru-vandana';
    const validation = validateSchemeId(validId);
    expect(validation.isValid).toBe(true);

    const scheme = getSchemeById(validId);
    expect(scheme).toBeDefined();
    expect(scheme?.id).toBe(validId);
    expect(scheme?.name).toBe('Pradhan Mantri Matru Vandana Yojana (PMMVY)');
    expect(scheme?.benefits.length).toBeGreaterThan(0);
    expect(scheme?.officialSourceUrl).toContain('https://');
  });

  it('safely rejects opening non-existent or malicious scheme IDs', () => {
    const maliciousIds = [
      '../etc/passwd',
      '<script>alert(1)</script>',
      'fake-lottery-scheme',
      '',
    ];
    for (const id of maliciousIds) {
      const validation = validateSchemeId(id);
      expect(validation.isValid).toBe(false);
      const scheme = getSchemeById(id);
      expect(scheme).toBeUndefined();
    }
  });

  it('validates all guided highlight targets across scheme sections', () => {
    for (const target of ALLOWED_HIGHLIGHT_TARGETS) {
      const res = validateHighlightTarget(target);
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(target);
    }
  });

  it('safely rejects unknown highlight targets without throwing', () => {
    const badTargets = ['random-div', 'header-button', 'window', 'document', ''];
    for (const target of badTargets) {
      const res = validateHighlightTarget(target);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('not in the allowed list');
    }
  });

  it('allows only trusted HTTPS official government portals and rejects untrusted links', () => {
    // Official portals from catalog
    expect(validateOfficialUrl('https://scholarships.gov.in').isValid).toBe(true);
    expect(validateOfficialUrl('https://pmmvy.wcd.gov.in').isValid).toBe(true);
    expect(validateOfficialUrl('https://pmkisan.gov.in').isValid).toBe(true);

    // Insecure / untrusted
    expect(validateOfficialUrl('http://pmkisan.gov.in').isValid).toBe(false); // HTTP insecure
    expect(validateOfficialUrl('https://evil-hacker.com/phishing').isValid).toBe(false);
    expect(validateOfficialUrl('https://gov.in.fake-portal.com').isValid).toBe(false);
    expect(validateOfficialUrl('data:text/html,<script>').isValid).toBe(false);
  });
});
