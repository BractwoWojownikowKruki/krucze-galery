import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import https from 'https';
import { join } from 'path';
import { extractCoverUrl, extractTitle, makeSearchText, parseDate } from './utils.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const ALBUMS_TXT = join(ROOT, 'albums.txt');
const GENERATED_JSON = join(ROOT, 'public/data/albums.generated.json');
const COVERS_DIR = join(ROOT, 'public/covers');

interface AlbumRecord {
  url: string;
  title: string;
  date: string | null;
  cover: string;
  searchText: string;
  lastSyncedAt: string;
  syncStatus: 'ok' | 'failed';
}

function parseAlbumsTxt(content: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (seen.has(trimmed)) {
      console.warn(`[warn] Duplikat pominięty: ${trimmed}`);
      continue;
    }
    seen.add(trimmed);
    urls.push(trimmed);
  }
  return urls;
}

function coverHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 8);
}

// Google Photos short URLs (photos.app.goo.gl) return 302 only to minimal UAs.
// Full browser UAs get a Firebase DurableDeepLink page (200) with no metadata.
// Fix: resolve the short URL with a minimal UA first, then fetch the real album page.
function resolveShortUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve(res.headers.location ?? url);
      res.destroy();
    }).on('error', reject);
  });
}

async function fetchHtml(url: string): Promise<string> {
  const resolvedUrl = await resolveShortUrl(url);
  const res = await fetch(resolvedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function downloadCover(coverUrl: string, destPath: string): Promise<void> {
  const res = await fetch(coverUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; KruczeGalery/1.0)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buf));
}

async function syncAlbum(url: string, cached: AlbumRecord | undefined): Promise<AlbumRecord> {
  const hash = coverHash(url);
  const coverFile = `${hash}.jpg`;
  const coverPath = join(COVERS_DIR, coverFile);
  const coverPublic = `covers/${coverFile}`;
  const now = new Date().toISOString();

  try {
    console.log(`[sync] ${url}`);
    const html = await fetchHtml(url);

    const title = extractTitle(html) ?? cached?.title ?? 'Album bez tytułu';
    const coverUrl = extractCoverUrl(html);

    if (coverUrl) {
      try {
        await downloadCover(coverUrl, coverPath);
      } catch (e) {
        console.warn(`[warn] Nie udało się pobrać okładki: ${(e as Error).message}`);
      }
    }

    const cover = existsSync(coverPath)
      ? coverPublic
      : (cached?.cover ?? 'covers/placeholder.jpg');

    return {
      url,
      title,
      date: parseDate(title),
      cover,
      searchText: makeSearchText(title),
      lastSyncedAt: now,
      syncStatus: 'ok',
    };
  } catch (e) {
    console.error(`[error] ${url}: ${(e as Error).message}`);
    return {
      url,
      title: cached?.title ?? 'Album bez tytułu',
      date: cached?.date ?? null,
      cover: cached?.cover ?? 'covers/placeholder.jpg',
      searchText: cached?.searchText ?? '',
      lastSyncedAt: now,
      syncStatus: 'failed',
    };
  }
}

async function main(): Promise<void> {
  mkdirSync(COVERS_DIR, { recursive: true });

  const urls = parseAlbumsTxt(readFileSync(ALBUMS_TXT, 'utf8'));
  console.log(`[sync] Znaleziono ${urls.length} album(ów) w albums.txt`);

  const existing: AlbumRecord[] = existsSync(GENERATED_JSON)
    ? JSON.parse(readFileSync(GENERATED_JSON, 'utf8'))
    : [];

  const cache = new Map(existing.map(a => [a.url, a]));

  const results: AlbumRecord[] = [];
  for (const url of urls) {
    results.push(await syncAlbum(url, cache.get(url)));
  }

  writeFileSync(GENERATED_JSON, JSON.stringify(results, null, 2) + '\n');
  console.log(`[sync] Zapisano ${results.length} rekord(ów) do albums.generated.json`);

  const failed = results.filter(r => r.syncStatus === 'failed').length;
  if (failed > 0) {
    console.warn(`[sync] ${failed} album(ów) nie udało się zsynchronizować — zachowano dane z cache`);
  }
}

main().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
