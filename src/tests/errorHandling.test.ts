import { describe, expect, it } from 'vitest';
import { getLanguageConfig, SupportedLanguageCode } from '../data/languages';
import { getSchemeById } from '../data/schemes';
import {
  sanitizeUserInput,
  validateActionName,
  validateOfficialUrl,
  validateSchemeId,
  validateSector,
} from '../services/schemes/validator';

describe('Error Handling & Resilience Tests', () => {
  it('handles unknown or empty scheme lookup safely without throwing', () => {
    expect(getSchemeById('')).toBeUndefined();
    expect(getSchemeById('null')).toBeUndefined();
    expect(getSchemeById('undefined')).toBeUndefined();
    expect(getSchemeById('fake-scheme-999')).toBeUndefined();
  });

  it('rejects malformed URLs without throwing exceptions', () => {
    const malformed = [
      '',
      '   ',
      'not-a-url',
      'http://',
      'https://',
      'javascript:void(0)',
      'file:///etc/hosts',
      'ftp://gov.in',
    ];

    for (const url of malformed) {
      const res = validateOfficialUrl(url);
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    }
  });

  it('rejects unsupported actions and prevents execution', () => {
    const maliciousActions = [
      'deleteUser',
      'transferFunds',
      'executeShell',
      'windowOpen',
      'fetchSecret',
    ];

    for (const act of maliciousActions) {
      const res = validateActionName(act);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('not an allowed application action');
    }
  });

  it('handles invalid sector query safely', () => {
    const res = validateSector('SPORTS');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('not a recognized scheme sector');
  });

  it('safely handles user input containing both Aadhaar and OTP simultaneously', () => {
    const combined = 'ஆதார் 9876 5432 1098 மற்றும் OTP 654321 கொண்டுள்ளேன்';
    const sanitized = sanitizeUserInput(combined);
    expect(sanitized.hadSensitiveData).toBe(true);
    expect(sanitized.cleanText).not.toContain('9876 5432 1098');
    expect(sanitized.cleanText).not.toContain('654321');
    expect(sanitized.cleanText).toContain('[PROTECTED_NUMBER]');
    expect(sanitized.cleanText).toContain('[PROTECTED]');
  });

  it('safely handles null/undefined language requests', () => {
    const conf = getLanguageConfig('' as SupportedLanguageCode);
    expect(conf).toBeDefined();
    expect(conf.code).toBe('ta-IN');
  });
});
