// Thin storage layer: chrome.storage.sync when available,
// localStorage fallback so newtab.html works opened directly in a browser.

const hasChromeStorage =
  typeof chrome !== 'undefined' &&
  chrome.storage &&
  chrome.storage.sync;

const memoryFallback = new Map();

function lsGet(keys) {
  const out = {};
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`broadsheet:${k}`);
      out[k] = raw === null ? undefined : JSON.parse(raw);
    } catch {
      out[k] = memoryFallback.get(k);
    }
  }
  return out;
}

function lsSet(obj) {
  for (const [k, v] of Object.entries(obj)) {
    try {
      localStorage.setItem(`broadsheet:${k}`, JSON.stringify(v));
    } catch {
      memoryFallback.set(k, v);
    }
  }
  return Promise.resolve();
}

export async function get(keys) {
  if (hasChromeStorage) {
    try {
      return await chrome.storage.sync.get(keys);
    } catch {
      return lsGet(keys);
    }
  }
  return lsGet(keys);
}

export async function set(obj) {
  if (hasChromeStorage) {
    try {
      await chrome.storage.sync.set(obj);
      return;
    } catch {
      return lsSet(obj);
    }
  }
  return lsSet(obj);
}
