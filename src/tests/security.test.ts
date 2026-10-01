import { describe, expect, it } from 'vitest';
import {
  sanitizeUserInput,
  validateActionName,
  validateApplicationRoute,
  validateApplicationStep,
  validateGuidanceStep,
  validateHighlightTarget,
  validateOfficialUrl,
  validateSchemeId,
  validateScreen,
  validateSector,
} from '../services/schemes/validator';

describe('Security & Validation Tests', () => {
  it('allows verified official government portals', () => {
    const valid = validateOfficialUrl('https://scholarships.gov.in');
    expect(valid.isValid).toBe(true);
    expect(valid.value).toBe('https://scholarships.gov.in');

    const validPmmvy = validateOfficialUrl('https://pmmvy.wcd.gov.in');
    expect(validPmmvy.isValid).toBe(true);
  });

  it('rejects arbitrary, phishing, or non-gov URLs', () => {
    const invalid1 = validateOfficialUrl('http://insecure-site.com');
    expect(invalid1.isValid).toBe(false);

    const invalid2 = validateOfficialUrl('https://fake-government-scholarship.xyz/steal');
    expect(invalid2.isValid).toBe(false);

    const invalid3 = validateOfficialUrl('javascript:alert(1)');
    expect(invalid3.isValid).toBe(false);
  });

  it('validates action names strictly against allowlist', () => {
    expect(validateActionName('showSchemeResults').isValid).toBe(true);
    expect(validateActionName('openScheme').isValid).toBe(true);
    expect(validateActionName('highlightSection').isValid).toBe(true);
    expect(validateActionName('showGuidanceStep').isValid).toBe(true);
    expect(validateActionName('startApplicationGuidance').isValid).toBe(true);

    // Rejection of arbitrary / model hallucinated actions
    expect(validateActionName('evalCode').isValid).toBe(false);
    expect(validateActionName('executeScript').isValid).toBe(false);
    expect(validateActionName('downloadMalware').isValid).toBe(false);
  });

  it('validates sectors strictly against allowlist', () => {
    expect(validateSector('EDUCATION').isValid).toBe(true);
    expect(validateSector('AGRICULTURE').isValid).toBe(true);
    expect(validateSector('INVALID_SECTOR').isValid).toBe(false);
    expect(validateSector(null).isValid).toBe(false);
  });

  it('validates guidance steps and application routes with safe fallbacks', () => {
    expect(validateGuidanceStep('OVERVIEW').isValid).toBe(true);
    expect(validateGuidanceStep('DOCUMENTS').isValid).toBe(true);
    expect(validateGuidanceStep('UNKNOWN_STEP').isValid).toBe(false);

    expect(validateApplicationRoute('ONLINE').value).toBe('ONLINE');
    expect(validateApplicationRoute('UNKNOWN').value).toBe('CSC');

    expect(validateApplicationStep('ROUTE').value).toBe('ROUTE');
    expect(validateApplicationStep('INVALID').value).toBe('CHECKLIST');
  });

  it('validates highlight targets against allowlist', () => {
    expect(validateHighlightTarget('scheme-overview').isValid).toBe(true);
    expect(validateHighlightTarget('scheme-documents').isValid).toBe(true);
    expect(validateHighlightTarget('scheme-benefits').isValid).toBe(true);

    const invalid = validateHighlightTarget('malicious-target-id');
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain('not in the allowed list');
  });

  it('validates navigation screens against allowlist', () => {
    expect(validateScreen('LANGUAGE').isValid).toBe(true);
    expect(validateScreen('DISCOVERY').isValid).toBe(true);
    expect(validateScreen('SCHEME_DETAILS').isValid).toBe(true);

    const invalidScreen = validateScreen('UNKNOWN_PAGE');
    expect(invalidScreen.isValid).toBe(false);
  });

  it('validates scheme IDs strictly against catalog', () => {
    expect(validateSchemeId('aicte-pragati-degree').isValid).toBe(true);
    expect(validateSchemeId('pm-matru-vandana').isValid).toBe(true);
    expect(validateSchemeId('unknown-fake-scheme-id').isValid).toBe(false);
  });

  it('detects and masks sensitive data such as 12-digit Aadhaar numbers and OTPs', () => {
    const textWithAadhaar = 'என் ஆதார் எண் 1234 5678 9012 ஆகும்.';
    const result1 = sanitizeUserInput(textWithAadhaar);
    expect(result1.hadSensitiveData).toBe(true);
    expect(result1.cleanText).toContain('[PROTECTED_NUMBER]');
    expect(result1.cleanText).not.toContain('1234 5678 9012');

    const textWithOtp = 'My otp is 849302';
    const result2 = sanitizeUserInput(textWithOtp);
    expect(result2.hadSensitiveData).toBe(true);
    expect(result2.cleanText).toContain('[PROTECTED]');
  });
});
