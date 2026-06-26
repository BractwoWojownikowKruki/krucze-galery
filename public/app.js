const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>`;

const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" aria-hidden="true">
  <path d="M20 6 9 17l-5-5"/>
</svg>`;

let allAlbums = [];
let sortMode = 'newest';

// Strips YYYY-MM-DD, YYYY.MM.DD, YYYY-MM, or YYYY.MM prefix from a title.
function displayTitle(title) {
  const stripped = title.replace(/^\d{4}[-.](\d{2})([-.](\d{2}))?\s*/, '').trim();
  return stripped || title;
}

// Normalises date to YYYY-MM-DD for comparison; pads month-only dates with -01.
function sortKey(date) {
  if (!date) return null;
  return date.length === 7 ? date + '-01' : date;
}

function sort(list) {
  return [...list].sort((a, b) => {
    if (sortMode === 'alpha') return displayTitle(a.title).localeCompare(displayTitle(b.title), 'pl');
    const da = sortKey(a.date), db = sortKey(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return sortMode === 'newest' ? db.localeCompare(da) : da.localeCompare(db);
  });
}

function filter(list, query) {
  if (!query) return list;
  return list.filter(a => a.searchText.includes(query));
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}

function renderCard(album) {
  const badge = album.date
    ? `<span class="date-badge">${album.date}</span>`
    : `<span class="no-date-badge">bez daty</span>`;

  return `
    <article class="card" role="listitem">
      <div class="card-cover">
        <a href="${escapeAttr(album.url)}" target="_blank" rel="noopener noreferrer" aria-label="Otwórz album">
          <img
            src="${escapeAttr(album.cover)}"
            alt="${escapeAttr(album.title)}"
            loading="lazy"
            onerror="this.src='covers/placeholder.jpg'"
          />
        </a>
        ${badge}
      </div>
      <div class="card-body">
        <div class="title-row">
          <p class="card-title">${escapeHtml(displayTitle(album.title))}</p>
          <button
            class="btn-copy"
            data-url="${escapeAttr(album.url)}"
            title="Kopiuj link"
            aria-label="Kopiuj link do albumu"
          >${ICON_LINK}</button>
        </div>
      </div>
    </article>`;
}

function update() {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const albums = sort(filter(allAlbums, query));

  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const count = document.getElementById('count');

  const n = albums.length;
  count.textContent = n === 1 ? '1 album' : `${n} albumów`;

  if (!n) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = albums.map(renderCard).join('');
}

document.getElementById('grid').addEventListener('click', e => {
  const btn = e.target.closest('.btn-copy');
  if (!btn) return;
  navigator.clipboard.writeText(btn.dataset.url).catch(() => {});
  const orig = btn.innerHTML;
  btn.innerHTML = ICON_CHECK;
  setTimeout(() => { btn.innerHTML = orig; }, 1500);
});

document.getElementById('search').addEventListener('input', update);
document.getElementById('sort').addEventListener('change', e => {
  sortMode = e.target.value;
  update();
});

fetch('data/albums.generated.json')
  .then(r => r.json())
  .then(data => {
    allAlbums = data;
    update();
  })
  .catch(() => {
    document.getElementById('count').textContent = 'Błąd ładowania danych';
  });
