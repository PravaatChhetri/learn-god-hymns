"use client";

// State shared by every page: personal counts, reading positions, the mala, Learn settings,
// the toast. It lives in the root layout, so it (and the hidden chant player) survives
// navigating between pages.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLearn, type Learn } from "@/hooks/useLearn";
import { BEADS_PER_MALA, cleanMala, type MalaState } from "@/lib/mala";
import { KEYS, readJSON, readString, write } from "@/lib/storage";
import { queueTally, startTally } from "@/lib/tally";
import { TEXTS, TEXT_IDS, type TextId } from "@/lib/texts";

type CountMap = Record<TextId, number>;

interface AppState {
  hydrated: boolean; // false until saved state has been read from this browser
  counts: CountMap;
  pos: CountMap;
  mala: MalaState;
  malaCompletedAt: number;
  speed: number;
  showTranslation: boolean;
  toast: { msg: string; shown: boolean };
  learn: Learn;
  completeReading: (id: TextId) => void;
  resetCounts: () => void;
  setPosition: (id: TextId, index: number) => void;
  setSpeed: (speed: number) => void;
  toggleTranslation: () => void;
  countBead: () => void;
  undoBead: () => void;
  resetMala: () => void;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

function emptyCounts(): CountMap {
  return Object.fromEntries(TEXT_IDS.map((id) => [id, 0])) as CountMap;
}

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* no vibration support */
  }
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [counts, setCounts] = useState<CountMap>(emptyCounts);
  const [pos, setPos] = useState<CountMap>(emptyCounts);
  const [mala, setMala] = useState<MalaState>({ beads: 0, malas: 0 });
  const [malaCompletedAt, setMalaCompletedAt] = useState(0);
  const [speed, setSpeedState] = useState(0.75);
  const [showTranslation, setShowTranslation] = useState(false);
  const [toast, setToast] = useState({ msg: "", shown: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, shown: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, shown: false })), 3200);
  }, []);

  const learn = useLearn(speed, showToast);

  // restore everything saved in this browser (localStorage only exists client-side)
  useEffect(() => {
    const savedSpeed = Number.parseFloat(readString(KEYS.speed) ?? "");
    setPos({ ...emptyCounts(), ...readJSON<CountMap>(KEYS.pos) });
    setCounts({ ...emptyCounts(), ...readJSON<CountMap>(KEYS.counts) });
    setMala(cleanMala(readJSON<MalaState>(KEYS.mala)));
    if (Number.isFinite(savedSpeed) && savedSpeed > 0) setSpeedState(savedSpeed);
    setHydrated(true);
    startTally();
  }, []);

  function completeReading(id: TextId) {
    const n = (counts[id] || 0) + 1;
    const next = { ...counts, [id]: n };
    setCounts(next);
    write(KEYS.counts, next);
    queueTally(id, 1);
    showToast(`🙏 ${TEXTS[id].title} complete — ${n} time${n === 1 ? "" : "s"}`);
  }

  function resetCounts() {
    if (!confirm("Reset all reading counts to zero?")) return;
    const next = emptyCounts();
    setCounts(next);
    write(KEYS.counts, next);
  }

  function setPosition(id: TextId, index: number) {
    const next = { ...pos, [id]: index };
    setPos(next);
    write(KEYS.pos, next);
  }

  function setSpeed(s: number) {
    setSpeedState(s);
    write(KEYS.speed, String(s));
  }

  function saveMala(m: MalaState) {
    setMala(m);
    write(KEYS.mala, m);
  }

  function countBead() {
    // start the next round after a full mala
    const beads = (mala.beads >= BEADS_PER_MALA ? 0 : mala.beads) + 1;
    const done = beads === BEADS_PER_MALA;
    const malas = mala.malas + (done ? 1 : 0);
    saveMala({ beads, malas });
    queueTally("naamjap", 1);
    if (done) {
      buzz([60, 60, 160]);
      showToast(`📿 Mala complete — ${malas} mala${malas === 1 ? "" : "s"}`);
      setMalaCompletedAt(Date.now());
    } else {
      buzz(12);
    }
  }

  function undoBead() {
    if (mala.beads === 0) return;
    const malas = mala.beads === BEADS_PER_MALA ? mala.malas - 1 : mala.malas;
    // bead 1 of a later round was preceded by a full mala — step back onto it
    const beads = mala.beads === 1 && malas > 0 ? BEADS_PER_MALA : mala.beads - 1;
    saveMala({ beads, malas });
    queueTally("naamjap", -1);
  }

  function resetMala() {
    if (!confirm("Reset your bead and mala counts to zero?")) return;
    saveMala({ beads: 0, malas: 0 });
  }

  const value: AppState = {
    hydrated,
    counts,
    pos,
    mala,
    malaCompletedAt,
    speed,
    showTranslation,
    toast,
    learn,
    completeReading,
    resetCounts,
    setPosition,
    setSpeed,
    toggleTranslation: () => setShowTranslation((s) => !s),
    countBead,
    undoBead,
    resetMala,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
