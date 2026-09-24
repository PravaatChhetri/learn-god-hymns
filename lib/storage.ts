// localStorage helpers. Every access is wrapped: storage can be missing or throw
// (private windows, blocked site data), and the app must keep working without it.

export const KEYS = {
  counts: "hanuman-app:counts:v1",
  pos: "hanuman-app:pos:v1",
  speed: "hanuman-app:speed:v1",
  mala: "hanuman-app:mala:v1",
  pending: "hanuman-app:pending:v1",
  global: "hanuman-app:global:v1",
} as const;

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string): T | null {
  const raw = readString(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* storage unavailable: the value just won't survive a reload */
  }
}
