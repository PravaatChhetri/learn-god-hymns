"use client";

import { useApp } from "@/components/AppProvider";
import { PATH_ORDER } from "@/lib/routes";
import { TEXTS } from "@/lib/texts";

export default function CountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { counts, resetCounts } = useApp();
  return (
    <div
      className={open ? "sheet open" : "sheet"}
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet-inner" role="dialog" aria-modal="true" aria-labelledby="countSheetTitle">
        <h2 id="countSheetTitle">Reading count</h2>
        <p className="sheet-sub">
          Every time you complete a full path, it&apos;s counted here, in this browser. It also adds an anonymous +1 to
          the collective total.
        </p>
        <div className="count-rows">
          {PATH_ORDER.map((id) => (
            <div className="count-row" key={id}>
              <span className="name">{TEXTS[id].title}</span>
              <span className="num">{counts[id] || 0}</span>
            </div>
          ))}
        </div>
        <button className="pill ghost small" type="button" onClick={resetCounts}>
          Reset counts
        </button>
        <button className="pill small" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
