import { useCallback, useEffect, useRef, useState } from 'react';
import { SupportedLanguageCode } from '../data/languages';
import { getSchemeById } from '../data/schemes';
import { GeminiLiveService, LiveMessageTranscriptItem, VoiceState } from '../services/gemini/liveSession';
import { matchSchemes } from '../services/schemes/matcher';
import {
  HighlightTargetId,
  sanitizeUserInput,
  validateActionName,
  validateApplicationRoute,
  validateApplicationStep,
  validateGuidanceStep,
  validateHighlightTarget,
  validateOfficialUrl,
  validateSchemeId,
  validateSector,
} from '../services/schemes/validator';
import { MicErrorType, MicrophoneService } from '../services/voice/microphone';
import { UserContext } from '../state/guide/types';

export interface DiagnosticsData {
  liveSessionStatus: string;
  audioContextState: string;
  microphoneStatus: string;
  inputBytes: number;
  outputBytes: number;
  outputChunks: number;
  currentLanguage: string;
  currentScreen: string;
  currentGuidanceStep: string;
  activeHighlight: string;
}

export function useVoiceSession() {
  const [context, setContext] = useState<UserContext>({
    language: 'ta-IN',
    collectedFacts: {},
    candidateSchemeIds: [],
    currentScreen: 'LANGUAGE',
    conversationStage: 'LANGUAGE_SELECTION',
  });

  const [voiceState, setVoiceState] = useState<VoiceState>('INITIALIZING');
  const [transcripts, setTranscripts] = useState<LiveMessageTranscriptItem[]>([]);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micError, setMicError] = useState<MicErrorType | null>(null);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData>({
    liveSessionStatus: 'DISCONNECTED',
    audioContextState: 'UNINITIALIZED',
    microphoneStatus: 'INACTIVE',
    inputBytes: 0,
    outputBytes: 0,
    outputChunks: 0,
    currentLanguage: 'ta-IN',
    currentScreen: 'LANGUAGE',
    currentGuidanceStep: 'NONE',
    activeHighlight: 'NONE',
  });

  const liveServiceRef = useRef<GeminiLiveService | null>(null);
  const micServiceRef = useRef<MicrophoneService | null>(null);
  const contextRef = useRef<UserContext>(context);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  // Handle controlled tool calls from Gemini
  const handleToolCall = useCallback(async (call: { name: string; args: Record<string, unknown> }) => {
    console.log('[useVoiceSession] Executing tool call:', call.name, call.args);

    // Strict action name validation
    const actionCheck = validateActionName(call.name);
    if (!actionCheck.isValid || !actionCheck.value) {
      console.warn('[useVoiceSession] Rejected unknown action:', call.name);
      return { error: `Action ${call.name} is not permitted`, rejected: true };
    }

    if (actionCheck.value === 'showSchemeResults') {
      const rawSector = call.args.sector;
      const sectorValidation = validateSector(rawSector);
      const sector = sectorValidation.isValid ? sectorValidation.value : undefined;

      const rawQuery = typeof call.args.userNeedSummary === 'string' ? call.args.userNeedSummary : '';
      const sanitized = sanitizeUserInput(rawQuery);
      const query = sanitized.cleanText;

      const matched = matchSchemes({ sector, query });
      const ids = matched.map((m) => m.scheme.id);

      setContext((prev) => ({
        ...prev,
        sector,
        userNeed: query,
        candidateSchemeIds: ids,
        currentScreen: 'SCHEME_RESULTS',
        conversationStage: 'SHOWING_MATCHES',
      }));

      // Return concise verified facts for ONLY the matched candidate schemes (Hybrid architecture)
      return {
        success: true,
        schemesShown: ids.length,
        matchedSchemeIds: ids,
        candidateSchemes: matched.map((m) => ({
          id: m.scheme.id,
          name: m.scheme.name,
          summary: m.scheme.simpleExplanation,
          keyBenefit: m.scheme.benefits[0] || '',
          targetAudience: m.scheme.targetAudience,
        })),
      };
    }

    if (actionCheck.value === 'openScheme') {
      const schemeId = call.args.schemeId;
      const valid = validateSchemeId(schemeId);
      if (!valid.isValid || !valid.value) {
        return { error: valid.error, rejected: true };
      }

      setContext((prev) => ({
        ...prev,
        selectedSchemeId: valid.value,
        currentScreen: 'SCHEME_DETAILS',
        currentGuidanceStep: 'OVERVIEW',
        activeHighlightTarget: 'scheme-overview',
        conversationStage: 'SCHEME_SELECTED',
      }));

      return {
        success: true,
        schemeId: valid.value,
        step: 'OVERVIEW',
      };
    }

    if (actionCheck.value === 'highlightSection') {
      const targetId = call.args.targetId;
      const valid = validateHighlightTarget(targetId);
      if (!valid.isValid || !valid.value) {
        return { error: valid.error, rejected: true };
      }

      setContext((prev) => ({
        ...prev,
        activeHighlightTarget: valid.value as HighlightTargetId,
      }));

      // Scroll into view safely if element is present in DOM
      const el = document.getElementById(valid.value);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return {
        success: true,
        highlightedTarget: valid.value,
      };
    }

    if (actionCheck.value === 'showGuidanceStep') {
      const stepCheck = validateGuidanceStep(call.args.stepName);
      const stepName = stepCheck.isValid && stepCheck.value ? stepCheck.value : 'OVERVIEW';
      setContext((prev) => ({
        ...prev,
        currentGuidanceStep: stepName,
      }));
      return { success: true, stepName };
    }

    if (actionCheck.value === 'startApplicationGuidance') {
      const routeCheck = validateApplicationRoute(call.args.route);
      const stepCheck = validateApplicationStep(call.args.currentStep);
      const route = routeCheck.value || 'CSC';
      const step = stepCheck.value || 'CHECKLIST';

      setContext((prev) => ({
        ...prev,
        currentGuidanceStep: 'APPLICATION',
        activeHighlightTarget: 'scheme-application',
      }));

      const el = document.getElementById('scheme-application');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return {
        success: true,
        route,
        step,
        guided: true,
      };
    }

    return { error: `Tool ${call.name} is not recognized`, rejected: true };
  }, []);

  // Update diagnostics periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (!liveServiceRef.current) return;
      const player = liveServiceRef.current.getAudioPlayer();
      const mic = micServiceRef.current;

      setDiagnostics({
        liveSessionStatus: liveServiceRef.current.getState(),
        audioContextState: player.getAudioContextState(),
        microphoneStatus: mic?.isActive() ? 'CAPTURING' : 'IDLE',
        inputBytes: mic?.getTotalBytes() || 0,
        outputBytes: player.getTotalBytes(),
        outputChunks: player.getChunksCount(),
        currentLanguage: contextRef.current.language,
        currentScreen: contextRef.current.currentScreen,
        currentGuidanceStep: contextRef.current.currentGuidanceStep || 'NONE',
        activeHighlight: contextRef.current.activeHighlightTarget || 'NONE',
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Language selection is the SINGLE entry point that starts the entire AI and audio pipeline!
  const selectLanguageAndStart = useCallback(
    async (langCode: SupportedLanguageCode) => {
      console.log('[useVoiceSession] Language selected:', langCode);

      // Clean up any existing instances
      if (liveServiceRef.current) {
        liveServiceRef.current.stop();
        liveServiceRef.current = null;
      }
      if (micServiceRef.current) {
        micServiceRef.current.stop();
        micServiceRef.current = null;
      }

      setContext((prev) => ({
        ...prev,
        language: langCode,
        currentScreen: 'DISCOVERY',
        conversationStage: 'INITIALIZING',
      }));

      // 1. Initialize microphone service
      const micService = new MicrophoneService({
        onAudioData: (base64) => {
          liveServiceRef.current?.sendAudioChunk(base64);
        },
        onVolumeChange: (vol) => {
          setMicVolume(vol);
        },
        onError: (errType) => {
          setMicError(errType);
        },
        onStateChange: (active) => {
          setMicActive(active);
        },
      });
      micServiceRef.current = micService;

      // 2. Initialize Gemini Live service
      const liveService = new GeminiLiveService({
        onVoiceStateChange: (st) => {
          setVoiceState(st);
          // If state turns to LISTENING, ensure mic is running
          if (st === 'LISTENING') {
            if (micServiceRef.current && !micServiceRef.current.isActive()) {
              void micServiceRef.current.start().catch((err) => {
                console.warn('[useVoiceSession] Auto-start mic error:', err);
              });
            }
          }
        },
        onTranscriptUpdate: (items) => {
          setTranscripts(items);
        },
        onToolCall: handleToolCall,
        onError: (err) => {
          console.error('[useVoiceSession] Live error:', err);
        },
      });
      liveServiceRef.current = liveService;

      try {
        // Start microphone capturing right away
        await micService.start();

        // Connect Gemini Live and trigger initial greeting
        await liveService.startSession(langCode);
      } catch (e) {
        console.error('[useVoiceSession] Initialization failed:', e);
        // Fallback to text mode gracefully
        setVoiceState('TEXT_FALLBACK');
      }
    },
    [handleToolCall]
  );

  // Manual navigation helpers
  const handleSelectScheme = useCallback((schemeId: string) => {
    const valid = validateSchemeId(schemeId);
    if (!valid.isValid || !valid.value) return;

    setContext((prev) => ({
      ...prev,
      selectedSchemeId: valid.value,
      currentScreen: 'SCHEME_DETAILS',
      currentGuidanceStep: 'OVERVIEW',
      activeHighlightTarget: 'scheme-overview',
      conversationStage: 'SCHEME_SELECTED',
    }));

    // Inform the live session so AI automatically begins explaining this scheme and guiding application submission!
    const scheme = getSchemeById(valid.value);
    if (scheme && liveServiceRef.current) {
      liveServiceRef.current.sendUserTextMessage(
        `User opened scheme "${scheme.name}". First explain what this scheme is in 1 or 2 simple sentences, and then ask her: "Shall I guide you step-by-step on how to submit your application?" Offer to walk her through the required papers and submission steps.`
      );
    }
  }, []);

  const handleHighlightTarget = useCallback((targetId: HighlightTargetId) => {
    const valid = validateHighlightTarget(targetId);
    if (!valid.isValid || !valid.value) return;

    setContext((prev) => ({
      ...prev,
      activeHighlightTarget: valid.value,
    }));

    const el = document.getElementById(valid.value);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleGoBack = useCallback(() => {
    setContext((prev) => {
      if (prev.currentScreen === 'SCHEME_DETAILS') {
        return {
          ...prev,
          currentScreen: 'SCHEME_RESULTS',
          activeHighlightTarget: undefined,
          conversationStage: 'SHOWING_MATCHES',
        };
      }
      if (prev.currentScreen === 'SCHEME_RESULTS') {
        return {
          ...prev,
          currentScreen: 'DISCOVERY',
          conversationStage: 'ASKING_NEED',
        };
      }
      return prev;
    });

    if (liveServiceRef.current) {
      liveServiceRef.current.sendUserTextMessage('User wants to go back.');
    }
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (liveServiceRef.current) {
      liveServiceRef.current.sendUserTextMessage(text);
    }
  }, []);

  const toggleMicMute = useCallback(() => {
    if (!micServiceRef.current) return;
    if (micServiceRef.current.isActive()) {
      micServiceRef.current.pause();
    } else {
      micServiceRef.current.resume();
    }
  }, []);

  const dismissSecurityNotice = useCallback(() => {
    setSecurityNotice(null);
  }, []);

  const openOfficialUrl = useCallback((url: string) => {
    const validated = validateOfficialUrl(url);
    if (!validated.isValid || !validated.value) {
      setSecurityNotice(
        'பாதுகாப்பு அறிவிப்பு: சரிபார்க்கப்பட்ட அரசு போர்ட்டல்கள் மட்டுமே திறக்கப்படும் (Security notice: Only verified official government portals can be opened).'
      );
      return;
    }
    try {
      const win = window.open(validated.value, '_blank', 'noopener,noreferrer');
      if (!win) {
        setSecurityNotice(
          'உலவி பாப்அப் தடுக்கப்பட்டுள்ளது. அதிகாரப்பூர்வ தளத்தை திறக்க பாப்அப் அனுமதிக்கவும் (Popup was blocked by your browser. Please allow popups to open the official portal).'
        );
      }
    } catch {
      setSecurityNotice('இணைப்பைத் திறக்க முடியவில்லை (Unable to open official portal link).');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (micServiceRef.current) {
        micServiceRef.current.stop();
        micServiceRef.current = null;
      }
      if (liveServiceRef.current) {
        liveServiceRef.current.stop();
        liveServiceRef.current = null;
      }
    };
  }, []);

  return {
    context,
    voiceState,
    transcripts,
    micActive,
    micVolume,
    micError,
    securityNotice,
    dismissSecurityNotice,
    diagnostics,
    diagnosticsOpen,
    setDiagnosticsOpen,
    selectLanguageAndStart,
    handleSelectScheme,
    handleHighlightTarget,
    handleGoBack,
    sendTextMessage,
    toggleMicMute,
    openOfficialUrl,
  };
}
