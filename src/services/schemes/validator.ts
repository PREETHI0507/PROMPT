import { SCHEMES, isTrustedUrl, isValidSchemeId } from '../../data/schemes';

export const ALLOWED_HIGHLIGHT_TARGETS = [
  'scheme-overview',
  'scheme-who-is-it-for',
  'scheme-benefits',
  'scheme-eligibility',
  'scheme-documents',
  'scheme-application',
  'scheme-official-source',
] as const;

export type HighlightTargetId = (typeof ALLOWED_HIGHLIGHT_TARGETS)[number];

export const ALLOWED_SCREENS = [
  'LANGUAGE',
  'DISCOVERY',
  'SCHEME_RESULTS',
  'SCHEME_DETAILS',
  'GUIDANCE',
  'OFFICIAL_SOURCE',
] as const;

export type AppScreen = (typeof ALLOWED_SCREENS)[number];

export const ALLOWED_GUIDANCE_STEPS = [
  'OVERVIEW',
  'WHO_IS_IT_FOR',
  'BENEFITS',
  'ELIGIBILITY',
  'DOCUMENTS',
  'APPLICATION',
  'OFFICIAL_SOURCE',
] as const;

export type GuidanceStep = (typeof ALLOWED_GUIDANCE_STEPS)[number];

export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
}

export function validateHighlightTarget(targetId: unknown): ValidationResult<HighlightTargetId> {
  if (typeof targetId !== 'string') {
    return { isValid: false, error: 'Target ID must be a string' };
  }
  if (ALLOWED_HIGHLIGHT_TARGETS.includes(targetId as HighlightTargetId)) {
    return { isValid: true, value: targetId as HighlightTargetId };
  }
  return {
    isValid: false,
    error: `Target ID "${targetId}" is not in the allowed list of guided sections`,
  };
}

export function validateScreen(screen: unknown): ValidationResult<AppScreen> {
  if (typeof screen !== 'string') {
    return { isValid: false, error: 'Screen must be a string' };
  }
  if (ALLOWED_SCREENS.includes(screen as AppScreen)) {
    return { isValid: true, value: screen as AppScreen };
  }
  return { isValid: false, error: `Screen "${screen}" is not a recognized application screen` };
}

export function validateSchemeId(schemeId: unknown): ValidationResult<string> {
  if (typeof schemeId !== 'string' || !schemeId.trim()) {
    return { isValid: false, error: 'Scheme ID must be a non-empty string' };
  }
  if (isValidSchemeId(schemeId.trim())) {
    return { isValid: true, value: schemeId.trim() };
  }
  return {
    isValid: false,
    error: `Scheme ID "${schemeId}" was not found in the trusted government scheme registry`,
  };
}

export function validateOfficialUrl(url: unknown): ValidationResult<string> {
  if (typeof url !== 'string' || !url.trim()) {
    return { isValid: false, error: 'URL must be a non-empty string' };
  }
  const cleanUrl = url.trim();

  // Enforce HTTPS
  if (!cleanUrl.startsWith('https://')) {
    return { isValid: false, error: 'Only secure HTTPS official government links are permitted' };
  }

  // Must match our verified scheme catalog list
  if (isTrustedUrl(cleanUrl)) {
    return { isValid: true, value: cleanUrl };
  }

  // If a known government domain
  try {
    const parsed = new URL(cleanUrl);
    if (parsed.hostname.endsWith('.gov.in') || parsed.hostname.endsWith('.nic.in')) {
      const match = SCHEMES.some((s) => s.officialSourceUrl.includes(parsed.hostname));
      if (match) {
        return { isValid: true, value: cleanUrl };
      }
    }
  } catch {
    return { isValid: false, error: 'Malformed URL provided' };
  }

  return {
    isValid: false,
    error: `URL "${cleanUrl}" is not recognized as a trusted government domain from our registry`,
  };
}

export function sanitizeUserInput(input: string): { cleanText: string; hadSensitiveData: boolean } {
  // Check for 12-digit Aadhaar patterns (e.g. 1234 5678 9012 or 123456789012)
  const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
  // Check for OTP, PIN, CVV, password with optional words or spaces up to digits
  const otpRegex = /\b(otp|pin|cvv|password)\b[^0-9\n]{0,15}([0-9]{4,6})\b/gi;

  let hadSensitive = false;
  let cleanText = input;

  if (aadhaarRegex.test(cleanText)) {
    hadSensitive = true;
    cleanText = cleanText.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[PROTECTED_NUMBER]');
  }

  if (otpRegex.test(cleanText)) {
    hadSensitive = true;
    cleanText = cleanText.replace(
      /\b(otp|pin|cvv|password)\b[^0-9\n]{0,15}([0-9]{4,6})\b/gi,
      '$1: [PROTECTED]'
    );
  }

  return { cleanText, hadSensitiveData: hadSensitive };
}
