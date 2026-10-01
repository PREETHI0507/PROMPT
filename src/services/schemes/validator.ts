import { SCHEMES, SchemeSector, isTrustedUrl, isValidSchemeId } from '../../data/schemes';

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

export const ALLOWED_SECTORS: SchemeSector[] = [
  'EDUCATION',
  'FINANCE',
  'HEALTH',
  'SKILLS',
  'ENTREPRENEURSHIP',
  'SAFETY',
  'HOUSING',
  'AGRICULTURE',
];

export const ALLOWED_ACTION_NAMES = [
  'showSchemeResults',
  'openScheme',
  'highlightSection',
  'showGuidanceStep',
  'startApplicationGuidance',
  'openOfficialSource',
] as const;

export type AllowedActionName = (typeof ALLOWED_ACTION_NAMES)[number];

const ACTION_NAME_MAP: Record<string, AllowedActionName> = {
  SHOW_SCHEME_RESULTS: 'showSchemeResults',
  showSchemeResults: 'showSchemeResults',
  OPEN_SCHEME: 'openScheme',
  openScheme: 'openScheme',
  HIGHLIGHT_TARGET: 'highlightSection',
  highlightSection: 'highlightSection',
  SCROLL_TO_TARGET: 'highlightSection',
  scrollToTarget: 'highlightSection',
  SHOW_GUIDANCE_STEP: 'showGuidanceStep',
  showGuidanceStep: 'showGuidanceStep',
  START_APPLICATION_GUIDANCE: 'startApplicationGuidance',
  startApplicationGuidance: 'startApplicationGuidance',
  OPEN_OFFICIAL_SOURCE: 'openOfficialSource',
  openOfficialSource: 'openOfficialSource',
};

export const ALLOWED_APPLICATION_ROUTES = ['CSC', 'ONLINE'] as const;
export type ApplicationRoute = (typeof ALLOWED_APPLICATION_ROUTES)[number];

export const ALLOWED_APPLICATION_STEPS = [
  'CHECKLIST',
  'DETAILS',
  'ROUTE',
  'OFFICIAL_PORTAL',
] as const;
export type ApplicationStep = (typeof ALLOWED_APPLICATION_STEPS)[number];

export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
}

export function validateActionName(action: unknown): ValidationResult<AllowedActionName> {
  if (typeof action !== 'string' || !action.trim()) {
    return { isValid: false, error: 'Action name must be a non-empty string' };
  }
  const trimmed = action.trim();
  if (Object.prototype.hasOwnProperty.call(ACTION_NAME_MAP, trimmed)) {
    return { isValid: true, value: ACTION_NAME_MAP[trimmed] };
  }
  return {
    isValid: false,
    error: `Action "${action}" is not an allowed application action`,
  };
}

export function validateSector(sector: unknown): ValidationResult<SchemeSector> {
  if (!sector || typeof sector !== 'string') {
    return { isValid: false, error: 'Sector must be a non-empty string' };
  }
  const upper = sector.toUpperCase() as SchemeSector;
  if (ALLOWED_SECTORS.includes(upper)) {
    return { isValid: true, value: upper };
  }
  return {
    isValid: false,
    error: `Sector "${sector}" is not a recognized scheme sector`,
  };
}

export function validateGuidanceStep(step: unknown): ValidationResult<GuidanceStep> {
  if (!step || typeof step !== 'string') {
    return { isValid: false, error: 'Guidance step must be a non-empty string' };
  }
  const upper = step.toUpperCase() as GuidanceStep;
  if (ALLOWED_GUIDANCE_STEPS.includes(upper)) {
    return { isValid: true, value: upper };
  }
  return {
    isValid: false,
    error: `Guidance step "${step}" is not recognized`,
  };
}

export function validateApplicationRoute(route: unknown): ValidationResult<ApplicationRoute> {
  if (typeof route !== 'string') {
    return { isValid: true, value: 'CSC' }; // Safe default for rural users
  }
  const upper = route.toUpperCase() as ApplicationRoute;
  if (ALLOWED_APPLICATION_ROUTES.includes(upper)) {
    return { isValid: true, value: upper };
  }
  return { isValid: true, value: 'CSC' };
}

export function validateApplicationStep(step: unknown): ValidationResult<ApplicationStep> {
  if (typeof step !== 'string') {
    return { isValid: true, value: 'CHECKLIST' };
  }
  const upper = step.toUpperCase() as ApplicationStep;
  if (ALLOWED_APPLICATION_STEPS.includes(upper)) {
    return { isValid: true, value: upper };
  }
  return { isValid: true, value: 'CHECKLIST' };
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
