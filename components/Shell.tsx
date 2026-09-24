"use client";

// Page chrome shared by every route: themed background, top navigation, toast, count sheet.
// The theme comes from the URL, so it is already right in the server-rendered HTML.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/components/AppProvider";
import CountSheet from "@/components/CountSheet";
import { MALA_PATH, PATH_ORDER, textHref, themeForPath } from "@/lib/routes";
import { TEXTS, TEXT_IDS } from "@/lib/texts";

const TAB_LABELS = { ramstuti: "Ram Stuti", chalisa: "Chalisa", bajrangbaan: "Bajrang Baan" } as const;

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = themeForPath(pathname);
  const { counts, toast } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const totalCount = TEXT_IDS.reduce((sum, id) => sum + (counts[id] || 0), 0);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const tabs = [
    ...PATH_ORDER.map((id) => ({ href: textHref(id), label: TAB_LABELS[id], title: TEXTS[id].title })),
    { href: MALA_PATH, label: "Mala", title: "Naam jap mala" },
  ];

  return (
    <div className={`shell ${theme}-mode`} data-theme={theme}>
      <div className="bg-art" aria-hidden="true">
        <div className="bg-photo" />
        <div className="bg-scrim" />
      </div>

      <div className="app">
        <header className="topbar">
          <Link
            className="om"
            href="/"
            title="Home"
            aria-label="Home — the collective offering"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            ॐ
          </Link>
          <nav className="tabs" aria-label="Prayers">
            {tabs.map((t) => (
              <Link
                key={t.href}
                className="tab"
                href={t.href}
                title={t.title}
                aria-current={pathname === t.href ? "page" : undefined}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <button
            className="icon-btn"
            type="button"
            title="Your reading count"
            aria-label={`Your reading count: ${totalCount}`}
            onClick={() => setSheetOpen(true)}
          >
            <span>{totalCount}</span>
          </button>
        </header>

        {children}
      </div>

      <div className={toast.shown ? "toast show" : "toast"} role="status">
        {toast.msg}
      </div>

      <CountSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
