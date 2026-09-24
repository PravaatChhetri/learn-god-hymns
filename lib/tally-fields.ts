// Shared by the /api/tally route and the browser queue, so both agree on the fields and limits.
import { TEXT_IDS } from "./texts";

export const TALLY_FIELDS = ["naamjap", ...TEXT_IDS] as const;
export type TallyField = (typeof TALLY_FIELDS)[number];
export type TallyMap = Record<TallyField, number>;

// Most a single request may add per field. Stops one careless (or hostile) request from
// adding millions; the client splits bigger backlogs into several requests.
export const MAX_STEP: TallyMap = { naamjap: 1080, chalisa: 5, ramstuti: 5, bajrangbaan: 5 };

export function zeroTally(): TallyMap {
  return { naamjap: 0, chalisa: 0, ramstuti: 0, bajrangbaan: 0 };
}

/** Keep only known fields, as non-negative whole numbers. */
export function cleanTally(input: unknown): TallyMap {
  const out = zeroTally();
  if (input && typeof input === "object") {
    const src = input as Record<string, unknown>;
    for (const f of TALLY_FIELDS) {
      const n = Math.floor(Number(src[f]));
      if (Number.isFinite(n) && n > 0) out[f] = n;
    }
  }
  return out;
}
