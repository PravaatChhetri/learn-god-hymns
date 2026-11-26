// A small IndexedDB wrapper for the two things that must survive going offline: the daily log
// and the outbox of counts waiting to reach the collective tally. No dependencies.
// IndexedDB can be missing or refuse to open (old private windows, blocked site data); every
// helper then resolves to null and callers fall back, so the app keeps working regardless.

const DB_NAME = "gods-prayer";
const DB_VERSION = 1;

export const DAILY_STORE = "daily"; // one record per local calendar day, keyed by "YYYY-MM-DD"
export const KV_STORE = "kv"; // small named values: the tally outbox and last-seen totals

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DAILY_STORE)) db.createObjectStore(DAILY_STORE, { keyPath: "date" });
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
    };
    req.onsuccess = () => {
      const db = req.result;
      // a newer version of the app in another tab wants to upgrade: step aside
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => resolve(null);
  });
  return dbPromise;
}

/**
 * Run `body` inside one transaction. It receives the store and a `done` callback for the result.
 * Resolves once the transaction has committed (so the data is really saved), or null on failure.
 * Read-write transactions on the same store run in the order they were started.
 */
export async function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  body: (s: IDBObjectStore, done: (value: T) => void) => void,
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    let result: T | null = null;
    try {
      const tx = db.transaction(store, mode);
      tx.oncomplete = () => resolve(result);
      tx.onerror = tx.onabort = () => resolve(null);
      body(tx.objectStore(store), (v) => {
        result = v;
      });
    } catch {
      resolve(null);
    }
  });
}

/** Read a named value. undefined = never saved; null = IndexedDB unavailable. */
export function kvGet<T>(key: string): Promise<T | undefined | null> {
  return withStore<T | undefined>(KV_STORE, "readonly", (s, done) => {
    const req = s.get(key);
    req.onsuccess = () => done(req.result as T | undefined);
  });
}

/** Save a named value. Resolves true once committed. */
export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const ok = await withStore<true>(KV_STORE, "readwrite", (s, done) => {
    s.put(value, key);
    done(true);
  });
  return ok === true;
}
