import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, extractTitle, makeSearchText, displayTitle, parseAlbumsTxt } from './utils.ts';

describe('parseDate', () => {
  it('parses YYYY-MM-DD prefix', () => {
    assert.equal(parseDate('2024-08-03 Wolin'), '2024-08-03');
  });

  it('parses YYYY.MM.DD prefix and normalises to hyphens', () => {
    assert.equal(parseDate('2024.08.03 Wolin'), '2024-08-03');
  });

  it('parses YYYY.MM.DD with no trailing text', () => {
    assert.equal(parseDate('2014.06.21 Poznań Kupała'), '2014-06-21');
  });

  it('returns null when date is at end of title, not prefix', () => {
    assert.equal(parseDate('Wolin 2024'), null);
  });

  it('returns null for title with no date at all', () => {
    assert.equal(parseDate('Album bez tytułu'), null);
  });

  it('returns null for empty string', () => {
    assert.equal(parseDate(''), null);
  });

  it('parses YYYY-MM prefix (month only)', () => {
    assert.equal(parseDate('2010-05 Dziesięciolecie'), '2010-05');
  });

  it('parses YYYY.MM prefix (month only, dots)', () => {
    assert.equal(parseDate('2010.05 Dziesięciolecie'), '2010-05');
  });

  it('parses YYYY-MM with no trailing text', () => {
    assert.equal(parseDate('2010-05'), '2010-05');
  });

  it('prefers full date over month-only when both could match', () => {
    assert.equal(parseDate('2024-08-03 Wolin'), '2024-08-03');
  });
});

describe('extractTitle', () => {
  it('strips og:title date+emoji suffix', () => {
    const html = '<meta property="og:title" content="2024-08-03 Wolin · Saturday, Aug 3, 2024 📸">';
    assert.equal(extractTitle(html), '2024-08-03 Wolin');
  });

  it('strips "- Google Photos" from page title', () => {
    const html = '<title>2024-08-03 Wolin - Google Photos</title>';
    assert.equal(extractTitle(html), '2024-08-03 Wolin');
  });

  it('prefers og:title over page title', () => {
    const html = '<meta property="og:title" content="OG Title · suffix"><title>Page Title - Google Photos</title>';
    assert.equal(extractTitle(html), 'OG Title');
  });

  it('returns null when no title found', () => {
    assert.equal(extractTitle('<html><body></body></html>'), null);
  });
});

describe('displayTitle', () => {
  it('strips YYYY-MM-DD prefix', () => {
    assert.equal(displayTitle('2024-08-03 Wolin'), 'Wolin');
  });

  it('strips YYYY.MM.DD prefix', () => {
    assert.equal(displayTitle('2024.08.03 Wolin'), 'Wolin');
  });

  it('strips YYYY-MM prefix', () => {
    assert.equal(displayTitle('2010-05 Dziesięciolecie'), 'Dziesięciolecie');
  });

  it('strips YYYY.MM prefix', () => {
    assert.equal(displayTitle('2010.05 Dziesięciolecie'), 'Dziesięciolecie');
  });

  it('returns original title when no date prefix', () => {
    assert.equal(displayTitle('Album bez tytułu'), 'Album bez tytułu');
  });

  it('returns original title when title is only a date (no name)', () => {
    assert.equal(displayTitle('2024-08-03'), '2024-08-03');
  });
});

describe('parseAlbumsTxt', () => {
  it('parses a plain URL line', () => {
    const result = parseAlbumsTxt('https://photos.app.goo.gl/abc');
    assert.deepEqual(result, [{ url: 'https://photos.app.goo.gl/abc', nameOverride: undefined }]);
  });

  it('parses a URL with name override', () => {
    const result = parseAlbumsTxt('https://photos.app.goo.gl/abc | 2024-08-03 Wolin');
    assert.deepEqual(result, [{ url: 'https://photos.app.goo.gl/abc', nameOverride: '2024-08-03 Wolin' }]);
  });

  it('skips comment lines', () => {
    const result = parseAlbumsTxt('# comment\nhttps://photos.app.goo.gl/abc');
    assert.equal(result.length, 1);
  });

  it('skips blank lines', () => {
    const result = parseAlbumsTxt('\nhttps://photos.app.goo.gl/abc\n\n');
    assert.equal(result.length, 1);
  });

  it('deduplicates URLs', () => {
    const result = parseAlbumsTxt('https://photos.app.goo.gl/abc\nhttps://photos.app.goo.gl/abc');
    assert.equal(result.length, 1);
  });

  it('trims whitespace around url and name', () => {
    const result = parseAlbumsTxt('  https://photos.app.goo.gl/abc  |  2024-08-03 Wolin  ');
    assert.deepEqual(result, [{ url: 'https://photos.app.goo.gl/abc', nameOverride: '2024-08-03 Wolin' }]);
  });
});

describe('makeSearchText', () => {
  it('lowercases the title', () => {
    assert.equal(makeSearchText('Wolin Walki'), 'wolin walki');
  });

  it('replaces en-dash with hyphen', () => {
    assert.equal(makeSearchText('Wolin – Walki'), 'wolin - walki');
  });

  it('replaces em-dash with hyphen', () => {
    assert.equal(makeSearchText('Wolin — Walki'), 'wolin - walki');
  });
});
