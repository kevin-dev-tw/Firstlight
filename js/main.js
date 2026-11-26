// Firstlight bootstrap.

import { initClock } from './clock.js';
import { initSearch } from './search.js';
import { initCalendar } from './calendar.js';
import { initShortcuts } from './shortcuts.js';
import { initTodos } from './todos.js';
import { initDots } from './dots.js';

initDots();
initClock();
initSearch();
initCalendar();
initShortcuts();
initTodos();

// One-shot entrance animation. Double rAF so the first paint
// happens with initial styles before the transition triggers.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.classList.add('is-loaded');
  });
});
