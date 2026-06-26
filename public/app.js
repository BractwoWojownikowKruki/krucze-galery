const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
</svg>`;

const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" aria-hidden="true">
  <path d="M20 6 9 17l-5-5"/>
</svg>`;

let allAlbums = [];
let sortMode = 'newest';

function sort(list) {
  return [...list].sort((a, b) => {
    if (sortMode === 'alpha') return a.title.localeCompare(b.title, 'pl');
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return sortMode === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date);
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
        <img
          src="${escapeAttr(album.cover)}"
          alt="${escapeAttr(album.title)}"
          loading="lazy"
          onerror="this.src='covers/placeholder.jpg'"
        />
        ${badge}
      </div>
      <div class="card-body">
        <p class="card-title">${escapeHtml(album.title)}</p>
        <div class="card-actions">
          <a
            href="${escapeAttr(album.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-open"
          >Otwórz ↗</a>
          <button
            class="btn btn-copy"
            data-url="${escapeAttr(album.url)}"
            title="Kopiuj URL"
            aria-label="Kopiuj URL albumu"
          >${ICON_COPY}</button>
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
