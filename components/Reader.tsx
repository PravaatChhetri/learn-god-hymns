"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useApp } from "@/components/AppProvider";
import type { Learn } from "@/hooks/useLearn";
import { TEXTS, type Stanza, type TextId } from "@/lib/texts";

const TYPE_TAGS: Record<string, string> = { doha: "Doha", sortha: "Sortha", invocation: "Invocation" };
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
const SWIPE_THRESHOLD = 80;
const CARD_ANIM_MS = 360;

type Dir = 1 | -1; // 1 = next (card exits left, new one enters from the right), -1 = prev

function StanzaCard({
  stanza,
  className,
  style,
  showTranslation,
  learning,
  activeLine,
  onToggleLearn,
}: {
  stanza: Stanza;
  className: string;
  style?: CSSProperties;
  showTranslation: boolean;
  learning: boolean;
  activeLine: number;
  onToggleLearn?: () => void;
}) {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lines = stanza.text.split("\n");

  useEffect(() => {
    lineRefs.current[activeLine]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeLine]);

  return (
    <div className={className} style={style}>
      <div className="stanza-header">
        <div className="stanza-tag">{TYPE_TAGS[stanza.type] ?? `Verse ${stanza.n}`}</div>
        <button className={learning ? "card-learn-btn active" : "card-learn-btn"} type="button" onClick={onToggleLearn}>
          {learning ? "Stop" : "Learn"}
        </button>
      </div>
      <div className="stanza-body">
        <div className="stanza-text">
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              <span
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={i === activeLine ? "stanza-line active" : "stanza-line"}
              >
                {line}
              </span>
            </span>
          ))}
        </div>
        <div className={showTranslation ? "stanza-meaning visible" : "stanza-meaning"}>{stanza.meaning}</div>
      </div>
    </div>
  );
}

function ReaderCore({
  textId,
  initialIndex,
  showTranslation,
  speed,
  learn,
  onToggleTranslation,
  onSpeedChange,
  onIndexChange,
  onComplete,
}: {
  textId: TextId;
  initialIndex: number;
  showTranslation: boolean;
  speed: number;
  learn: Learn;
  onToggleTranslation: () => void;
  onSpeedChange: (speed: number) => void;
  onIndexChange: (index: number) => void;
  onComplete: () => void;
}) {
  const { stanzas } = TEXTS[textId];
  // a saved position can outlive a stanza that was later removed from the text
  const [index, setIndex] = useState(initialIndex >= 0 && initialIndex < stanzas.length ? initialIndex : 0);
  const [cardKey, setCardKey] = useState(0);
  const [enterDir, setEnterDir] = useState<Dir | 0>(0);
  const [exiting, setExiting] = useState<{ key: number; index: number; dir: Dir; dragX: number } | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const [hintHidden, setHintHidden] = useState(false);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const { learning, activeLine, start, stop } = learn;

  // leaving the reader (switching text or view) silences Learn
  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (!exiting) return;
    const id = setTimeout(() => setExiting(null), CARD_ANIM_MS);
    return () => clearTimeout(id);
  }, [exiting]);

  function goTo(target: number, dir: Dir) {
    if (exiting) return;
    stop();
    if (target >= stanzas.length && dir === 1) {
      onComplete();
      target = 0;
    } else if (target < 0) {
      return;
    }
    setExiting({ key: cardKey, index, dir, dragX: dragX ?? 0 });
    setCardKey((k) => k + 1);
    setEnterDir(dir);
    setIndex(target);
    setDragX(null);
    setHintHidden(true);
    onIndexChange(target);
  }
  const next = () => goTo(index + 1, 1);
  const prev = () => index > 0 && goTo(index - 1, -1);
  const toggleLearn = () => (learning ? stop() : start(textId, index));

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ---- swipe between stanzas ----
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (exiting || (e.target as HTMLElement).closest(".nav-arrow")) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || exiting) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.3) return; // vertical scroll intent
    d.moved = true;
    setDragX(dx);
  }
  function endDrag(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    const dx = e.clientX - d.x;
    if (dx <= -SWIPE_THRESHOLD) next();
    else if (dx >= SWIPE_THRESHOLD && index > 0) prev();
    else setDragX(null); // not far enough: spring back
  }

  const dragStyle = (x: number): CSSProperties => ({ transform: `translateX(${x}px) rotate(${x / 30}deg)` });

  return (
    <>
      <main className="stage">
        <div className="progress" aria-hidden="true">
          {stanzas.map((_, i) => (
            <span key={i} className={i <= index ? "done" : undefined} />
          ))}
        </div>

        <div
          className="card-wrap"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={(e) => drag.current?.moved && endDrag(e)}
        >
          {exiting && (
            <StanzaCard
              key={exiting.key}
              stanza={stanzas[exiting.index]}
              className={`stanza-card ${exiting.dir === 1 ? "exit-next" : "exit-prev"}`}
              style={dragStyle(exiting.dragX)}
              showTranslation={showTranslation}
              learning={false}
              activeLine={-1}
            />
          )}
          <StanzaCard
            key={cardKey}
            stanza={stanzas[index]}
            className={`stanza-card${enterDir === 1 ? " enter-next" : enterDir === -1 ? " enter-prev" : ""}`}
            style={dragX === null ? undefined : { ...dragStyle(dragX), transition: "none" }}
            showTranslation={showTranslation}
            learning={learning}
            activeLine={activeLine}
            onToggleLearn={toggleLearn}
          />
          <button className="nav-arrow left" type="button" aria-label="Previous stanza" onClick={prev}>
            &#8249;
          </button>
          <button className="nav-arrow right" type="button" aria-label="Next stanza" onClick={next}>
            &#8250;
          </button>
        </div>
      </main>

      <footer className="controls">
        <button className={showTranslation ? "pill active" : "pill"} id="translateBtn" onClick={onToggleTranslation}>
          <span className="pill-label">Translation</span>
        </button>
        <button className={learning ? "pill active" : "pill"} id="learnBtn" onClick={toggleLearn}>
          <span className="pill-label">{learning ? "Stop" : "Learn"}</span>
        </button>
        <select
          className="speed-select"
          aria-label="Playback speed"
          value={String(speed)}
          onChange={(e) => onSpeedChange(Number.parseFloat(e.target.value))}
        >
          {SPEEDS.map((s) => (
            <option key={s} value={String(s)}>
              {s}x
            </option>
          ))}
        </select>
        <button
          className="pill ghost"
          onClick={() => {
            onComplete();
            goTo(0, -1);
          }}
        >
          Mark complete
        </button>
      </footer>
      <div className="stanza-count">
        {index + 1} / {stanzas.length}
      </div>
      <p className={hintHidden ? "hint hide" : "hint"}>Swipe left or right to move between verses</p>
    </>
  );
}

/** A text's reading page, wired to the shared app state. */
export default function Reader({ textId }: { textId: TextId }) {
  const app = useApp();
  return (
    <ReaderCore
      // remount once saved state has loaded, so the saved stanza position takes effect
      key={app.hydrated ? "restored" : "initial"}
      textId={textId}
      initialIndex={app.pos[textId] || 0}
      showTranslation={app.showTranslation}
      speed={app.speed}
      learn={app.learn}
      onToggleTranslation={app.toggleTranslation}
      onSpeedChange={app.setSpeed}
      onIndexChange={(i) => app.setPosition(textId, i)}
      onComplete={() => app.completeReading(textId)}
    />
  );
}
