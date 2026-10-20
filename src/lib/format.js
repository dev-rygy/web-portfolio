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

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const ONGOING = /^(present|now|current|ongoing)$/i;

/**
 * Timestamp for the END of a display range like "May 2025 - Jul 2026", "Nov 2024 - Present",
 * "Apr 2024" or "2021". A single date counts as both start and end; "Present" means now.
 * Returns NaN when the text isn't a recognisable date (e.g. "Various").
 */
export function rangeEndValue(text, now = Date.now()) {
  if (!text) return NaN;
  const end = String(text).split(/\s+(?:-|–|—|to)\s+/i).pop().trim();
  if (ONGOING.test(end)) return now;

  let match = end.match(/^([a-z]{3,9})\.?\s+(\d{4})$/i); // "Jul 2026", "September 2023"
  if (match) {
    const month = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase());
    return month === -1 ? NaN : Date.UTC(Number(match[2]), month, 1);
  }
  match = end.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/); // "2021", "2026-07", "2026-07-15"
  if (match) return Date.UTC(Number(match[1]), Number(match[2] ?? 1) - 1, Number(match[3] ?? 1));
  return NaN;
}

/**
 * Sort key for "chronological" lists: the end of `dates` when it can be read,
 * otherwise `date`. Newest-first sorting uses this descending.
 */
export function sortValue(item, now = Date.now()) {
  const end = rangeEndValue(item.dates, now);
  return Number.isFinite(end) ? end : dateValue(item.date);
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
