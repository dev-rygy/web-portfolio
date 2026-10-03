// Small formatting helpers shared by templates.

const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2026-03-15" | Date → "Mar 2026". Free text (e.g. "Spring 2025") is returned unchanged. */
export function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return MONTH_YEAR.format(date);
}

/** Sortable timestamp; unknown dates sort last. */
export function dateValue(value) {
  if (!value) return -Infinity;
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  return Number.isNaN(time) ? -Infinity : time;
}

export function isoDate(value) {
  const time = dateValue(value);
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : '';
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;

/** Classify a media reference: 'youtube' | 'video' | 'image' | null. */
export function mediaKind(src) {
  if (!src) return null;
  if (YOUTUBE.test(src)) return 'youtube';
  if (VIDEO_EXT.test(src)) return 'video';
  return 'image';
}

export function youtubeId(src) {
  return src?.match(YOUTUBE)?.[1] ?? null;
}

/** Truncate plain text to a meta-description friendly length. */
export function excerpt(text, max = 160) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}
