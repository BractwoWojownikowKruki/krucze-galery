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

// Accepts YYYY-MM-DD or YYYY.MM.DD at start of title, always returns YYYY-MM-DD.
export function parseDate(title: string): string | null {
  const m = title.match(/^(\d{4})[.\-](\d{2})[.\-](\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export function makeSearchText(title: string): string {
  return title.toLowerCase().replace(/[–—]/g, '-');
}
