// Collective counter: anonymous running totals of naam jap and completed recitations.
// GET  /api/tally -> { naamjap, chalisa, ramstuti, bajrangbaan }
// POST /api/tally with a JSON body of increments, e.g. {"chalisa":1,"naamjap":37}
// Only numbers are stored — no IP, no user id, nothing that identifies who sent them.
import { Redis } from "@upstash/redis";
import { MAX_STEP, TALLY_FIELDS, cleanTally, zeroTally, type TallyMap } from "@/lib/tally-fields";

export const dynamic = "force-dynamic";

// One Redis hash holds every total; HINCRBY is atomic, so concurrent increments never collide.
const KEY = "tally:totals";

// Upstash Redis via the Vercel Marketplace sets KV_REST_API_URL / KV_REST_API_TOKEN
// (or UPSTASH_REDIS_REST_*). Without them — plain `next dev` — count in memory instead.
const hasRedisEnv =
  !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
  !!(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);
const redis = hasRedisEnv ? Redis.fromEnv() : null;
let devTotals: TallyMap | null = null;

if (!redis && process.env.NODE_ENV === "production") {
  console.error("[tally] No Upstash Redis environment variables; collective count is disabled");
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function GET() {
  if (!redis) {
    if (process.env.NODE_ENV === "production") return json({ error: "count unavailable" }, 503);
    return json(devTotals ?? zeroTally());
  }
  return json(cleanTally(await redis.hgetall(KEY)));
}

export async function POST(request: Request) {
  // navigator.sendBeacon posts text/plain, so read the body as text rather than request.json()
  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const inc = cleanTally(body);
  for (const f of TALLY_FIELDS) inc[f] = Math.min(inc[f], MAX_STEP[f]);
  if (TALLY_FIELDS.every((f) => inc[f] === 0)) return json({ error: "nothing to add" }, 400);

  if (!redis) {
    if (process.env.NODE_ENV === "production") return json({ error: "count unavailable" }, 503);
    const next = devTotals ?? zeroTally();
    for (const f of TALLY_FIELDS) next[f] += inc[f];
    devTotals = next;
    return json(next);
  }

  // add every increment and read back the totals in one atomic transaction
  const tx = redis.multi();
  for (const f of TALLY_FIELDS) if (inc[f]) tx.hincrby(KEY, f, inc[f]);
  tx.hgetall(KEY);
  const results = await tx.exec();
  return json(cleanTally(results[results.length - 1]));
}
