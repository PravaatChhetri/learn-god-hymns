"use client";

import { useEffect, useEffectEvent, useRef, useState, type PointerEvent } from "react";
import { useApp } from "@/components/AppProvider";
import { BEADS_PER_MALA, malaTotal, type MalaState } from "@/lib/mala";

// The strand shows 5 beads; slot 2 is the centre (current) bead. Slots outside 0..4 are
// invisible parking spots that beads slide in from / out to.
// [scale, opacity] per slot; the centre bead is largest.
const BEAD_SLOTS: Record<number, [number, number]> = {
  [-2]: [0.2, 0],
  [-1]: [0.6, 0],
  0: [0.75, 1],
  1: [0.9, 1],
  2: [1, 1],
  3: [0.9, 1],
  4: [0.75, 1],
  5: [0.6, 0],
  6: [0.2, 0],
};
const BEAD_SIZE = 0.2; // full-size bead diameter as a fraction of strand height (matches .bead width in CSS)
const BEAD_GAP = 0.02; // space between neighbouring beads, same units

// Stack beads outward from the centre so neighbours never overlap, whatever the scales are.
const BEAD_TOPS: Record<number, number> = { 2: 50 };
for (let s = 3; s <= 6; s++) {
  const step = (BEAD_SIZE * (BEAD_SLOTS[s - 1][0] + BEAD_SLOTS[s][0])) / 2 + BEAD_GAP;
  BEAD_TOPS[s] = BEAD_TOPS[s - 1] + step * 100;
  BEAD_TOPS[4 - s] = 100 - BEAD_TOPS[s]; // mirror above the centre
}

const MALA_PULL = 36; // px of downward drag that counts as one bead

function MalaStrand({
  mala,
  completedAt,
  onCount,
  onUndo,
  onReset,
}: {
  mala: MalaState;
  completedAt: number; // bumps each time a mala is completed, to play the glow
  onCount: () => void;
  onUndo: () => void;
  onReset: () => void;
}) {
  const total = malaTotal(mala);
  const [pull, setPull] = useState<number | null>(null);
  const startY = useRef<number | null>(null);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!completedAt) return;
    setGlow(true);
    const id = setTimeout(() => setGlow(false), 1400);
    return () => clearTimeout(id);
  }, [completedAt]);

  // space/enter/arrow-down count a bead; focused buttons already handle their own keys
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const countKey = e.key === " " || e.key === "Enter" || e.key === "ArrowDown";
    const target = e.target as HTMLElement | null;
    if (countKey && !target?.closest("button, select, input, summary")) {
      e.preventDefault();
      onCount();
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // swipe the strand down to pull the next bead, like drawing a real mala through the fingers
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPull(0);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (startY.current === null) return;
    setPull(Math.max(0, e.clientY - startY.current));
  }
  function endPull(e: PointerEvent<HTMLDivElement>) {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    startY.current = null;
    setPull(null);
    if (e.type === "pointerup" && dy >= MALA_PULL) onCount();
  }

  // bead n sits at slot 2 - (n - total): upcoming beads above, counted beads below.
  // Rendering the parking slots too means a bead mounts invisibly and then slides into view.
  const beads = [];
  for (let n = total - 4; n <= total + 4; n++) {
    const slot = 2 - (n - total);
    const [scale, opacity] = BEAD_SLOTS[slot];
    beads.push(
      <span
        key={n}
        className={["bead", n % BEADS_PER_MALA === 0 && "guru", slot === 2 && "current"].filter(Boolean).join(" ")}
        style={{
          top: `${BEAD_TOPS[slot]}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          filter: `brightness(${0.55 + 0.45 * scale})`, // farther beads sit in shadow
          zIndex: 10 - Math.abs(slot - 2),
        }}
      />,
    );
  }

  return (
    <section className="mala-view" aria-label="Naam jap mala">
      <div className="mala-head">
        <span className="mala-head-num">{mala.beads}</span>
        <span className="mala-head-of">of 108</span>
      </div>

      <div
        className={glow ? "mala-strand complete" : "mala-strand"}
        role="button"
        tabIndex={0}
        aria-label="Mala — swipe down, or press Space, to move one bead"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPull}
        onPointerCancel={endPull}
      >
        <div
          className="mala-beads"
          aria-hidden="true"
          style={
            pull === null ? undefined : { transition: "none", transform: `translateY(${Math.min(pull, 70) * 0.5}px)` }
          }
        >
          {beads}
        </div>
      </div>
      <p className="mala-hint">Swipe down to pull the next bead</p>

      <div className="mala-stats">
        <div className="mala-stat">
          <span className="mala-stat-num">{mala.malas.toLocaleString()}</span>
          <span className="mala-stat-label">Malas completed</span>
        </div>
        <div className="mala-stat">
          <span className="mala-stat-num">{total.toLocaleString()}</span>
          <span className="mala-stat-label">Total names</span>
        </div>
      </div>

      <div className="mala-actions">
        <button className="pill ghost" type="button" onClick={onUndo} disabled={mala.beads === 0}>
          Undo
        </button>
        <button className="pill ghost" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </section>
  );
}

/** The mala page, wired to the shared app state. */
export default function MalaView() {
  const { mala, malaCompletedAt, countBead, undoBead, resetMala } = useApp();
  return (
    <MalaStrand
      mala={mala}
      completedAt={malaCompletedAt}
      onCount={countBead}
      onUndo={undoBead}
      onReset={resetMala}
    />
  );
}
