// Browser side of the collective tally: a small store React reads via useSyncExternalStore.
// Completions are queued locally and sent in batches, so a fast mala session is a handful
// of requests, not one per bead. Unsent counts survive reloads and going offline.
import { KEYS, readJSON, readString, write } from "./storage";
import { MAX_STEP, TALLY_FIELDS, cleanTally, zeroTally, type TallyField, type TallyMap } from "./tally-fields";

const TALLY_URL = "/api/tally";

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

/** Load cached state and start syncing. Safe to call more than once. */
export function startTally() {
  if (started) return;
  started = true;
  update({
    global: cleanTally(readJSON(KEYS.global)),
    pending: cleanTally(readJSON(KEYS.pending)),
    hasGlobal: readString(KEYS.global) !== null,
  });
  // leaving the page: hand whatever is queued to the browser to deliver after we're gone
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden" || inFlight) return;
    const batch = takeBatch();
    if (batch && navigator.sendBeacon?.(TALLY_URL, JSON.stringify(batch))) markSent(batch);
  });
  fetchTally();
  scheduleFlush(1500); // send anything left over from a previous visit
}

export function queueTally(field: TallyField, n: number) {
  // undo can only take back what hasn't been sent yet; sent counts are an offering already made
  const pending = { ...snapshot.pending, [field]: Math.max(snapshot.pending[field] + n, 0) };
  write(KEYS.pending, pending);
  update({ pending });
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
  write(KEYS.pending, pending);
  update({ pending });
}

function applyGlobal(totals: unknown) {
  const global = cleanTally(totals);
  write(KEYS.global, global);
  update({ global, hasGlobal: true, lastOk: Date.now(), failed: false });
}

async function flushTally() {
  if (inFlight) return;
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
    retryIn = 60000; // offline or server hiccup; the queue is kept, try again later
  } finally {
    inFlight = false;
  }
  if (retryIn) scheduleFlush(retryIn);
}

export async function fetchTally() {
  try {
    const res = await fetch(TALLY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`tally ${res.status}`);
    applyGlobal(await res.json());
  } catch {
    update({ failed: true });
  }
}
