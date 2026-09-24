import type { MetadataRoute } from "next";
import { MALA_PATH, PATH_ORDER, textHref } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...PATH_ORDER.map((id) => ({ url: `${SITE_URL}${textHref(id)}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${SITE_URL}${MALA_PATH}`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
