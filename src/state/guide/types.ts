import { SupportedLanguageCode } from '../../data/languages';
import { SchemeSector } from '../../data/schemes';
import { AppScreen, GuidanceStep, HighlightTargetId } from '../../services/schemes/validator';

export type ConversationStage =
  | 'LANGUAGE_SELECTION'
  | 'INITIALIZING'
  | 'GREETING'
  | 'ASKING_NEED'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'ASKING_DETAIL'
  | 'SHOWING_MATCHES'
  | 'SCHEME_SELECTED'
  | 'SCHEME_OVERVIEW'
  | 'SCHEME_ELIGIBILITY'
  | 'SCHEME_DOCUMENTS'
  | 'SCHEME_APPLICATION'
  | 'OFFICIAL_SOURCE'
  | 'RECOVERY';

export interface UserContext {
  language: SupportedLanguageCode;
  userNeed?: string;
  sector?: SchemeSector;
  targetPerson?: string;
  collectedFacts: Record<string, unknown>;
  candidateSchemeIds: string[];
  selectedSchemeId?: string;
  currentScreen: AppScreen;
  currentGuidanceStep?: GuidanceStep;
  activeHighlightTarget?: HighlightTargetId;
  conversationStage: ConversationStage;
}

export type GuideAction =
  | 'SHOW_SCHEME_RESULTS'
  | 'OPEN_SCHEME'
  | 'HIGHLIGHT_TARGET'
  | 'SCROLL_TO_TARGET'
  | 'SHOW_GUIDANCE_STEP'
  | 'OPEN_OFFICIAL_SOURCE';
