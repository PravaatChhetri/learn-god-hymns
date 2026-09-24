import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Karla, Literata, Tiro_Devanagari_Hindi } from "next/font/google";
import AppProvider from "@/components/AppProvider";
import Shell from "@/components/Shell";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Bajrang Baan uses diacritics (ā, ñ, ṭ …), so load latin-ext alongside latin.
const literata = Literata({ subsets: ["latin", "latin-ext"], axes: ["opsz"], variable: "--font-literata" });
const karla = Karla({ subsets: ["latin", "latin-ext"], variable: "--font-karla" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: "500",
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const devanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-deva",
});

const DESCRIPTION =
  "Read, learn and chant the Hanuman Chalisa, Bajrang Baan and Ram Stuti in English — with transliteration, plain-English meaning, guided line-by-line learning, and a japa (recitation) counter.";
const SHORT_DESCRIPTION =
  "Read, learn and chant the Hanuman Chalisa, Bajrang Baan and Ram Stuti in English, with meaning, guided learning and a japa counter.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Hanuman Chalisa, Bajrang Baan & Ram Stuti in English – Learn & Chant",
  description: DESCRIPTION,
  keywords: [
    "Hanuman Chalisa English",
    "Hanuman Chalisa lyrics with meaning",
    "Bajrang Baan English meaning",
    "Bajrang Baan lyrics",
    "Ram Stuti lyrics",
    "Shri Ramchandra Kripalu Bhajman",
    "learn Hanuman Chalisa",
    "chant Hanuman Chalisa online",
    "japa counter",
    "Hanuman Chalisa translation",
  ],
  authors: [{ name: "Pravaat Chhetri" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Hanuman Chalisa, Bajrang Baan & Ram Stuti in English",
    description: SHORT_DESCRIPTION,
    url: "/",
    images: ["/bg.jpg"],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanuman Chalisa, Bajrang Baan & Ram Stuti in English",
    description: "Read, learn and chant these devotional verses in English, with meaning, guided learning and a japa counter.",
    images: ["/bg.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7a1f13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${literata.variable} ${karla.variable} ${cormorant.variable} ${devanagari.variable}`}>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
