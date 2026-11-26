// Browser side of the collective tally: a small store React reads via useSyncExternalStore.
// Completions are queued in an outbox (IndexedDB) and sent in batches, so a fast mala session
// is a handful of requests, not one per bead. The outbox survives reloads and going offline,
// and is pushed as soon as the browser reports the connection is back.
import { kvGet, kvSet } from "./db";
import { KEYS, readJSON, readString, remove, write } from "./storage";
import { MAX_STEP, TALLY_FIELDS, cleanTally, zeroTally, type TallyField, type TallyMap } from "./tally-fields";

const TALLY_URL = "/api/tally";
const KV_PENDING = "tally:pending";
const KV_GLOBAL = "tally:global";

export interface TallySnapshot {
  global: TallyMap; // last totals the server gave us
  pending: TallyMap; // our counts not yet sent
  hasGlobal: boolean; // true once any server totals (live or cached) are in hand
  lastOk: number; // time of the last successful server response
  failed: boolean;
}

const SERVER_SNAPSHOT: TallySnapshot = {
  global: zeroTally(),
  pending: zeroTally(),
  hasGlobal: false,
  lastOk: 0,
  failed: false,
};

let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let started = false;
let loaded = false; // the saved outbox has been read and merged in
let ready: Promise<void> = Promise.resolve();
let inFlight = false;
let flushTimer: ReturnType<typeof setTimeout> | undefined;

function update(patch: Partial<TallySnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeTally(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const getTallySnapshot = () => snapshot;
export const getTallyServerSnapshot = () => SERVER_SNAPSHOT;

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

// Saved values live in IndexedDB. Earlier versions kept them in localStorage: move those over once.
// If IndexedDB is unavailable, keep using localStorage.
let useLocal = false;

async function loadValue(kvKey: string, legacyKey: string): Promise<unknown> {
  const v = await kvGet<unknown>(kvKey);
  if (v === null) {
    useLocal = true;
    return readJSON(legacyKey);
  }
  if (v !== undefined) return v;
  const legacy = readString(legacyKey) === null ? undefined : readJSON(legacyKey);
  if (legacy !== undefined && (await kvSet(kvKey, legacy))) remove(legacyKey);
  return legacy;
}

function saveValue(kvKey: string, legacyKey: string, value: unknown) {
  if (useLocal) write(legacyKey, value);
  else kvSet(kvKey, value);
}

function savePending() {
  // always writes the latest snapshot; writes run in order, so the last one wins
  ready.then(() => saveValue(KV_PENDING, KEYS.pending, snapshot.pending));
}

async function load() {
  const [pending, global] = await Promise.all([
    loadValue(KV_PENDING, KEYS.pending),
    loadValue(KV_GLOBAL, KEYS.global),
  ]);
  // anything counted while we were loading sits on top of what was saved
  const merged = cleanTally(pending);
  for (const f of TALLY_FIELDS) merged[f] += snapshot.pending[f];
  loaded = true;
  update({
    pending: merged,
    // a live answer that arrived meanwhile beats the cached one
    ...(snapshot.lastOk ? {} : { global: cleanTally(global), hasGlobal: global !== undefined && global !== null }),
  });
  saveValue(KV_PENDING, KEYS.pending, merged);
}

/** Load cached state and start syncing. Safe to call more than once. */
export function startTally() {
  if (started) return;
  started = true;
  ready = load();
  // leaving the page: hand whatever is queued to the browser to deliver after we're gone
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden" || inFlight || !loaded || isOffline()) return;
    const batch = takeBatch();
    if (batch && navigator.sendBeacon?.(TALLY_URL, JSON.stringify(batch))) markSent(batch);
  });
  // back online: push the outbox straight away and refresh the totals
  window.addEventListener("online", () => {
    fetchTally();
    scheduleFlush(300);
  });
  window.addEventListener("offline", () => update({ failed: true }));
  fetchTally();
  scheduleFlush(1500); // send anything left over from a previous visit
}

export function queueTally(field: TallyField, n: number) {
  // undo can only take back what hasn't been sent yet; sent counts are an offering already made
  const pending = { ...snapshot.pending, [field]: Math.max(snapshot.pending[field] + n, 0) };
  update({ pending });
  savePending();
  scheduleFlush(4000);
}

function scheduleFlush(delay: number) {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flushTally, delay);
}

function takeBatch(): Partial<TallyMap> | null {
  const batch: Partial<TallyMap> = {};
  for (const f of TALLY_FIELDS) {
    const n = Math.min(snapshot.pending[f], MAX_STEP[f]);
    if (n > 0) batch[f] = n;
  }
  return Object.keys(batch).length ? batch : null;
}

function markSent(batch: Partial<TallyMap>) {
  const pending = { ...snapshot.pending };
  for (const [f, n] of Object.entries(batch) as [TallyField, number][]) {
    pending[f] = Math.max(pending[f] - n, 0);
  }
  update({ pending });
  savePending();
}

function applyGlobal(totals: unknown) {
  const global = cleanTally(totals);
  saveValue(KV_GLOBAL, KEYS.global, global);
  update({ global, hasGlobal: true, lastOk: Date.now(), failed: false });
}

async function flushTally() {
  await ready;
  if (inFlight) return;
  // no connection: keep the outbox; the "online" event will flush it
  if (isOffline()) return update({ failed: true });
  const batch = takeBatch();
  if (!batch) return;
  inFlight = true;
  let retryIn = 0;
  try {
    const res = await fetch(TALLY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error(`tally ${res.status}`);
    markSent(batch);
    applyGlobal(await res.json());
    if (takeBatch()) retryIn = 500; // more queued up while this was sending
  } catch {
    update({ failed: true });
    retryIn = 60000; // flaky network or server hiccup; the outbox is kept, try again later
  } finally {
    inFlight = false;
  }
  if (retryIn) scheduleFlush(retryIn);
}

export async function fetchTally() {
  if (isOffline()) return update({ failed: true });
  try {
    const res = await fetch(TALLY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`tally ${res.status}`);
    applyGlobal(await res.json());
  } catch {
    update({ failed: true });
  }
}
