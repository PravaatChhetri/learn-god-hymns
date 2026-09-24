import type { Metadata } from "next";
import MalaView from "@/components/MalaView";
import { MALA_PATH } from "@/lib/routes";

const TITLE = "Naam Jap Mala – 108 Bead Japa Counter";
const DESCRIPTION =
  "Chant the holy name on a 108-bead mala. Swipe down to draw each bead, count your malas, and add your naam jap to the collective offering.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: MALA_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: MALA_PATH },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function MalaPage() {
  return (
    <>
      <h1 className="visually-hidden">Naam jap mala</h1>
      <MalaView />
    </>
  );
}
