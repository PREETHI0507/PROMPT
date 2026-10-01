import { SCHEMES, Scheme, SchemeSector } from '../../data/schemes';

export interface MatchFilterOptions {
  sector?: SchemeSector;
  query?: string;
  girlFocusedOnly?: boolean;
  ruralOnly?: boolean;
  minAge?: number;
  maxAge?: number;
}

export interface SchemeMatchResult {
  scheme: Scheme;
  score: number;
  matchReasons: string[];
}

const SECTOR_DISTINCT_KEYWORDS: Record<SchemeSector, string[]> = {
  HEALTH: [
    'கர்ப்பம்', 'கர்ப்பமாக', 'பிரசவம்', 'தாய்மை', 'குழந்தை', 'மருத்துவம்', 'ஊட்டச்சத்து',
    'pregnant', 'pregnancy', 'maternity', 'delivery', 'nutrition', 'hospital', 'doctor',
    'garbhavati', 'prasava', 'arogyam', 'ayushman'
  ],
  AGRICULTURE: [
    'விவசாயம்', 'விவசாய', 'விவசாயி', 'பயிர்', 'பயிர்களுக்கு', 'நிலம்', 'உரம்', 'விதை', 'சொட்டுநீர்',
    'kisan', 'kheti', 'farming', 'farmer', 'crop', 'fasal', 'agriculture', 'land', 'drone',
    'vyavasayam', 'sheti', 'krishi'
  ],
  EDUCATION: [
    'படிப்பு', 'கல்வி', 'பள்ளி', 'கல்லூரி', 'உதவித்தொகை', 'மாணவி', 'பட்டப்படிப்பு', 'டிப்ளமோ',
    'padhai', 'shiksha', 'scholarship', 'school', 'college', 'degree', 'diploma', 'study',
    'chadavu', 'vidya', 'shikshan', 'odhu'
  ],
  SKILLS: [
    'தையல்', 'வேலை', 'பயிற்சி', 'சான்றிதழ்', 'தொழிற்பயிற்சி',
    'silai', 'training', 'job', 'skill', 'rozgar', 'kaushal', 'iti',
    'udyoga'
  ],
  ENTREPRENEURSHIP: [
    'சுயதொழில்', 'சுய உதவிக்', 'குழு', 'வியாபாரம்', 'கடை', 'கைவினை',
    'business', 'vyapar', 'shg', 'bachat gat', 'lakhpati', 'shop', 'artisan',
    'svep', 'vishwakarma'
  ],
  SAFETY: [
    'பாதுகாப்பு', 'வன்முறை', 'உதவி எண்', '181', 'விடுதி', 'காப்பகம்',
    'safety', 'violence', 'helpline', 'shelter', 'hostel', 'sakhi', 'police',
    'suraksha', 'sahayata'
  ],
  HOUSING: [
    'வீடு', 'கான்கிரீட்', 'சிலிண்டர்', 'கேஸ்', 'கழிப்பறை', 'குடிநீர்', 'ரேஷன்',
    'makan', 'house', 'gas', 'cylinder', 'ujjwala', 'toilet', 'shauchalaya', 'water', 'ration',
    'mane', 'illu', 'ghar'
  ],
  FINANCE: [
    'சேமிப்பு', 'வங்கி கணக்கு', 'ஓய்வூதியம்', 'காப்பீடு',
    'bank account', 'pension', 'bima', 'insurance', 'saving', 'jan dhan', 'sukanya',
    'dabbulu', 'khate'
  ],
};

export function matchSchemes(options: MatchFilterOptions): SchemeMatchResult[] {
  const query = (options.query || '').toLowerCase().trim();
  const tokens = query.split(/[\s,]+/).filter((t) => t.length > 1);

  // 1. Detect if any sector is explicitly targeted or implied by keywords
  let detectedSector: SchemeSector | undefined = options.sector;
  if (!detectedSector && query) {
    let maxSectorHits = 0;
    for (const [sec, keywords] of Object.entries(SECTOR_DISTINCT_KEYWORDS)) {
      let hits = 0;
      for (const kw of keywords) {
        if (query.includes(kw.toLowerCase())) {
          hits += 1;
        }
      }
      if (hits > maxSectorHits) {
        maxSectorHits = hits;
        detectedSector = sec as SchemeSector;
      }
    }
  }

  const scored: SchemeMatchResult[] = [];

  for (const scheme of SCHEMES) {
    let score = 0;
    const reasons: string[] = [];

    // Sector match gives high base confidence
    if (detectedSector && scheme.sector === detectedSector) {
      score += 60;
      reasons.push(`Sector: ${scheme.sectorLabel}`);
    }

    // Direct scheme keyword match
    for (const kw of scheme.keywords) {
      const kwLower = kw.toLowerCase();
      if (query.includes(kwLower)) {
        score += 30;
        reasons.push(`Matched keyword: ${kw}`);
      }
      for (const token of tokens) {
        if (token === kwLower) {
          score += 20;
        }
      }
    }

    // Name match
    if (scheme.name.toLowerCase().includes(query)) {
      score += 40;
      reasons.push('Name match');
    }

    // Filters
    if (options.girlFocusedOnly && !scheme.girlFocused) {
      continue;
    }
    if (options.ruralOnly && !scheme.ruralRelevant) {
      continue;
    }

    if (score > 0) {
      scored.push({
        scheme,
        score,
        matchReasons: Array.from(new Set(reasons)),
      });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // If no match found via query, provide 3 top schemes in the detected or default sector
  if (scored.length === 0) {
    const targetSector = detectedSector || 'EDUCATION';
    const fallbackList = SCHEMES.filter((s) => s.sector === targetSector).slice(0, 3);
    return fallbackList.map((scheme) => ({
      scheme,
      score: 10,
      matchReasons: ['Recommended popular government support'],
    }));
  }

  // Return top 2 to 4 results
  return scored.slice(0, 4);
}
