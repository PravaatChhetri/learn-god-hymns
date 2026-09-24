"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useApp } from "@/components/AppProvider";
import { BEADS_PER_MALA, malaTotal } from "@/lib/mala";
import { MALA_PATH, PATH_ORDER, TEXT_PAGES, textHref } from "@/lib/routes";
import { fetchTally, getTallyServerSnapshot, getTallySnapshot, subscribeTally } from "@/lib/tally";
import { TALLY_FIELDS, zeroTally } from "@/lib/tally-fields";
import { TEXTS, TEXT_IDS } from "@/lib/texts";

const POLL_MS = 30000;
const RING_R = 86;

// 108 beads round the circle, leaving a gap at the top for the guru bead where the strand meets
const RING_BEADS = Array.from({ length: BEADS_PER_MALA }, (_, i) => {
  const a = ((6 + (348 * i) / (BEADS_PER_MALA - 1)) * Math.PI) / 180;
  return { cx: +(100 + RING_R * Math.sin(a)).toFixed(2), cy: +(100 - RING_R * Math.cos(a)).toFixed(2) };
});

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function plural(n: number, word: string) {
  return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
}

function relativeTime(ms: number, now: number) {
  const s = Math.round((now - ms) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
}

/** A number that counts up to each new value instead of jumping. */
function CountUp({ value, className }: { value: number; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    const el = ref.current!;
    const from = shown.current;
    shown.current = value;
    if (from === value || prefersReducedMotion()) {
      el.textContent = value.toLocaleString();
      return;
    }
    const dur = from === 0 ? 1400 : 700;
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (value - from) * eased).toLocaleString();
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

/** The collective mala: lit beads show how far the current shared round of 108 has come. */
function Ring({ lit }: { lit: number }) {
  // remember where the last update left off, so only newly lit beads animate in, one by one
  const [prevLit, setPrevLit] = useState(lit);
  const [base, setBase] = useState(lit);
  if (lit !== prevLit) {
    setBase(prevLit);
    setPrevLit(lit);
  }

  return (
    <svg className="home-ring" viewBox="0 0 200 200" aria-hidden="true">
      <circle className="ring-thread" cx={100} cy={100} r={RING_R} />
      {RING_BEADS.map((b, i) => {
        const on = i < lit;
        const delay = on && i >= base ? Math.min((i - base) * 14, 1400) : 0;
        return (
          <circle
            key={i}
            className={on ? "ring-bead lit" : "ring-bead"}
            cx={b.cx}
            cy={b.cy}
            r={2.35}
            style={{ transitionDelay: `${delay}ms` }}
          />
        );
      })}
      <circle className="ring-guru" cx={100} cy={100 - RING_R} r={5} />
    </svg>
  );
}

/** Live totals from everyone: the collective mala ring and the three paths. */
export default function CollectiveOffering() {
  const { counts, mala } = useApp();
  const myPaths = TEXT_IDS.reduce((sum, id) => sum + (counts[id] || 0), 0);
  const myNames = malaTotal(mala);
  const tally = useSyncExternalStore(subscribeTally, getTallySnapshot, getTallyServerSnapshot);
  const [now, setNow] = useState(0);

  // refresh on open, then every 30s while the tab is visible
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") fetchTally().then(() => setNow(Date.now()));
    };
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // what we show = the server's totals + anything of ours still on its way there
  const shown = zeroTally();
  for (const f of TALLY_FIELDS) shown[f] = tally.global[f] + tally.pending[f];
  const known = tally.hasGlobal;
  const jap = shown.naamjap;
  // a whole number of malas shows a full ring rather than an empty one
  const lit = known && jap > 0 ? ((jap - 1) % BEADS_PER_MALA) + 1 : 0;

  const live = tally.lastOk > 0 && !tally.failed;
  let status = "Gathering the count…";
  if (live) status = `Live · updated ${relativeTime(tally.lastOk, Math.max(now, tally.lastOk))}`;
  else if (tally.failed && known) status = "Offline · showing the last count we saw";
  else if (tally.failed) status = "Couldn't reach the collective count";

  return (
    <>
      <header className="home-hero">
        <p className="home-eyebrow">Offered together</p>
        <h1 className="home-title" id="homeTitle">
          Every name, every path,
          <br />
          <em>one offering</em>
        </h1>
      </header>

      <Link className="home-mala" href={MALA_PATH} aria-label="Open the mala to add your naam jap">
        <Ring lit={lit} />
        <span className="home-mala-core">
          {known ? <CountUp className="home-mala-num" value={jap} /> : <span className="home-mala-num">—</span>}
          <span className="home-mala-label">names chanted</span>
          <span className="home-mala-sub">{known ? plural(Math.floor(jap / BEADS_PER_MALA), "full mala") : " "}</span>
        </span>
      </Link>
      <p className="home-ring-note">
        {!known
          ? " "
          : lit === BEADS_PER_MALA
            ? "A collective mala has just been completed 🙏"
            : `${plural(BEADS_PER_MALA - lit, "bead")} until the next collective mala`}
      </p>

      <p className="home-caption" id="pathsCaption">
        Paths recited by all
      </p>
      <ol className="home-paths" aria-labelledby="pathsCaption">
        {PATH_ORDER.map((id) => (
          <li key={id}>
            <Link className="home-path" href={textHref(id)} data-open={id}>
              <span className="home-path-name">{TEXTS[id].title}</span>
              {known ? (
                <CountUp className="home-path-num" value={shown[id]} />
              ) : (
                <span className="home-path-num">—</span>
              )}
              <span className="home-path-unit" lang="hi">
                {TEXT_PAGES[id].devanagari}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className={tally.failed ? "home-status offline" : "home-status"} aria-live="polite">
        <span className="home-live" aria-hidden="true" />
        <span>{status}</span>
      </p>
      <p className="home-mine">
        {myPaths || myNames
          ? `Your part in this: ${plural(myPaths, "path")} · ${plural(myNames, "name")}`
          : "Recite a path or turn the mala to add your part."}
      </p>
    </>
  );
}
