import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Reader from "@/components/Reader";
import { PATH_ORDER, TEXT_PAGES, textHref, textIdFromSlug } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";
import { TEXTS } from "@/lib/texts";

// only the three texts exist; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return PATH_ORDER.map((id) => ({ slug: TEXT_PAGES[id].slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const id = textIdFromSlug((await params).slug);
  if (!id) return {};
  const page = TEXT_PAGES[id];
  return {
    title: page.seoTitle,
    description: page.blurb,
    alternates: { canonical: textHref(id) },
    openGraph: { title: page.seoTitle, description: page.blurb, url: textHref(id) },
    twitter: { title: page.seoTitle, description: page.blurb },
  };
}

export default async function TextPage({ params }: PageProps<"/[slug]">) {
  const id = textIdFromSlug((await params).slug);
  if (!id) notFound();
  const page = TEXT_PAGES[id];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: TEXTS[id].title,
    alternateName: page.devanagari,
    ...(page.author && { author: { "@type": "Person", name: page.author } }),
    description: page.blurb,
    url: `${SITE_URL}${textHref(id)}`,
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        // built from static data; escape "<" so the JSON can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="visually-hidden">
        {TEXTS[id].title} — {TEXTS[id].subtitle}
      </h1>
      <Reader textId={id} />
    </>
  );
}
