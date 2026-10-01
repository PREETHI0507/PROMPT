import {
  Activity,
  ArrowLeft,
  Globe,
  Mic,
  MicOff,
  Send,
} from 'lucide-react';
import React, { useState } from 'react';
import { SupportedLanguageCode, getLanguageConfig } from '../../data/languages';
import { VoiceState } from '../../services/gemini/liveSession';
import { MicErrorType } from '../../services/voice/microphone';

interface VoiceStatusBarProps {
  voiceState: VoiceState;
  micActive: boolean;
  micVolume: number;
  micError: MicErrorType | null;
  language: SupportedLanguageCode;
  canGoBack: boolean;
  onGoBack: () => void;
  onToggleMic: () => void;
  onChangeLanguage: () => void;
  onSendTextMessage: (text: string) => void;
  onToggleDiagnostics: () => void;
  diagnosticsOpen: boolean;
}

export const VoiceStatusBar: React.FC<VoiceStatusBarProps> = ({
  voiceState,
  micActive,
  micVolume,
  micError,
  language,
  canGoBack,
  onGoBack,
  onToggleMic,
  onChangeLanguage,
  onSendTextMessage,
  onToggleDiagnostics,
  diagnosticsOpen,
}) => {
  const [textInput, setTextInput] = useState('');
  const [isTypingExpanded, setIsTypingExpanded] = useState(false);
  const langConfig = getLanguageConfig(language);

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSendTextMessage(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl px-4 py-3 sticky bottom-0 z-30">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Error Notification Banner if Mic Failed */}
        {micError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <span>
              {micError === 'PERMISSION_DENIED'
                ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. நீங்கள் கீழே தட்டச்சு செய்து பேசலாம் (Microphone blocked. You can type below).'
                : 'மைக் கிடைக்கவில்லை. நீங்கள் தட்டச்சு செய்து தொடரலாம் (Microphone not found. You can type below).'}
            </span>
            <button
              onClick={() => setIsTypingExpanded(true)}
              className="font-bold underline ml-2 cursor-pointer"
            >
              தட்டச்சு செய்க
            </button>
          </div>
        )}

        {/* Text Input Row (Always accessible or expandable) */}
        {isTypingExpanded && (
          <form onSubmit={handleSubmitText} className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`உங்கள் தேவையை இங்கே தட்டச்சு செய்யவும் (${langConfig.name})...`}
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">அனுப்பு</span>
            </button>
          </form>
        )}

        {/* Primary Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left Controls: Back & Language */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {canGoBack && (
              <button
                onClick={onGoBack}
                aria-label="முந்தைய பக்கம் செல்லவும் (Go back)"
                className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">திரும்பு</span>
              </button>
            )}

            <button
              onClick={onChangeLanguage}
              aria-label="மொழியை மாற்றவும் (Change language)"
              className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Globe className="w-4 h-4 text-amber-700" />
              <span>{langConfig.name}</span>
            </button>
          </div>

          {/* Center Voice Wave / Mic Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMic}
              aria-label={micActive ? 'மைக்கை அணைக்க (Mute mic)' : 'மைக்கை இயக்க (Unmute mic)'}
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-sm transition-all cursor-pointer ${
                micActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-300'
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
              }`}
            >
              {micActive ? (
                <>
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="hidden sm:inline">
                    {voiceState === 'SPEAKING' ? 'AI பேசுகிறது' : 'கேட்கிறேன்...'}
                  </span>
                  {/* Real Audio Volume Wave */}
                  <span className="flex items-end gap-0.5 h-4">
                    <span
                      className="w-1 bg-white rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, micVolume * 16)}px` }}
                    />
                    <span
                      className="w-1 bg-white rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, micVolume * 22)}px` }}
                    />
                    <span
                      className="w-1 bg-white rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, micVolume * 12)}px` }}
                    />
                  </span>
                </>
              ) : (
                <>
                  <MicOff className="w-5 h-5 text-stone-500" />
                  <span className="text-xs sm:text-sm text-stone-600">மைக் அணைக்கப்பட்டது</span>
                </>
              )}
            </button>
          </div>

          {/* Right Controls: Type Fallback toggle & Diagnostics */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsTypingExpanded(!isTypingExpanded)}
              className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              title="எழுத்து வடிவில் பேச (Type text)"
            >
              <span className="text-sm">⌨️</span>
              <span className="hidden sm:inline ml-1">
                {isTypingExpanded ? 'மூடு' : 'எழுது'}
              </span>
            </button>

            <button
              onClick={onToggleDiagnostics}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                diagnosticsOpen
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
              title="Development & Live Diagnostics"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
