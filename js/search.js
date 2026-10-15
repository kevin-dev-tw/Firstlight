// Search: submit to Google, Escape clears.

export function initSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    // Looks like a URL? Go straight there.
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q)) {
      const url = q.startsWith('http') ? q : `https://${q}`;
      window.location.href = url;
      return;
    }
    window.location.href =
      `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') input.value = '';
  });
}
