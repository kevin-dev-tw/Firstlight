// Index: user-curated shortcuts rendered like a table of contents.

import { get, set } from './store.js';

const DASH_ICONS =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png';

const DEFAULT_SHORTCUTS = [
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Gmail', url: 'https://mail.google.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'Google Calendar', url: 'https://calendar.google.com' },
];

let shortcuts = [];

function slugify(name) {
  return name.toLowerCase().trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function faviconUrl(pageUrl) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    const u = new URL(chrome.runtime.getURL('/_favicon/'));
    u.searchParams.set('pageUrl', pageUrl);
    u.searchParams.set('size', '32');
    return u.toString();
  }
  return null;
}

function buildFavicon(s) {
  const wrap = document.createElement('span');
  wrap.className = 'shortcut-favicon';

  // Chain: dashboardicons slug -> chrome /_favicon/ -> letter monogram
  const candidates = [`${DASH_ICONS}/${slugify(s.name)}.png`];
  const favi = faviconUrl(s.url);
  if (favi) candidates.push(favi);

  const img = document.createElement('img');
  img.alt = '';
  let i = 0;
  const tryNext = () => {
    if (i >= candidates.length) {
      wrap.textContent = '';
      wrap.appendChild(monogram(s.name));
      return;
    }
    img.src = candidates[i++];
  };
  img.addEventListener('error', tryNext);
  tryNext();
  wrap.appendChild(img);
  return wrap;
}

function monogram(name) {
  const m = document.createElement('span');
  m.className = 'monogram';
  m.textContent = (name.trim()[0] || '?').toUpperCase();
  return m;
}

function render(listEl) {
  listEl.textContent = '';
  const frag = document.createDocumentFragment();

  shortcuts.forEach((s) => {
    const li = document.createElement('li');
    li.className = 'shortcut';

    const a = document.createElement('a');
    a.className = 'shortcut-link';
    a.href = s.url;
    a.setAttribute('aria-label', s.name);

    const name = document.createElement('span');
    name.className = 'shortcut-name';
    name.textContent = s.name;
    name.setAttribute('aria-hidden', 'true');

    a.append(buildFavicon(s), name);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'shortcut-remove';
    remove.textContent = '\u00d7';
    remove.setAttribute('aria-label', `Remove ${s.name}`);
    remove.addEventListener('click', () => {
      shortcuts = shortcuts.filter((x) => x !== s);
      set({ shortcuts });
      render(listEl);
    });

    li.append(a, remove);
    frag.appendChild(li);
  });

  listEl.appendChild(frag);
}

export async function initShortcuts() {
  const listEl = document.getElementById('shortcut-list');
  const toggle = document.getElementById('shortcut-add-toggle');
  const modal = document.getElementById('shortcut-modal');
  const form = document.getElementById('shortcut-form');
  const cancel = document.getElementById('shortcut-cancel');
  const nameInput = document.getElementById('shortcut-name');
  const urlInput = document.getElementById('shortcut-url');

  const data = await get(['shortcuts']);
  shortcuts = Array.isArray(data.shortcuts) && data.shortcuts.length
    ? data.shortcuts
    : [...DEFAULT_SHORTCUTS];
  render(listEl);

  toggle.addEventListener('click', () => {
    modal.showModal();
    nameInput.focus();
  });

  cancel.addEventListener('click', () => modal.close());

  // Click on the backdrop (the dialog element itself) closes the modal.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      urlInput.focus();
      return;
    }
    shortcuts.push({ name, url });
    set({ shortcuts });
    render(listEl);
    form.reset();
    modal.close();
  });
}
