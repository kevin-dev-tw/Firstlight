// Today: a small to-do list inside the secondary rail.
// Items persist through the same chrome.storage.sync / localStorage layer.

import { get, set } from './store.js';

let todos = [];

function render(listEl) {
  listEl.textContent = '';
  const frag = document.createDocumentFragment();

  todos.forEach((t) => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (t.done) li.classList.add('done');

    const field = document.createElement('label');
    field.className = 'todo-field';

    const check = document.createElement('input');
    check.className = 'todo-check';
    check.type = 'checkbox';
    check.checked = t.done;
    check.setAttribute('aria-label', `Mark ${t.text}`);
    check.addEventListener('change', () => {
      t.done = check.checked;
      set({ todos });
      li.classList.toggle('done', t.done);
    });

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = t.text;

    field.append(check, text);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'todo-remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${t.text}`);
    remove.addEventListener('click', () => {
      todos = todos.filter((x) => x !== t);
      set({ todos });
      render(listEl);
    });

    li.append(field, remove);
    frag.appendChild(li);
  });

  listEl.appendChild(frag);
}

export async function initTodos() {
  const listEl = document.getElementById('todo-list');
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');

  const data = await get(['todos']);
  todos = Array.isArray(data.todos) ? data.todos : [];
  render(listEl);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: crypto.randomUUID(), text, done: false });
    set({ todos });
    render(listEl);
    input.value = '';
  });
}
