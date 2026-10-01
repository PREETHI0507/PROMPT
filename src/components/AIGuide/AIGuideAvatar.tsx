import { Mic, Volume2 } from 'lucide-react';
import React from 'react';
import { SupportedLanguageCode } from '../../data/languages';
import { VoiceState } from '../../services/gemini/liveSession';

interface AIGuideAvatarProps {
  voiceState: VoiceState;
  micVolume?: number;
  language: SupportedLanguageCode;
  onAvatarClick?: () => void;
}

const STATE_MESSAGES: Record<
  SupportedLanguageCode,
  Record<VoiceState, { native: string; english: string }>
> = {
  'ta-IN': {
    INITIALIZING: { native: 'தொடங்குகிறது...', english: 'Initializing...' },
    CONNECTING: { native: 'இணைக்கப்படுகிறது...', english: 'Connecting...' },
    LISTENING: { native: 'நான் கவனிக்கிறேன்... சொல்லுங்கள்', english: "I'm listening... Please speak" },
    THINKING: { native: 'புரிந்து கொள்கிறேன்...', english: 'Understanding...' },
    SPEAKING: { native: 'நான் விளக்குகிறேன்...', english: "I'm explaining..." },
    INTERRUPTED: { native: 'சொல்லுங்கள், நான் கேட்கிறேன்', english: 'Yes, tell me' },
    RECOVERING: { native: 'மீண்டும் இணைகிறது...', english: 'Reconnecting...' },
    TEXT_FALLBACK: { native: 'எழுத்து மூலம் தொடருங்கள்', english: 'Text fallback ready' },
    ERROR: { native: 'மன்னிக்கவும், மீண்டும் முயற்சிப்போம்', english: "Let's try again" },
  },
  'hi-IN': {
    INITIALIZING: { native: 'शुरू हो रहा है...', english: 'Initializing...' },
    CONNECTING: { native: 'जुड़ रहा है...', english: 'Connecting...' },
    LISTENING: { native: 'मैं सुन रही हूँ... बताइए', english: "I'm listening... Please speak" },
    THINKING: { native: 'समझ रही हूँ...', english: 'Understanding...' },
    SPEAKING: { native: 'मैं समझा रही हूँ...', english: "I'm explaining..." },
    INTERRUPTED: { native: 'हाँ, बताइए', english: 'Yes, tell me' },
    RECOVERING: { native: 'पुनः जुड़ रहा है...', english: 'Reconnecting...' },
    TEXT_FALLBACK: { native: 'लिखकर पूछें', english: 'Text fallback ready' },
    ERROR: { native: 'कृपया पुनः प्रयास करें', english: "Let's try again" },
  },
  'te-IN': {
    INITIALIZING: { native: 'ప్రారంభమవుతోంది...', english: 'Initializing...' },
    CONNECTING: { native: 'కనెక్ట్ అవుతోంది...', english: 'Connecting...' },
    LISTENING: { native: 'నేను వింటున్నాను... చెప్పండి', english: "I'm listening..." },
    THINKING: { native: 'అర్థం చేసుకుంటున్నాను...', english: 'Understanding...' },
    SPEAKING: { native: 'వివరిస్తున్నాను...', english: "I'm explaining..." },
    INTERRUPTED: { native: 'చెప్పండి', english: 'Yes, tell me' },
    RECOVERING: { native: 'తిరిగి కనెక్ట్ అవుతోంది...', english: 'Reconnecting...' },
    TEXT_FALLBACK: { native: 'టైప్ చేయవచ్చు', english: 'Text mode' },
    ERROR: { native: 'మళ్ళీ ప్రయత్నించండి', english: 'Try again' },
  },
  'bn-IN': {
    INITIALIZING: { native: 'শুরু হচ্ছে...', english: 'Initializing...' },
    CONNECTING: { native: 'সংযুক্ত হচ্ছে...', english: 'Connecting...' },
    LISTENING: { native: 'আমি শুনছি... বলুন', english: "I'm listening..." },
    THINKING: { native: 'বুঝতে পারছি...', english: 'Understanding...' },
    SPEAKING: { native: 'আমি বুঝিয়ে বলছি...', english: "I'm explaining..." },
    INTERRUPTED: { native: 'হ্যাঁ বলুন', english: 'Yes, tell me' },
    RECOVERING: { native: 'পুনরায় সংযোগ হচ্ছে...', english: 'Reconnecting...' },
    TEXT_FALLBACK: { native: 'লিখে জানতে পারেন', english: 'Text mode' },
    ERROR: { native: 'আবার চেষ্টা করুন', english: 'Try again' },
  },
  'mr-IN': {
    INITIALIZING: { native: 'सुरू होत आहे...', english: 'Initializing...' },
    CONNECTING: { native: 'जोडत आहे...', english: 'Connecting...' },
    LISTENING: { native: 'मी ऐकत आहे... बोला', english: "I'm listening..." },
    THINKING: { native: 'समजून घेत आहे...', english: 'Understanding...' },
    SPEAKING: { native: 'मी सांगत आहे...', english: "I'm explaining..." },
    INTERRUPTED: { native: 'बोला, मी ऐकतेय', english: 'Yes, tell me' },
    RECOVERING: { native: 'पुन्हा जोडत आहे...', english: 'Reconnecting...' },
    TEXT_FALLBACK: { native: 'टाइप करून विचारा', english: 'Text mode' },
    ERROR: { native: 'कृपया पुन्हा प्रयत्न करा', english: 'Try again' },
  },
  'kn-IN': {
    INITIALIZING: { native: 'ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ...', english: 'Initializing...' },
    CONNECTING: { native: 'ಸಂಪರ್ಕಗೊಳ್ಳುತ್ತಿದೆ...', english: 'Connecting...' },
    LISTENING: { native: 'ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ', english: "I'm listening..." },
    THINKING: { native: 'ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ...', english: 'Understanding...' },
    SPEAKING: { native: 'ವಿವರಿಸುತ್ತಿದ್ದೇನೆ...', english: "I'm explaining..." },
    INTERRUPTED: { native: 'ಹೇಳಿ, ಕೇಳುತ್ತಿದ್ದೇನೆ', english: 'Yes, tell me' },
    RECOVERING: { native: 'ಮರುಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...', english: 'Reconnecting...' },
    TEXT_FALLBACK: { native: 'ಬರೆದು ತಿಳಿಸಿ', english: 'Text mode' },
    ERROR: { native: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ', english: 'Try again' },
  },
};

export const AIGuideAvatar: React.FC<AIGuideAvatarProps> = ({
  voiceState,
  micVolume = 0,
  language,
  onAvatarClick,
}) => {
  const isSpeaking = voiceState === 'SPEAKING';
  const isListening = voiceState === 'LISTENING';
  const isThinking = voiceState === 'THINKING';

  const langMap = STATE_MESSAGES[language] || STATE_MESSAGES['ta-IN'];
  const statusMsg = langMap[voiceState] || { native: 'வழிகாட்டுகிறேன்...', english: 'Guiding...' };

  // Calculate dynamic pulse based on real mic volume when listening
  const pulseScale = isListening ? 1 + micVolume * 0.4 : 1;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Outer Pulse Rings */}
      <div className="relative flex items-center justify-center">
        {/* Speaking animation rings */}
        {isSpeaking && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-amber-400/30 animate-ping opacity-75" />
            <div className="absolute w-24 h-24 rounded-full bg-amber-300/40 animate-pulse" />
          </>
        )}

        {/* Listening animation ring reacting to microphone volume */}
        {isListening && (
          <div
            className="absolute rounded-full bg-emerald-500/20 transition-all duration-75"
            style={{
              width: `${7 + pulseScale * 1.5}rem`,
              height: `${7 + pulseScale * 1.5}rem`,
            }}
          />
        )}

        {/* Avatar Button / Icon */}
        <button
          onClick={onAvatarClick}
          aria-label={`SakhiSetu AI guide: ${statusMsg.native}`}
          className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-200 cursor-pointer ${
            isSpeaking
              ? 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white ring-4 ring-amber-300 shadow-amber-500/30 scale-105'
              : isListening
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white ring-4 ring-emerald-300 shadow-emerald-500/30'
              : isThinking
              ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white ring-4 ring-indigo-200 shadow-indigo-500/20 animate-pulse'
              : 'bg-stone-800 text-white'
          }`}
        >
          <span className="text-4xl sm:text-5xl" role="img" aria-label="Sakhi woman avatar">
            👩‍💼
          </span>

          {/* Activity Mini Badge */}
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
            {isSpeaking && <Volume2 className="w-4 h-4 text-amber-600 animate-bounce" />}
            {isListening && <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />}
            {isThinking && (
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            )}
            {!isSpeaking && !isListening && !isThinking && (
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
            )}
          </span>
        </button>
      </div>

      {/* Guide Name */}
      <h2 className="mt-3 text-lg font-bold text-stone-900 tracking-tight">
        SakhiSetu AI
      </h2>

      {/* Status Live Region */}
      <div
        role="status"
        aria-live="polite"
        className="mt-1 flex flex-col items-center"
      >
        <span
          className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5 transition-colors ${
            isSpeaking
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : isListening
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : isThinking
              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
              : 'bg-stone-100 text-stone-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking
                ? 'bg-amber-600 animate-pulse'
                : isListening
                ? 'bg-emerald-600 animate-ping'
                : isThinking
                ? 'bg-indigo-600 animate-pulse'
                : 'bg-stone-400'
            }`}
          />
          <span>{statusMsg.native}</span>
        </span>
        <span className="text-[11px] text-stone-500 mt-0.5">
          {statusMsg.english}
        </span>
      </div>
    </div>
  );
};
