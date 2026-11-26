// Landing: the same live components inside a bento (DESIGN.md §5).
// Every tile is real: the clock ticks, search submits, todos toggle,
// the dock holds the user's actual shortcuts.

import { initClock } from './clock.js';
import { initSearch } from './search.js';
import { initTodos } from './todos.js';
import { initDots } from './dots.js';
import { get, hasChromeStorage } from './store.js';
import { buildFavicon, DEFAULT_SHORTCUTS } from './shortcuts.js';

initDots();
initClock();
initSearch();
initTodos();

const dockEl = document.getElementById('landing-dock');
const data = await get(['shortcuts']);
const items = Array.isArray(data.shortcuts) && data.shortcuts.length
  ? data.shortcuts
  : DEFAULT_SHORTCUTS;

for (const s of items) {
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
  li.appendChild(a);
  dockEl.appendChild(li);
}

// Sync tile: name the storage backend actually in use.
document.getElementById('sync-status').textContent =
  hasChromeStorage ? 'chrome.storage.sync' : 'localStorage';

// Feature card: mirror the live clock (keeps the cobalt colon span).
const clockEl = document.getElementById('clock-time');
const mirrors = document.querySelectorAll('[data-clock-mirror]');
const syncMirrors = () =>
  mirrors.forEach((m) => { m.innerHTML = clockEl.innerHTML; });
new MutationObserver(syncMirrors)
  .observe(clockEl, { childList: true, characterData: true, subtree: true });
syncMirrors();

// Feature card: real favicons from the same shortcuts the dock shows.
const fragDock = document.getElementById('frag-dock');
for (const s of items.slice(0, 4)) {
  const li = document.createElement('li');
  li.appendChild(buildFavicon(s));
  fragDock.appendChild(li);
}

// Feature card: this month's real calendar, today marked.
const calEl = document.getElementById('mini-cal');
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const daysInMonth = new Date(year, month + 1, 0).getDate();
// Week starts Monday, matching the product's calendar.
const lead = (new Date(year, month, 1).getDay() + 6) % 7;

for (const d of ['M', 'T', 'W', 'T', 'F', 'S', 'S']) {
  const el = document.createElement('span');
  el.className = 'cal-dow';
  el.textContent = d;
  calEl.appendChild(el);
}
for (let i = 0; i < lead; i++) calEl.appendChild(document.createElement('span'));
for (let day = 1; day <= daysInMonth; day++) {
  const el = document.createElement('span');
  el.className = day === now.getDate() ? 'cal-day cal-today' : 'cal-day';
  el.textContent = day;
  calEl.appendChild(el);
}
