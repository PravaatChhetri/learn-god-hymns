"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { recentDays, type DayRecord } from "@/lib/daily";
import { PATH_ORDER } from "@/lib/routes";
import { TEXTS } from "@/lib/texts";

const HISTORY_DAYS = 7;

function plural(n: number, word: string) {
  return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
}

function dayLabel(date: string, todayKey: string) {
  if (date === todayKey) return "Today";
  const [y, m, d] = date.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
  return day.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function daySummary(r: DayRecord) {
  const paths = PATH_ORDER.reduce((sum, id) => sum + r[id], 0);
  const parts = [];
  if (r.malas) parts.push(plural(r.malas, "mala"));
  if (paths) parts.push(plural(paths, "path"));
  return parts.join(" · ");
}

export default function CountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { counts, today, resetCounts } = useApp();
  const [history, setHistory] = useState<DayRecord[]>([]);

  // refresh the history whenever the sheet opens or today's log changes while it is open
  useEffect(() => {
    if (open) recentDays(HISTORY_DAYS).then(setHistory);
  }, [open, today]);

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
          the collective total. Offline, counts are kept on this device and offered once you reconnect.
        </p>

        <h3 className="sheet-heading">Today</h3>
        <div className="count-today">
          <div className="count-tile">
            <span className="num">{today.malas.toLocaleString()}</span>
            <span className="name">Malas</span>
          </div>
          {PATH_ORDER.map((id) => (
            <div className="count-tile" key={id}>
              <span className="num">{today[id].toLocaleString()}</span>
              <span className="name">{TEXTS[id].title}</span>
            </div>
          ))}
        </div>

        {history.some((r) => r.date !== today.date && daySummary(r)) && (
          <>
            <h3 className="sheet-heading">Last {HISTORY_DAYS} days</h3>
            <ul className="count-days">
              {history.filter((r) => daySummary(r)).map((r) => (
                <li key={r.date}>
                  <span className="name">{dayLabel(r.date, today.date)}</span>
                  <span className="sum">{daySummary(r)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className="sheet-heading">All time</h3>
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
