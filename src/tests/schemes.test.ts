import { describe, expect, it } from 'vitest';
import { SCHEMES } from '../data/schemes';
import { matchSchemes } from '../services/schemes/matcher';

describe('Scheme Catalog & Hybrid Matcher Tests', () => {
  it('contains exactly 56 verified schemes covering all 8 sectors', () => {
    expect(SCHEMES.length).toBe(56);

    const sectors = new Set(SCHEMES.map((s) => s.sector));
    expect(sectors.size).toBe(8);
    expect(sectors.has('EDUCATION')).toBe(true);
    expect(sectors.has('FINANCE')).toBe(true);
    expect(sectors.has('HEALTH')).toBe(true);
    expect(sectors.has('SKILLS')).toBe(true);
    expect(sectors.has('ENTREPRENEURSHIP')).toBe(true);
    expect(sectors.has('SAFETY')).toBe(true);
    expect(sectors.has('HOUSING')).toBe(true);
    expect(sectors.has('AGRICULTURE')).toBe(true);
  });

  it('matches daughter higher education inquiry to Pragati scholarship', () => {
    const results = matchSchemes({
      query: 'என் மகளுக்கு படிப்புக்கு அரசு உதவி வேண்டும்',
    });
    expect(results.length).toBeGreaterThan(0);
    const topScheme = results[0].scheme;
    expect(topScheme.sector).toBe('EDUCATION');
    expect(topScheme.girlFocused).toBe(true);
  });

  it('matches pregnancy nutrition inquiry to PMMVY or maternity support', () => {
    const results = matchSchemes({
      query: 'நான் கர்ப்பமாக இருக்கிறேன் பிரசவ உதவி வேண்டும்',
    });
    expect(results.length).toBeGreaterThan(0);
    const topScheme = results[0].scheme;
    expect(topScheme.sector).toBe('HEALTH');
  });

  it('matches micro-business or tailoring inquiry to livelihood schemes', () => {
    const results = matchSchemes({
      query: 'தையல் தொழில் தொடங்க கடன் வேண்டும்',
    });
    expect(results.length).toBeGreaterThan(0);
    const matchedSectors = results.map((r) => r.scheme.sector);
    expect(
      matchedSectors.includes('ENTREPRENEURSHIP') ||
        matchedSectors.includes('SKILLS') ||
        matchedSectors.includes('FINANCE')
    ).toBe(true);
  });

  it('matches rural farming inquiry to agriculture schemes', () => {
    const results = matchSchemes({
      query: 'விவசாய நிலம் பயிர் காப்பீடு உரம் மானியம்',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].scheme.sector).toBe('AGRICULTURE');
  });

  it('filters by girl-focused only when requested', () => {
    const results = matchSchemes({
      query: 'scholarship',
      girlFocusedOnly: true,
    });
    for (const r of results) {
      expect(r.scheme.girlFocused).toBe(true);
    }
  });

  it('limits candidate results to maximum 4 schemes to avoid cognitive overload', () => {
    const results = matchSchemes({ sector: 'EDUCATION', query: 'scholarship college school' });
    expect(results.length).toBeLessThanOrEqual(4);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns safe fallback popular schemes when query has no direct keyword match', () => {
    const fallbackResults = matchSchemes({ query: 'xyz random non-matching text 12345' });
    expect(fallbackResults.length).toBeGreaterThan(0);
    expect(fallbackResults[0].scheme).toBeDefined();
    expect(fallbackResults[0].matchReasons[0]).toContain('Recommended popular');
  });

  it('filters by rural relevance accurately', () => {
    const ruralResults = matchSchemes({ ruralOnly: true, sector: 'AGRICULTURE' });
    expect(ruralResults.length).toBeGreaterThan(0);
    for (const r of ruralResults) {
      expect(r.scheme.ruralRelevant).toBe(true);
    }
  });

  it('memoizes match query results for fast O(1) repeated retrieval', () => {
    const query = { sector: 'HEALTH' as const, query: 'nutrition maternity' };
    const firstCall = matchSchemes(query);
    const secondCall = matchSchemes(query);
    // Same cached array reference returned without recomputation
    expect(firstCall).toBe(secondCall);
    expect(firstCall.length).toBeGreaterThan(0);
  });
});
