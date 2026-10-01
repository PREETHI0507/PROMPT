import { Sparkles } from 'lucide-react';
import React from 'react';
import { getSchemeById } from '../../data/schemes';
import { SchemeCard } from '../SchemeCard/SchemeCard';

interface SchemeResultsProps {
  candidateSchemeIds: string[];
  userNeed?: string;
  onSelectScheme: (schemeId: string) => void;
}

export const SchemeResults: React.FC<SchemeResultsProps> = React.memo(({
  candidateSchemeIds,
  userNeed,
  onSelectScheme,
}) => {
  const schemes = candidateSchemeIds
    .map((id) => getSchemeById(id))
    .filter(Boolean) as ReturnType<typeof getSchemeById>[];

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg mb-1">
          <Sparkles className="w-5 h-5 text-amber-700" />
          <span>பொருத்தமான அரசு உதவிகள் • Recommended Government Support</span>
        </div>
        <p className="text-stone-700 text-xs sm:text-sm">
          {userNeed
            ? `நீங்கள் கூறிய தேவைக்கு ஏற்ப (${userNeed}) பயனுள்ள அரசு திட்டங்கள் கீழே உள்ளன. எதைப்பற்றி தெரிந்து கொள்ள விரும்புகிறீர்கள்?`
            : 'நீங்கள் கூறிய விவரங்களுக்கு பொருத்தமான அரசு திட்டங்கள் கீழே உள்ளன. எதைப்பற்றி தெரிந்து கொள்ள விரும்புகிறீர்கள்?'}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme) => (
          scheme && (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onSelect={onSelectScheme}
            />
          )
        ))}
      </div>
    </div>
  );
});
