// idb.js — минимальная обёртка над IndexedDB для хранения бинарных/больших данных
// API:
//   await idbSet(key, value)         // value: string|Blob|ArrayBuffer|TypedArray
//   await idbGet(key)                // -> value|null
//   await idbDel(key)
//   await idbHas(key)                // -> boolean
//   await idbKeys()                  // -> string[]
//   await idbClear()                 // удалить всё из стора
//   await idbSizeApprox()            // грубая оценка размера хранилища (байты)
//
// Примечания:
// - Ключ должен быть непустой строкой (assertKey).
// - БД 'hero-kids', стор 'assets'. Версия 1.

const DB_NAME = 'hero-kids';
const STORE   = 'assets';
const VERSION = 1;

/** Открыть/создать БД и вернуть IDBDatabase */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE); // out-of-line key (ключ передаём в put/get)
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
    req.onblocked = () => console.warn('[idb] open blocked (another tab holds old version)');
  });
}

/** Проверка ключа: непустая строка */
function assertKey(key) {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error('idb: key must be a non-empty string');
  }
}

/** Положить значение по ключу */
export async function idbSet(key, value) {
  assertKey(key);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(true);
    tx.objectStore(STORE).put(value, key);
  });
}

/** Получить значение по ключу (или null) */
export async function idbGet(key) {
  assertKey(key);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
  });
}

/** Удалить по ключу */
export async function idbDel(key) {
  assertKey(key);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(true);
    tx.objectStore(STORE).delete(key);
  });
}

/** Проверить наличие ключа */
export async function idbHas(key) {
  assertKey(key);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
    const req = tx.objectStore(STORE).getKey(key);
    req.onsuccess = () => resolve(req.result !== undefined);
  });
}

/** Список всех ключей в сторадже */
export async function idbKeys() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const keys = [];
    const tx = db.transaction(STORE, 'readonly');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);

    // modern: getAllKeys; fallback: cursor
    if ('getAllKeys' in store) {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result.map(String));
    } else {
      const req = store.openKeyCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (cur) { keys.push(String(cur.key)); cur.continue(); }
        else resolve(keys);
      };
    }
  });
}

/** Очистить весь стор */
export async function idbClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(true);
    tx.objectStore(STORE).clear();
  });
}

/** Грубая оценка размера стора (в байтах): суммируем длину строк/буферов */
export async function idbSizeApprox() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let total = 0;
    const tx = db.transaction(STORE, 'readonly');
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);

    const store = tx.objectStore(STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        total += roughSizeof(cur.value);
        cur.continue();
      } else {
        resolve(total);
      }
    };
  });
}

/* ===== helpers ===== */
function roughSizeof(val) {
  if (typeof val === 'string') {
    // approximate bytes for UTF-8 string
    let bytes = 0;
    for (let i = 0; i < val.length; i++) {
      const codePoint = val.charCodeAt(i);
      if (codePoint <= 0x7f) bytes += 1;
      else if (codePoint <= 0x7ff) bytes += 2;
      else if (codePoint >= 0xd800 && codePoint <= 0xdfff) { bytes += 4; i++; }
      else if (codePoint < 0xffff) bytes += 3;
      else bytes += 4;
    }
    return bytes;
  }
  if (val instanceof ArrayBuffer) return val.byteLength;
  if (ArrayBuffer.isView(val)) return val.byteLength;
  if (val instanceof Blob) return val.size;
  try {
    return roughSizeof(JSON.stringify(val) || '');
  } catch {
    return 0;
  }
}
