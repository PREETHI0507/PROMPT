import { Sparkles, User } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { SupportedLanguageCode, getLanguageConfig } from '../../data/languages';
import { LiveMessageTranscriptItem } from '../../services/gemini/liveSession';

interface LiveTranscriptProps {
  transcripts: LiveMessageTranscriptItem[];
  language: SupportedLanguageCode;
  onSampleQueryClick?: (queryText: string) => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = React.memo(({
  transcripts,
  language,
  onSampleQueryClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const langConfig = getLanguageConfig(language);
  const visibleTranscripts = transcripts.length > 80 ? transcripts.slice(-80) : transcripts;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-stone-800 tracking-tight">
            உரையாடல் • Live Conversation
          </h3>
        </div>
        <span className="text-xs text-stone-500 font-medium">
          {langConfig.englishName} ({langConfig.name})
        </span>
      </div>

      {/* Message Log */}
      <div
        ref={containerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm sm:text-base scroll-smooth max-h-[360px] sm:max-h-[440px]"
      >
        {transcripts.length === 0 ? (
          <div className="py-8 text-center text-stone-500 space-y-3">
            <p className="font-medium text-stone-700">
              {langConfig.greetingText}
            </p>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              {langConfig.explanationText}
              <br />
              {langConfig.questionText}
            </p>

            {/* Quick Prompts / Examples */}
            {onSampleQueryClick && (
              <div className="pt-4 border-t border-stone-100 max-w-md mx-auto">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>அல்லது தொட்டு பேசலாம் (Quick Examples)</span>
                </p>
                <div className="flex flex-col gap-2">
                  {langConfig.sampleQueries.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSampleQueryClick(sample.text)}
                      className="text-left p-2.5 text-xs sm:text-sm bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 text-stone-800 rounded-xl transition-all cursor-pointer font-medium hover:border-amber-400"
                    >
                      <span className="font-semibold text-amber-900 block mb-0.5">
                        {sample.label}
                      </span>
                      <span>&ldquo;{sample.text}&rdquo;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          visibleTranscripts.map((item) => {
            const isAI = item.sender === 'ai';
            return (
              <div
                key={item.id}
                className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Sender Badge / Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isAI
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-stone-800 text-stone-100'
                  }`}
                >
                  {isAI ? (
                    <span className="text-sm">👩‍💼</span>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                    isAI
                      ? 'bg-amber-50 border border-amber-200/80 text-stone-900 rounded-tl-sm'
                      : 'bg-stone-900 text-stone-50 rounded-tr-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[11px] font-bold tracking-wider uppercase ${
                        isAI ? 'text-amber-800' : 'text-stone-400'
                      }`}
                    >
                      {isAI ? 'SAKHISETU AI' : 'YOU (நீங்கள்)'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-normal">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
