import { ArrowRight, Award, CheckCircle } from 'lucide-react';
import React from 'react';
import { Scheme } from '../../data/schemes';

interface SchemeCardProps {
  scheme: Scheme;
  onSelect: (schemeId: string) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = React.memo(({ scheme, onSelect }) => {
  return (
    <div className="bg-white border-2 border-stone-200 hover:border-amber-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between text-left group">
      <div>
        {/* Sector Tag */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
            {scheme.sectorLabel}
          </span>
          {scheme.womenFocused && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>பெண்களுக்கானது</span>
            </span>
          )}
        </div>

        {/* Scheme Name */}
        <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug mb-2">
          {scheme.name}
        </h3>

        {/* Simple Explanation */}
        <p className="text-sm text-stone-700 leading-relaxed mb-3">
          {scheme.simpleExplanation}
        </p>

        {/* Main Benefit Box */}
        {scheme.benefits[0] && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-3 text-xs sm:text-sm text-amber-950 flex items-start gap-2">
            <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">முக்கிய நன்மை (Main Benefit):</span>
              <span className="leading-snug">{scheme.benefits[0]}</span>
            </div>
          </div>
        )}

        {/* Why Relevant */}
        <p className="text-xs text-stone-500 italic mb-4">
          💡 {scheme.whyRelevant}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(scheme.id)}
        aria-label={`${scheme.name} பற்றி அறியவும் (Learn about this scheme)`}
        className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group-hover:shadow focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <span>இதைப் பற்றி அறியவும் (Learn about this)</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
});
