import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CollectiveOffering from "@/components/home/CollectiveOffering";
import Lotus from "@/components/home/Lotus";
import { MALA_PATH, PATH_ORDER, TEXT_PAGES, textHref } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";
import { TEXTS } from "@/lib/texts";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const PRACTICES = [
  {
    num: "१",
    title: "Read",
    body: "Move verse by verse with a swipe or the arrow keys. Tap Translation to see the meaning beneath the lines.",
  },
  {
    num: "२",
    title: "Learn",
    body: "Press Learn and a chant recording sings the verse, lighting each line as it is sung. Slow it to half speed while the words settle in.",
  },
  {
    num: "३",
    title: "Complete",
    body: "Reach the final verse, or tap Mark complete, and your path is counted: in your own tally and in the collective offering.",
  },
  {
    num: "४",
    title: "Turn the mala",
    body: "Draw each of the 108 beads with a swipe down, as a mala moves through the fingers. Every name joins the count above.",
    href: MALA_PATH,
  },
];

// Structured data for search + AI answer engines (GEO)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Hanuman Chalisa, Bajrang Baan & Ram Stuti",
      url: `${SITE_URL}/`,
      description:
        "Read, learn and chant the Hanuman Chalisa, Bajrang Baan and Ram Stuti in English, with meaning, guided line-by-line learning and a japa counter.",
      inLanguage: "en",
      author: { "@type": "Person", name: "Pravaat Chhetri" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the Hanuman Chalisa?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Hanuman Chalisa is a devotional hymn of forty verses (chaupais), composed by the 16th-century poet-saint Tulsidas, praising the strength, wisdom and unwavering devotion of Shri Hanuman.",
          },
        },
        {
          "@type": "Question",
          name: "What is Bajrang Baan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bajrang Baan, meaning 'the arrow of Bajrang Bali,' is a devotional prayer invoking Hanuman's protection. It is traditionally recited for courage and relief from fear, obstacles or hardship.",
          },
        },
        {
          "@type": "Question",
          name: "What is Ram Stuti?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ram Stuti, beginning 'Shri Ramchandra Kripalu Bhajman,' is a hymn by Tulsidas in praise of Shri Ram's compassion, beauty and divine form. It is commonly recited during Ram aarti and daily worship.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className="home-view">
      <CollectiveOffering />

      <Lotus />

      <section className="home-section invocation reveal" aria-labelledby="invocationTitle">
        <p className="deva-line" lang="hi">
          ॥ श्री राम जय राम जय जय राम ॥
        </p>
        <p className="deva-translit">Shri Ram, Jai Ram, Jai Jai Ram</p>
        <h2 className="section-title" id="invocationTitle">
          A quiet place <em>to recite</em>
        </h2>
        <p className="section-lede">
          This site is offered in devotion to Shri Hanuman and Shri Ram. The Ram Stuti, Hanuman Chalisa and Bajrang
          Baan are here in English transliteration, beside their plain-English meaning. Newcomers and lifelong devotees
          alike can read along, learn each verse with guided chant, and count every path they complete.
        </p>
      </section>

      <section className="home-section reveal" aria-labelledby="prayersTitle">
        <p className="section-eyebrow">Choose a path</p>
        <h2 className="section-title" id="prayersTitle">
          The three prayers
        </h2>
        <div className="prayer-cards">
          {PATH_ORDER.map((id) => {
            const page = TEXT_PAGES[id];
            const text = TEXTS[id];
            return (
              <article className="prayer-card" data-open={id} key={id}>
                <p className="prayer-deva" lang="hi">
                  {page.devanagari}
                </p>
                <h3 className="prayer-name">{text.title}</h3>
                <p className="prayer-meta">
                  {page.author && <>By {page.author} · </>}
                  {text.stanzas.length} stanzas
                </p>
                <p className="prayer-blurb">{page.blurb}</p>
                <Link className="prayer-go" href={textHref(id)}>
                  Begin the path <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <Lotus />

      <section className="home-section reveal" aria-labelledby="practiceTitle">
        <p className="section-eyebrow">How to practise</p>
        <h2 className="section-title" id="practiceTitle">
          Four ways <em>to sit with the verses</em>
        </h2>
        <ol className="practices">
          {PRACTICES.map((p) => (
            <li className="practice" key={p.title}>
              <span className="practice-num" lang="hi" aria-hidden="true">
                {p.num}
              </span>
              <div>
                <h3 className="practice-title">
                  {p.href ? <Link href={p.href}>{p.title}</Link> : p.title}
                </h3>
                <p className="practice-body">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section reveal" aria-labelledby="voicesTitle">
        <p className="section-eyebrow">Chant audio</p>
        <h2 className="section-title" id="voicesTitle">
          The voices <em>we chant with</em>
        </h2>
        <p className="section-note">
          Learn mode plays these YouTube recordings. All credit to the artists and channels; please listen to and
          support them on YouTube.
        </p>
        <div className="voices">
          {PATH_ORDER.map((id) => {
            const { videoId, title, channel, credit } = TEXTS[id].audio;
            return (
              <a
                key={id}
                className="voice"
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener"
              >
                <Image
                  className="voice-thumb"
                  src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                  alt=""
                  width={96}
                  height={54}
                />
                <span className="voice-info">
                  <span className="voice-used">{TEXTS[id].title}</span>
                  <span className="voice-title">{title}</span>
                  <span className="voice-by">
                    {credit} · {channel}
                  </span>
                </span>
                <span className="voice-go" aria-hidden="true">
                  ▶
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <Lotus />

      <section className="home-section letter reveal" aria-labelledby="aboutTitle">
        <p className="section-eyebrow">About this site</p>
        <h2 className="section-title" id="aboutTitle">
          A small <em>offering</em>
        </h2>
        <p className="letter-body">
          This site began as a personal offering: a place where I, and anyone else drawn to Bajrang Bali and Shri Ram,
          could read and recite these verses with focus, in a language we think in, wherever we happen to be. May
          Hanuman ji&apos;s strength and Shri Ram&apos;s grace be with you.
        </p>
        <p className="letter-sign">
          Pravaat Chhetri
          <span>Software developer · Thimphu, Bhutan</span>
        </p>
        <p className="deva-line closing" lang="hi">
          जय श्री राम · जय हनुमान
        </p>
      </section>

      <p className="home-privacy">
        Your own counts stay in this browser. Each completed path and each bead adds an anonymous +1 to the collective
        count. No name, account or identifier is sent with it.
      </p>

      <script
        type="application/ld+json"
        // static object defined above; escape "<" so the JSON can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
