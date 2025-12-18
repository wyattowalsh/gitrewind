// Shareable URL encoding/decoding
import LZString from 'lz-string';
import type { UnifiedParameters } from '@/types/parameters';

interface ShareData {
  u: string;      // username
  y: number;      // year
  s: number;      // seed
  t: number;      // tempo bpm
  i: number;      // intensity (0-100)
  c: number;      // complexity (0-100)
  p: string;      // primary color hex
  k: string;      // key (e.g., "Cmajor")
  a: string;      // art style
  tc: number;     // total commits
  ad: number;     // active days
  ls: number;     // longest streak
  tl: string;     // top language
}

export function encodeShareData(params: UnifiedParameters): string {
  const data: ShareData = {
    u: params.username,
    y: params.year,
    s: params.seed,
    t: params.tempo.bpm,
    i: Math.round(params.intensity * 100),
    c: Math.round(params.complexity * 100),
    p: `${params.colors.primary.h},${params.colors.primary.s},${params.colors.primary.l}`,
    k: `${params.music.key.root}${params.music.key.mode}`,
    a: params.art.style,
    tc: params.stats.totalCommits,
    ad: params.stats.activeDays,
    ls: params.stats.longestStreak,
    tl: params.stats.topLanguage,
  };

  const json = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;

    const data = JSON.parse(decompressed) as ShareData;
    return data;
  } catch (e) {
    console.error('Failed to decode share data:', e);
    return null;
  }
}

export function createShareUrl(params: UnifiedParameters): string {
  const encoded = encodeShareData(params);
  return `${window.location.origin}/r/${encoded}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

export function generateShareText(params: UnifiedParameters): string {
  return `🎵 My ${params.year} in code: ${params.stats.totalCommits.toLocaleString()} commits, ${params.stats.activeDays} active days, powered by ${params.stats.topLanguage}

Check out my Git Rewind: ${createShareUrl(params)}

#GitRewind${params.year} #GitHub`;
}

export function shareToTwitter(params: UnifiedParameters): void {
  const text = generateShareText(params);
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

export function shareToLinkedIn(params: UnifiedParameters): void {
  const url = createShareUrl(params);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=550,height=420');
}
