// Mini month calendar for the rail. Read-only, pure information.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function render(monthEl, gridEl) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = now.getDate();

  monthEl.textContent = `${MONTHS[m]} ${y}`;

  const first = new Date(y, m, 1);
  const lead = (first.getDay() + 6) % 7;   // Monday-start offset
  const days = new Date(y, m + 1, 0).getDate();

  const frag = document.createDocumentFragment();

  for (const d of DOW) {
    const el = document.createElement('span');
    el.className = 'cal-dow';
    el.textContent = d;
    frag.appendChild(el);
  }

  for (let i = 0; i < lead; i++) {
    frag.appendChild(document.createElement('span'));
  }

  for (let d = 1; d <= days; d++) {
    const el = document.createElement('span');
    el.className = 'cal-day';
    el.textContent = d;
    if (d === today) {
      el.classList.add('today');
      el.setAttribute('aria-current', 'date');
    }
    frag.appendChild(el);
  }

  gridEl.textContent = '';
  gridEl.appendChild(frag);

  return today;
}

export function initCalendar() {
  const monthEl = document.getElementById('cal-month');
  const gridEl = document.getElementById('mini-cal');

  let day = render(monthEl, gridEl);

  // Redraw if the tab stays open across midnight.
  setInterval(() => {
    if (new Date().getDate() !== day) day = render(monthEl, gridEl);
  }, 60_000);
}
