const entities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
  '#x27': "'",
  '#x2F': '/',
};

export function plainText(html?: string) {
  if (!html) return '';
  return html
    .replace(/<p>/gi, '\n\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&([^;]+);/g, (match, entity: string) => {
      if (entities[entity]) return entities[entity];
      if (entity.startsWith('#')) {
        const radix = entity[1]?.toLowerCase() === 'x' ? 16 : 10;
        const value = Number.parseInt(entity.slice(radix === 16 ? 2 : 1), radix);
        return Number.isNaN(value) ? match : String.fromCodePoint(value);
      }
      return match;
    })
    .trim();
}

export function relativeTime(unixTime?: number) {
  if (!unixTime) return '';
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - unixTime));
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function hostname(url?: string) {
  if (!url) return 'news.ycombinator.com';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
