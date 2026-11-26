// Personal daily log: how many names, malas and paths were offered on each calendar day.
// Lives in IndexedDB on this device only. Nothing here is sent anywhere.
import { DAILY_STORE, withStore } from "./db";
import { TEXT_IDS } from "./texts";

export const DAILY_FIELDS = ["naamjap", "malas", ...TEXT_IDS] as const;
export type DailyField = (typeof DAILY_FIELDS)[number];
export type DayRecord = { date: string } & Record<DailyField, number>;

/** Local calendar day as "YYYY-MM-DD" (local time, so the day turns over at the user's midnight). */
export function dayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function emptyDay(date: string): DayRecord {
  const rec = { date } as DayRecord;
  for (const f of DAILY_FIELDS) rec[f] = 0;
  return rec;
}

function cleanDay(date: string, raw: unknown): DayRecord {
  const rec = emptyDay(date);
  if (raw && typeof raw === "object") {
    const src = raw as Record<string, unknown>;
    for (const f of DAILY_FIELDS) {
      const n = Math.floor(Number(src[f]));
      if (Number.isFinite(n) && n > 0) rec[f] = n;
    }
  }
  return rec;
}

// used only when IndexedDB is unavailable: today's log still works, it just won't survive a reload
const memory = new Map<string, DayRecord>();

/** Add (or, with negative numbers, take back) counts on today's record. Resolves with the updated record. */
export async function addToDay(inc: Partial<Record<DailyField, number>>): Promise<DayRecord> {
  const date = dayKey();
  const apply = (rec: DayRecord) => {
    for (const [f, n] of Object.entries(inc) as [DailyField, number][]) rec[f] = Math.max(rec[f] + n, 0);
    return rec;
  };
  // read-modify-write inside one transaction, so rapid bead taps never lose a count
  const saved = await withStore<DayRecord>(DAILY_STORE, "readwrite", (s, done) => {
    const req = s.get(date);
    req.onsuccess = () => {
      const rec = apply(cleanDay(date, req.result));
      s.put(rec);
      done(rec);
    };
  });
  if (saved) return saved;
  const rec = apply(memory.get(date) ?? emptyDay(date));
  memory.set(date, rec);
  return { ...rec };
}

export async function getDay(date = dayKey()): Promise<DayRecord> {
  const rec = await withStore<DayRecord>(DAILY_STORE, "readonly", (s, done) => {
    const req = s.get(date);
    req.onsuccess = () => done(cleanDay(date, req.result));
  });
  return rec ?? { ...(memory.get(date) ?? emptyDay(date)) };
}

/** Days with any activity in the last `days` days (today included), newest first. */
export async function recentDays(days: number): Promise<DayRecord[]> {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  const range = IDBKeyRange.bound(dayKey(from), dayKey());
  const recs = await withStore<DayRecord[]>(DAILY_STORE, "readonly", (s, done) => {
    const req = s.getAll(range);
    req.onsuccess = () => done((req.result as DayRecord[]).map((r) => cleanDay(r.date, r)));
  });
  const list = recs ?? [...memory.values()];
  return list.filter((r) => DAILY_FIELDS.some((f) => r[f] > 0)).sort((a, b) => b.date.localeCompare(a.date));
}
