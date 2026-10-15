// Clock and masthead date.

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

function renderClock(el) {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');

  // Rebuild only when the minute changes.
  const stamp = `${h}:${m}`;
  if (el.dataset.stamp === stamp) return;
  el.dataset.stamp = stamp;

  el.textContent = '';
  const frag = document.createDocumentFragment();
  for (const ch of `${h}${m}`) {
    // insert colon between hour and minute digits
    if (frag.childNodes.length === 2) {
      const colon = document.createElement('span');
      colon.className = 'colon';
      colon.textContent = ':';
      frag.appendChild(colon);
    }
    const d = document.createElement('span');
    d.className = 'digit';
    d.textContent = ch;
    frag.appendChild(d);
  }
  el.appendChild(frag);
}

export function initClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('masthead-date');

  const tick = () => {
    const now = new Date();
    renderClock(timeEl);
    const iso = now.toISOString().slice(0, 10);
    dateEl.dateTime = iso;
    dateEl.textContent =
      `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  };

  tick();
  setInterval(tick, 1000);
}
