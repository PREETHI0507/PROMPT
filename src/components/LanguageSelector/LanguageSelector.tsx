import { CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import React from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '../../data/languages';

interface LanguageSelectorProps {
  onSelectLanguage: (code: SupportedLanguageCode) => void;
  onLaunchDemo?: (code: SupportedLanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onSelectLanguage,
  onLaunchDemo,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl shadow-amber-500/20 mb-5">
          <span className="text-4xl" role="img" aria-label="Sakhi avatar">
            👩‍💼
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          SakhiSetu AI
        </h1>
        <p className="mt-2 text-xl font-medium text-amber-800">
          சகிசேது • Just speak. I’ll guide you.
        </p>
        <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
          An AI companion for rural women discovering government welfare schemes.
          Choose your language below to start speaking immediately.
        </p>
      </div>

      {/* Primary Instruction Card */}
      <div className="bg-amber-100/70 border-2 border-amber-300/80 rounded-2xl p-5 mb-8 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-lg mb-1">
          <Volume2 className="w-6 h-6 text-amber-700 animate-pulse" />
          <span>உங்கள் மொழியைத் தேர்ந்தெடுக்கவும் • अपनी भाषा चुनें</span>
        </div>
        <p className="text-stone-750 text-sm sm:text-base">
          மொழியைத் தொட்டவுடன் சகிசேது AI தானாகவே உங்களுடன் பேசத் தொடங்கும்.
          <br className="hidden sm:inline" />
          (Once you touch your language, SakhiSetu starts speaking automatically. No other button needed.)
        </p>
      </div>

      {/* Language Grid */}
      <div
        role="region"
        aria-label="Language selection"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
            className="group relative flex flex-col items-start p-6 bg-white hover:bg-amber-50/80 border-2 border-stone-200 hover:border-amber-600 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/30"
          >
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                {lang.name}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 rounded-lg">
                {lang.englishName}
              </span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-1 mb-4">
              {lang.greetingText}
            </p>
            <div className="mt-auto w-full pt-3 border-t border-stone-100 flex items-center justify-between text-amber-700 font-semibold text-sm">
              <span>பேசத் தொடங்குங்கள்</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Judge / Evaluator Demo Mode */}
      {onLaunchDemo && (
        <div className="mb-8 p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider uppercase mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Hackathon Evaluator Quick-Demo</span>
              </div>
              <p className="text-stone-300 text-sm">
                Experience the live end-to-end flow with the exact challenge prompt:
                <br />
                <span className="italic text-white font-medium">
                  &ldquo;என் மகளுக்கு படிப்புக்கு அரசு உதவி வேண்டும்&rdquo;
                </span>
                (Daughter education scholarship in Tamil).
              </p>
            </div>
            <button
              onClick={() => onLaunchDemo('ta-IN')}
              className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch Live Tamil Demo</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Privacy and Trust Disclaimers */}
      <div className="border-t border-stone-200/80 pt-6 text-center space-y-2 text-xs text-stone-500 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-1.5 text-stone-700 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>We NEVER collect Aadhaar numbers, OTPs, bank passwords, or raw recordings.</span>
        </div>
        <p>
          SakhiSetu AI is an independent conversational prototype built for the Google for Developers
          PromptWars × HackArena challenge. It is not an official Government of India portal.
        </p>
      </div>
    </div>
  );
};
