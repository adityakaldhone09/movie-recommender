export function formatYear(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

export function formatRating(val?: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return val.toFixed(1);
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatMatchPercentage(score: number): string {
  // score is cosine similarity between 0 and 1
  const pct = Math.min(Math.max(Math.round(score * 100), 40), 99);
  return `${pct}% Match`;
}

export function truncateText(text?: string | null, maxLength = 160): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

