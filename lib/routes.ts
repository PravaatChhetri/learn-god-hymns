// One page per text, plus /mala. Slugs are the readable, search-friendly URLs.
import type { TextId } from "./texts";

export interface TextPage {
  slug: string;
  devanagari: string;
  author?: string;
  /** shown on the home page and used as the page's meta description */
  blurb: string;
  seoTitle: string;
}

export const TEXT_PAGES: Record<TextId, TextPage> = {
  ramstuti: {
    slug: "ram-stuti",
    devanagari: "श्री राम स्तुति",
    author: "Tulsidas",
    blurb:
      "“Shri Ramchandra Kripalu Bhajman” — a hymn in praise of Shri Ram's compassion, beauty and divine form, sung at Ram aarti and in daily worship.",
    seoTitle: "Ram Stuti (Shri Ramchandra Kripalu Bhajman) in English – Lyrics & Meaning",
  },
  chalisa: {
    slug: "hanuman-chalisa",
    devanagari: "हनुमान चालीसा",
    author: "Tulsidas",
    blurb:
      "Forty verses praising the strength, wisdom and unwavering devotion of Shri Hanuman — the most beloved of all hymns to Bajrang Bali.",
    seoTitle: "Hanuman Chalisa in English – Lyrics, Meaning & Chant",
  },
  bajrangbaan: {
    slug: "bajrang-baan",
    devanagari: "बजरंग बाण",
    blurb:
      "“The arrow of Bajrang Bali” — a prayer invoking Hanuman's protection, recited for courage and relief in times of fear or hardship.",
    seoTitle: "Bajrang Baan in English – Lyrics & Meaning",
  },
};

export const PATH_ORDER: TextId[] = ["ramstuti", "chalisa", "bajrangbaan"];

export const MALA_PATH = "/mala";

export function textHref(id: TextId) {
  return `/${TEXT_PAGES[id].slug}`;
}

export function textIdFromSlug(slug: string): TextId | null {
  const hit = (Object.keys(TEXT_PAGES) as TextId[]).find((id) => TEXT_PAGES[id].slug === slug);
  return hit ?? null;
}

/** Theme for a URL path: "home", "mala", or the text id (drives colours and background). */
export function themeForPath(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === MALA_PATH) return "mala";
  return textIdFromSlug(pathname.slice(1)) ?? "home";
}
