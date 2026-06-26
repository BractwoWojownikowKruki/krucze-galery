export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

export function extractTitle(html: string): string | null {
  const ogTitle = extractMeta(html, 'og:title');
  if (ogTitle) return ogTitle.replace(/\s*·.*$/, '').trim();

  const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  if (pageTitle) return pageTitle.replace(/\s*-\s*Google Photos$/i, '').trim();

  return null;
}

export function extractCoverUrl(html: string): string | null {
  return extractMeta(html, 'og:image') ?? extractMeta(html, 'twitter:image') ?? null;
}

// Accepts YYYY-MM-DD / YYYY.MM.DD (returns YYYY-MM-DD) or YYYY-MM / YYYY.MM (returns YYYY-MM).
export function parseDate(title: string): string | null {
  const full = title.match(/^(\d{4})[-.](\d{2})[-.](\d{2})/);
  if (full) return `${full[1]}-${full[2]}-${full[3]}`;
  const month = title.match(/^(\d{4})[-.](\d{2})(?:[^-.\d]|$)/);
  if (month) return `${month[1]}-${month[2]}`;
  return null;
}

// Strips a leading date prefix (YYYY-MM-DD, YYYY.MM.DD, YYYY-MM, YYYY.MM) from the title.
export function displayTitle(title: string): string {
  const stripped = title.replace(/^\d{4}[-.](\d{2})([-.](\d{2}))?\s*/, '').trim();
  return stripped || title;
}

export function makeSearchText(title: string): string {
  return title.toLowerCase().replace(/[–—]/g, '-');
}

export interface AlbumEntry {
  url: string;
  nameOverride?: string;
}

export function parseAlbumsTxt(content: string): AlbumEntry[] {
  const seen = new Set<string>();
  const entries: AlbumEntry[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [rawUrl, rawName] = trimmed.split('|').map(s => s.trim());
    if (!rawUrl) continue;
    if (seen.has(rawUrl)) {
      console.warn(`[warn] Duplikat pominięty: ${rawUrl}`);
      continue;
    }
    seen.add(rawUrl);
    entries.push({ url: rawUrl, nameOverride: rawName || undefined });
  }
  return entries;
}
