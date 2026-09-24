// Hanuman Chalisa, Bajrang Baan & Ram Stuti — English transliteration + English meaning
// Hanuman Chalisa meanings adapted from a widely circulated English rendering (hanuman41.org).
// Bajrang Baan text & meanings adapted from a widely circulated English rendering with diacritic transliteration.

export type StanzaType = "doha" | "chaupai" | "invocation" | "sortha";

export interface Stanza {
  type: StanzaType;
  n?: number;
  /** start (seconds) of this stanza in the text's Learn-mode chant audio */
  t?: number;
  /** optional end (seconds), to stop before an instrumental interlude */
  tEnd?: number;
  text: string;
  meaning: string;
}

export interface ChantAudio {
  videoId: string;
  endT: number;
  title: string;
  channel: string;
  credit: string;
}

export interface PrayerText {
  id: string;
  title: string;
  subtitle: string;
  stanzas: Stanza[];
  audio: ChantAudio;
}

// Ram Stuti — "Shri Ramchandra Kripalu Bhajman", by Tulsidas
// `t` = approx start (seconds) of each verse in the Learn-mode chant audio (TEXTS.ramstuti.audio),
// estimated from the video's auto-transcript — nudge if a verse starts early/late.
const RAM_STUTI: Stanza[] = [
  {
    type: "chaupai",
    n: 1,
    t: 6.5,
    text: "Shri Ramachandra Kripalu Bhajman\nHarana Bhavabhaya Daarunam\nNavakanja Lochana Kanja Mukhakara\nKanja Pada Kanjaarunam",
    meaning:
      "Oh, my heart! Sing praises of Sri Ram, Who absolves the greatest fears due to the cycle of life and death, and Whose eyes, mouth, hands, and feet are like a newly blooming red lotus.",
  },
  {
    type: "chaupai",
    n: 2,
    t: 21.5,
    text: "Kandarpa Aganita Amita Chhav Nava\nNeela Neerara Sundaram\nPatapita Maanahum Tadita Ruchi Shuchi\nNavmi Janaka Sutaavaram",
    meaning:
      "The shade of His beauty is greater than that of countless Cupids. His body has a beautiful color like a new blue-water cloud. His yellow robes shine like lightning on His cloud-like body, His beauty is gleaming, and He is the consort of the daughter of Janak (Sita).",
  },
  {
    type: "chaupai",
    n: 3,
    t: 36.5,
    text: "Bhaju Deena Bandhu Dinesh Daanav\nDaityavansha Nikandanam\nRaghunanda Aananda Kanda Kaushala\nChanda Dasharatha Nandanam",
    meaning:
      "Sing praises of Sri Ram, Who is the friend of the poor, Who is the Lord of the Sun, Who destroyed the lineage of demons born of Danu and Diti, Who is the dear one of Raghu, Who is like a cloud of happiness, Who is like a moon for Kosala Desa, and Who is the dear one of Dashrath.",
  },
  {
    type: "chaupai",
    n: 4,
    t: 51.5,
    tEnd: 68, // instrumental + "Shri Ram" interlude follows
    text: "Sira Mukuta Kundala Tilaka Chaaru\nUdaaru Anga Vibhooshanam\nAajaanu Bhuja Shara Chaapadhara\nSangraama-jita-khara Dooshanam",
    meaning:
      "Sing praises of Sri Ram, Who has a beautiful crown on His head, Who is adorned with ear-hoops, Who has a beautiful colored mark (tilak) on His forehead, Who is decorated with beautiful ornaments, Who has long arms reaching His knees, Who holds a bow and an arrow, and Who defeated Khar and Dushan in a fierce battle.",
  },
  {
    type: "chaupai",
    n: 5,
    t: 97.5,
    text: "Iti Vadati Tulsidas Shankar\nShesha Muni Manaranjanam\nMama Hridayakanja Nivaas Kuru\nKaamaadi Khaladal Ganjanam",
    meaning:
      "Tulsidas prays that Ram, the one who pleases the mind of Lord Shiv, Shesh (Sheshnag) and the saints, always reside in my lotus-like heart and destroy the evils born of desire, such as lust, anger and greed.",
  },
  {
    type: "chaupai",
    n: 6,
    t: 112,
    text: "Manu Jaahin Raacheu Milihi so Baru\nSahaja Sundara Saanvaro\nKaruna Nidhaan Sujaan Seelu\nSanehu Jaanat Raavaro",
    meaning:
      "The one to whom your mind has become attached, that naturally beautiful, dark-complexioned groom (Shri Ramchandraji), you will attain. He is the treasure of mercy and all-knowing (Sarvagya).",
  },
  {
    type: "chaupai",
    n: 7,
    t: 127.5,
    text: "Ehi Bhaanti Gauri Asees Suni Siya\nSahita Hiyan Harashi Ali\nTulsi Bhavaanihi Pooji Puni Puni\nMudit Man Mandir Chalee",
    meaning:
      "In this way, hearing the blessings of Shri Gauriji, all the friends along with Jankiji were happy in their hearts. Tulsidasji says that after worshipping Bhavani again and again, Sitaji returned to the palace with a happy heart.",
  },
];

const CHALISA: Stanza[] = [
  {
    type: "doha",
    text: "Shri Guru charan saroj raj, nij mane mukure sudhaari\nVarnao Raghuvar vimal jasu, jo dayaku phal chaari",
    meaning:
      "After cleansing the mirror of my mind with the pollen dust of holy Guru's lotus feet, I profess the pure, untainted glory of Shri Raghuvar, which bestows the four-fold fruits of life — Dharma, Artha, Kama and Moksha.",
    t: 2,
  },
  {
    type: "doha",
    text: "Budhi heen tanu janike, sumirau Pavan-kumar\nBala buddhi vidya dehu mohe, harahu kalesa vikaar",
    meaning:
      "Fully aware of the deficiency of my intelligence, I turn my attention to Pavan Kumar and humbly ask for strength, intelligence and true knowledge, to relieve me of all troubles and flaws.",
    t: 12,
  },
  {
    type: "chaupai",
    n: 1,
    text: "Jai Hanuman gyan gun sagar\nJai Kapis tihun lok ujagar",
    meaning:
      "Victory to you, O Hanuman! Ocean of wisdom and virtue. All hail to you, O Kapisa — you illuminate all three worlds with your glory.",
    t: 22,
  },
  {
    type: "chaupai",
    n: 2,
    text: "Ram doot atulit bal dhama\nAnjani-putra Pavan sut naama",
    meaning:
      "You are the divine messenger of Shri Ram, repository of immeasurable strength, known as the son of Anjani, born of the Wind.",
    t: 27,
  },
  {
    type: "chaupai",
    n: 3,
    text: "Mahavir vikram Bajrangi\nKumati nivar sumati ke sangi",
    meaning:
      "With limbs as sturdy as Vajra, you are valiant and brave. Good sense and wisdom attend you, and you dispel the darkness of evil thoughts.",
    t: 33,
  },
  {
    type: "chaupai",
    n: 4,
    text: "Kanchan varan viraj subesa\nKanan kundal kunchit kesa",
    meaning:
      "Your physique is beautiful, golden-coloured, and your dress is pretty. You wear earrings and have long, curly hair.",
    t: 37,
  },
  {
    type: "chaupai",
    n: 5,
    text: "Hath vajra aur dhuvaje viraje\nKandhe moonj janehu sajai",
    meaning:
      "You carry a lightning bolt in your hand along with a victory flag, and wear the sacred thread upon your shoulder.",
    t: 42,
  },
  {
    type: "chaupai",
    n: 6,
    text: "Sankar suvan kesari nandan\nTej pratap maha jag vandan",
    meaning:
      "As a descendant of Lord Shankar, you are the comfort and pride of Kesari. With the lustre of your vast power, you are revered all over the universe.",
    t: 48,
  },
  {
    type: "chaupai",
    n: 7,
    text: "Vidyavan guni ati chatur\nRam kaj karibe ko aatur",
    meaning:
      "You are learned, virtuous and fully accomplished — always keen to carry out the tasks of Shri Ram.",
    t: 52,
  },
  {
    type: "chaupai",
    n: 8,
    text: "Prabhu charitra sunibe ko rasiya\nRam Lakhan Sita man basiya",
    meaning:
      "You are an ardent listener, always eager for the stories of Shri Ram's life. Your heart is so filled with him that Ram, Lakshman and Sita dwell within it.",
    t: 58,
  },
  {
    type: "chaupai",
    n: 9,
    text: "Sukshma roop dhari Siyahi dikhava\nVikat roop dhari Lanka jarava",
    meaning:
      "You appeared before Sita in a tiny form and spoke to her with humility; then, taking a fearsome form, you set Lanka ablaze.",
    t: 63,
  },
  {
    type: "chaupai",
    n: 10,
    text: "Bhim roop dhari asur sanhare\nRamchandra ke kaj sanvare",
    meaning:
      "With overwhelming might you destroyed the demons, and accomplished every task assigned to you by Shri Ram with great skill.",
    t: 69,
  },
  {
    type: "chaupai",
    n: 11,
    text: "Laye Sanjivan Lakhan jiyaye\nShri Raghuvir harashi ur laye",
    meaning:
      "You brought the Sanjivani herb and restored Lakshman to life; Shri Raghuvir embraced you cheerfully, his heart full of joy.",
    t: 73,
  },
  {
    type: "chaupai",
    n: 12,
    text: "Raghupati kinhi bahut badai\nTum mam priye Bharat-hi sam bhai",
    meaning:
      "Shri Raghupati lavishly praised your excellence and said: 'You are as dear to me as my own brother Bharat.'",
    t: 78,
  },
  {
    type: "chaupai",
    n: 13,
    text: "Sahas badan tumharo yash gaave\nAs kahi Shripati kanth lagaave",
    meaning:
      "Thousands of beings chant hymns of your glory; saying this, Shri Ram warmly embraced you.",
    t: 83,
  },
  {
    type: "chaupai",
    n: 14,
    text: "Sanakadik Brahmadi muneesa\nNarad Sarad sahit Aheesa",
    meaning:
      "Sages like Sanak, the creator Brahma, the great sage Narad, Goddess Saraswati, and the serpent king Ahisha all extol your glory.",
    t: 89,
  },
  {
    type: "chaupai",
    n: 15,
    text: "Jam Kuber Digpal jahan te\nKavi kovid kahi sake kahan te",
    meaning:
      "Even Yamraj (God of Death), Kuber (God of Wealth) and the guardians of the four directions vie with one another in offering homage to you — how then can a mere poet fully express your glory?",
    t: 93,
  },
  {
    type: "chaupai",
    n: 16,
    text: "Tum upkar Sugreevahin keenha\nRam milaye rajpad deenha",
    meaning:
      "You rendered a great service to Sugriv: you united him with Shri Ram, who then installed him on the royal throne.",
    t: 98,
  },
  {
    type: "chaupai",
    n: 17,
    text: "Tumharo mantra Vibheeshan mana\nLankeshwar bhaye sub jag jana",
    meaning:
      "By heeding your counsel, Vibhishan became Lord of Lanka — this is known all over the world.",
    t: 104,
  },
  {
    type: "chaupai",
    n: 18,
    text: "Yug sahastra jojan par Bhanu\nLeelyo tahi madhur phal janu",
    meaning:
      "On your own you leapt for the sun, at a fabulous distance of thousands of miles, thinking it to be a sweet, luscious fruit.",
    t: 108,
  },
  {
    type: "chaupai",
    n: 19,
    text: "Prabhu mudrika meli mukh mahee\nJaladhi langhi gaye achraj nahee",
    meaning:
      "Carrying the Lord's signet ring in your mouth, it was hardly any wonder that you leapt easily across the ocean.",
    t: 114,
  },
  {
    type: "chaupai",
    n: 20,
    text: "Durgaam kaj jagat ke jete\nSugam anugraha tumhre tete",
    meaning:
      "The burden of every difficult task in this world becomes light through your kind grace.",
    t: 119,
  },
  {
    type: "chaupai",
    n: 21,
    text: "Ram dware tum rakhvare\nHoat na agya binu paisare",
    meaning:
      "You are the sentry at the door of Shri Ram's divine abode; no one may enter without your permission.",
    t: 124,
  },
  {
    type: "chaupai",
    n: 22,
    text: "Sub sukh lahai tumhari sarna\nTum rakshak kahu ko dar na",
    meaning:
      "All comfort in the world lies at your feet; your devotees enjoy every divine pleasure and feel fearless under your protection.",
    t: 129,
  },
  {
    type: "chaupai",
    n: 23,
    text: "Aapan tej samharo aapai\nTeenhon lok hank te kanpai",
    meaning:
      "You alone are fit to bear your own splendid valour; all three worlds tremble at your thunderous call.",
    t: 134,
  },
  {
    type: "chaupai",
    n: 24,
    text: "Bhoot pisach nikat nahin aavai\nMahavir jab naam sunavai",
    meaning:
      "All ghosts, demons and evil forces keep away at the mere mention of your great name, O Mahaveer!",
    t: 139,
  },
  {
    type: "chaupai",
    n: 25,
    text: "Nase rog harai sab peera\nJapat nirantar Hanumant beera",
    meaning:
      "All disease, pain and suffering disappear for one who regularly recites the holy name of brave Hanuman.",
    t: 144,
  },
  {
    type: "chaupai",
    n: 26,
    text: "Sankat se Hanuman chudavai\nMan karam vachan dhyan jo lavai",
    meaning:
      "Those who remember Shri Hanuman in thought, word and deed with sincerity and faith are rescued from every crisis.",
    t: 149,
  },
  {
    type: "chaupai",
    n: 27,
    text: "Sub par Ram tapasvee raja\nTin ke kaj sakal tum saja",
    meaning:
      "For all who hold faith in Shri Ram, the supreme lord and king of penance, you make every difficult task of theirs easy.",
    t: 154,
  },
  {
    type: "chaupai",
    n: 28,
    text: "Aur manorath jo koi lavai\nSohi amit jeevan phal pavai",
    meaning:
      "Whoever comes to you with any wish, in faith and sincerity, alone secures the imperishable fruit of human life.",
    t: 159,
  },
  {
    type: "chaupai",
    n: 29,
    text: "Charon yug partap tumhara\nHai persidh jagat ujiyara",
    meaning:
      "Through all four ages your magnificent glory is acclaimed far and wide, radiant throughout the cosmos.",
    t: 164,
  },
  {
    type: "chaupai",
    n: 30,
    text: "Sadhu sant ke tum rakhware\nAsur nikandan Ram dulhare",
    meaning:
      "You are the saviour and guardian of saints and sages, destroyer of demons, and the beloved darling of Shri Ram.",
    t: 169,
  },
  {
    type: "chaupai",
    n: 31,
    text: "Ashta sidhi nav nidhi ke dhata\nUs var deen Janki mata",
    meaning:
      "You can grant anyone the eight yogic powers and the nine treasures — this boon was conferred upon you by Mother Janki.",
    t: 174,
  },
  {
    type: "chaupai",
    n: 32,
    text: "Ram rasayan tumhare pasa\nSada raho Raghupati ke dasa",
    meaning:
      "You possess the elixir of devotion to Shri Ram; in every rebirth you remain Raghupati's most dedicated servant.",
    t: 180,
  },
  {
    type: "chaupai",
    n: 33,
    text: "Tumhare bhajan Ram ko pavai\nJanam janam ke dukh bisravai",
    meaning:
      "Through hymns sung in devotion to you, one attains Shri Ram and becomes free from the suffering of countless births.",
    t: 184,
  },
  {
    type: "chaupai",
    n: 34,
    text: "Anth kaal Raghuvir pur jayee\nJahan janam Hari-bhakt kahayee",
    meaning:
      "If at the time of death one enters the divine abode of Shri Ram, thereafter in every future birth they are known as the Lord's devotee.",
    t: 189,
  },
  {
    type: "chaupai",
    n: 35,
    text: "Aur devta chit na dharehi\nHanumant se hi sarve sukh karehi",
    meaning:
      "There is no need to worship any other deity, for devotion to Shri Hanuman alone brings all happiness.",
    t: 194,
  },
  {
    type: "chaupai",
    n: 36,
    text: "Sankat kate mite sab peera\nJo sumirai Hanumat Balbeera",
    meaning:
      "One is freed from all suffering and misfortune who adores and remembers Shri Hanuman, mighty and brave.",
    t: 200,
  },
  {
    type: "chaupai",
    n: 37,
    text: "Jai Jai Jai Hanuman Gosahin\nKripa karahu Gurudev ki nyahin",
    meaning:
      "Hail, hail, hail, Shri Hanuman, lord of the senses! Bless me, in your role as my supreme Guru.",
    t: 204,
  },
  {
    type: "chaupai",
    n: 38,
    text: "Jo sat bar path kare kohi\nChutehi bandhi maha sukh hohi",
    meaning:
      "One who recites this Chalisa a hundred times is freed from the bondage of life and death, and enjoys the highest bliss.",
    t: 209,
  },
  {
    type: "chaupai",
    n: 39,
    text: "Jo yah padhe Hanuman Chalisa\nHoye sidhi sakhi Gaureesa",
    meaning:
      "All who regularly recite the Hanuman Chalisa are sure to attain success — this is affirmed by no less a witness than Lord Shankar himself.",
    t: 214,
  },
  {
    type: "chaupai",
    n: 40,
    text: "Tulsidas sada hari chera\nKeejai das hrdaye mein dera",
    meaning:
      "Tulsidas, as a devoted servant of Hari, forever at his feet, prays: 'O Lord, enshrine yourself within my heart and soul.'",
    t: 220,
  },
  {
    type: "doha",
    text: "Pavan tanai sankat haran, mangal murti roop\nRam Lakhan Sita sahit, hrdaye basahu sur bhoop",
    meaning:
      "O conqueror of the Wind, destroyer of all miseries, symbol of auspiciousness — dwell in my heart, along with Shri Ram, Lakshman and Sita, O king of gods.",
    t: 224,
  },
];

const CHALISA_END_T = 234; // approx end of chant audio, after the closing doha's outro

// Bajrang Baan — text and meanings adapted from a widely circulated English
// rendering with diacritic transliteration. Regional variants of the wording
// exist; cross-check against a source you trust before formal recitation.
// `t` = approx start (seconds) of each stanza in the Learn-mode chant audio (TEXTS.bajrangbaan.audio);
// optional `tEnd` stops Learn before an instrumental/chant interlude.
const BAJRANG_BAAN: Stanza[] = [
  {
    type: "invocation",
    t: 0,
    text: "Om Sri Hanumāte Namah",
    meaning: "Om, salutations to Sri Hanuman.",
  },
  {
    type: "doha",
    t: 5,
    text: "Nishchaya prema pratīti té, binaya kare sanamān\nTéhi ke kāraja sakala shubha, siddha karéñ Hanumān",
    meaning:
      "Those devotees who recite these verses with love and unwavering faith have all their beneficial desires fulfilled by Hanuman.",
  },
  {
    type: "chaupai",
    n: 1,
    t: 27.6,
    text: "Jaya Hanumanta santa hitakāri\nSuni lījai prabhu araja hamārī\nJana ke kāja bilamba na kījai\nĀtura dauri mahā sukha dījai",
    meaning:
      "Glory to Hanuman, the benefactor of saints. Please listen to our prayer. Do not delay in doing the work of your devotees — please rush to do it and give us immense peace.",
  },
  {
    type: "chaupai",
    n: 2,
    t: 37,
    text: "Jaisé kūdi sindu wahi pārā\nSurasā badana paiṭhi vistārā\nĀgé jā-i laṅkinī rokā\nMāréhu lāta ga-ī suralokā",
    meaning:
      "[Come running] just like when you leapt across the ocean, entered and emerged from the expanded mouth of Surasa who tried to obstruct your path, and on landing in Lanka sent the demoness Lankini to the heavenly abode with a single kick when she tried to stop you.",
  },
  {
    type: "chaupai",
    n: 3,
    t: 45.9,
    text: "Jāya Vibhīshaṇa ko sukha dīnhā\nSītā nirakhi parama pada līnhā\nBāga ujāri sindhu mahaṅ borā\nAti ātura Yamakātura torā",
    meaning:
      "In Lanka you gave joy to Vibhishan by meeting him, and attained the supreme position of being loved by Sri Ram through Sita's merciful blessing. Then you laid waste the Ashoka grove and dumped the trees in the ocean, symbolically breaking the knife of Yama, the God of Death.",
  },
  {
    type: "chaupai",
    n: 4,
    t: 54.5,
    text: "Akshaya Kumār ko māri saṅhārā\nLūma lapéti Laṅka ko jārā\nLāha samāna Laṅka jari gaī\nJaya jaya dhuni surapura manha bhaī",
    meaning:
      "You killed Akshay Kumar, Ravana's son, and burnt Lanka with your tail. Lanka burned like molten lac, and the heavens filled with the sound of 'Hail to Hanuman's glory.'",
  },
  {
    type: "chaupai",
    n: 5,
    t: 63.5,
    text: "Aba bilamba kéhi kāraṇa swāmi\nKṛpā karahu ura antarayāmī\nJaya jaya Lakhana prāṇa ké dātā\nĀtura ho-i dukha karahu nipātā",
    meaning:
      "Why are you delaying now, my Lord? You know what resides in the minds of your devotees, so have mercy on me. Glory to you who restored the life of Lakshman — quickly dispel my fears.",
  },
  {
    type: "chaupai",
    n: 6,
    t: 72,
    text: "Jai giridhara jai jai sukha sāgara\nSura samūha samarata bhaṭa nāgara\nOm hanu hanu hanu hanumanta hatīlé\nBairihiñ māru vajra ké kīlé",
    meaning:
      "Hail to you, holder of the mountain! You are an ocean of happiness, wisest among the gods and most skillful. O you of indomitable spirit, strike down the enemies — lust, anger, greed — as if nailed by the strike of a thunderbolt.",
  },
  {
    type: "chaupai",
    n: 7,
    t: 81,
    text: "Gadā vajra lai bairihiñ māro\nMahārāja prabhu dāsa ubāro\nOmkāra huñkāra mahāvīra dhāvau\nVajra gadā hanu vilamba na lāvo",
    meaning:
      "O Lord! Relieve your servant by striking the enemies with your mace, as if it were a thunderbolt. Sounding the roar of Om, rush upon the enemy and crush them with your mace, without delay.",
  },
  {
    type: "chaupai",
    n: 8,
    t: 89.5,
    text: "Om hrīm hrīm hrīm hanumanta kapīsā\nOm huñ huñ huñ hanu ari ura shīshā\nSatya hohu hari shapata pāyaké\nRāmadūta dharu māru dhāyaké",
    meaning:
      "O Hanuman, Lord of the Monkeys, I invoke you with the sacred sound Om hrīm hrīm hrīm and Om huñ huñ huñ. Strike the enemy in the chest and head. I swear by the name of Hari that all I say is true — O messenger of Sri Ram, rush to attack the enemy at once.",
  },
  {
    type: "chaupai",
    n: 9,
    t: 98,
    text: "Jaya jaya jaya hanumanta agādhā\nDukha pāvata jana kéhi aparādhā\nPūjā japa tapa néma achārā\nNahiñ jānata hauñ dāsa tumhārā",
    meaning:
      "Glory to you, O fathomless Hanuman! For which offence is your devotee suffering so much? This servant of yours knows nothing of worship, sacred chanting, penance, or the discipline of ritual and virtue.",
  },
  {
    type: "chaupai",
    n: 10,
    t: 107,
    text: "Bana upavana maga giri gṛha māhīñ\nTumhare bala ham darapata nāhiñ\nPānya parauñ kara jori manāvaūñ\nYahi avasara aba kéhi gohrāvaūñ",
    meaning:
      "Relying on your strength, I fear nothing anywhere — in forest, garden, mountain, road or home. I fall at your feet and entreat you with folded hands. For whom else shall I call at this hour?",
  },
  {
    type: "chaupai",
    n: 11,
    t: 116,
    text: "Jaya Anjanī kumāra balavantā\nShaṅkara suvana bīra hanumantā\nBadana karāla kāla kula ghālaka\nRāma sahāya sadā pratipālaka",
    meaning:
      "Hail Hanuman! All-powerful son of Anjani and brave son of Shiva. Your form is fierce and terrifying, and you are the slayer of Death's own minions. You are always by the side of Sri Ram, and the benefactor of all.",
  },
  {
    type: "chaupai",
    n: 12,
    t: 124,
    text: "Bhūta, preta, pisācha, nisāchara\nAgni baitāla kāla māri mara\nInhéṅ māru tohi shapatha Rāma ki\nRākhu nātha maryāda nāma ki",
    meaning:
      "Slay all evil spirits — ghosts, spirits, hobgoblins, demons, fire, vampires, calamity and epidemic. Destroy them all in the name of Lord Sri Ram, upholding the sanctity of his holy name.",
  },
  {
    type: "chaupai",
    n: 13,
    t: 132.8,
    text: "Janakasutā Hari dāsa kahāvo\nTākī shapata bilamba na lāvo\nJaya jaya jaya dhuni hota akāshā\nSumirata hota dusaha dukha nāshā",
    meaning:
      "You are the servant of Sri Ram and Mother Sita — I implore you in their names, make no delay. The sky reverberates with the sound of your glory, and its mere remembrance dispels all sorrow.",
  },
  {
    type: "chaupai",
    n: 14,
    t: 142,
    text: "Charaṇa sharaṇa kara jori manāvauñ\nYahi avasara aba kehi goharāvauñ\nUṭhu uṭhu chalu tohi Rāma dohā-ī\nPāñya parauń kara jori manā-ī",
    meaning:
      "I have come to take refuge at your feet. I plead with you — who else shall I call for help at this urgent hour? Get up, get up, come along! I urge you with folded hands to act.",
  },
  {
    type: "chaupai",
    n: 15,
    t: 150.5,
    text: "Om chãṁ chãṁ chãṁ chãṁ chapala chalantā\nOm hanu hanu hanu hanu hanumantā\nOm hañ hañ hāṅka déta kapi chañchal\nOm sam sam sahami parāné khaladal",
    meaning:
      "I implore you, O nimble-footed Hanuman, with the call of Om chãṁ chãṁ chãṁ chãṁ and Om hanu hanu hanu hanu — strike swiftly, like lightning. Whenever the swift Hanuman roars, the crowd of evildoers flees in terror.",
  },
  {
    type: "chaupai",
    n: 16,
    t: 158.8,
    text: "Apané jana ko turata ubāro\nSumirata hoya ānanda hamāro\nYahi bajarañga bāṇa jéhi māré\nTāhi kaho phir kauna ubāré",
    meaning:
      "Save this devotee of yours at once — remembering you brings me immense joy. Who can save one who is struck by this Bajarang Baan, the arrow as strong as a thunderbolt?",
  },
  {
    type: "chaupai",
    n: 17,
    t: 168,
    text: "Pāṭa karai bajarañga bāna ki\nHanumata rakshā karaiń prāna ki\nYaha bajarañga baṇa jo jāpai\nTéhi té bhūta préta saba kañpai",
    meaning:
      "Those who recite these verses of Bajarang Baan are protected for life by Hanuman. Even ghosts and evil spirits tremble in fear of those who chant this Bajarang Baan.",
  },
  {
    type: "chaupai",
    n: 18,
    t: 177,
    tEnd: 183, // a long "Jai Hanuman" chant follows before the closing doha
    text: "Dhūpa déy aru japai hameshā\nTāké tana nahiñ rahai kaleshā",
    meaning:
      "Those who wave incense before you and chant your holy name always remain free from bodily affliction of every kind.",
  },
  {
    type: "doha",
    t: 209,
    text: "Prema pratītihi kapi bhajai, sadā dharai ura dhyān\nTéhi ke kāraja sakala shubha, siddha karaĩ Hanumān",
    meaning:
      "Those who chant Hanuman's holy name with faith, devotion and love, always holding him in their hearts, are sure to have all their desires fulfilled by Hanuman.",
  },
];

export const TEXTS = {
  ramstuti: {
    id: "ramstuti",
    title: "Ram Stuti",
    subtitle: "Shri Ramchandra Kripalu Bhajman",
    stanzas: RAM_STUTI,
    audio: {
      videoId: "leVoi6kkp3o",
      endT: 146, // verse 7 ends; the sortha that follows in the audio is not shown
      title: "Shree Ram Stuti",
      channel: "Nitya Bhakti",
      credit: "Sonika Sharma Agarwal",
    },
  },
  chalisa: {
    id: "chalisa",
    title: "Hanuman Chalisa",
    subtitle: "Forty verses in praise of Shri Hanuman",
    stanzas: CHALISA,
    audio: {
      videoId: "BLlTFapgvOo",
      endT: CHALISA_END_T,
      title: "Shree Hanuman Chalisa (Lo-fi, slowed & reverb)",
      channel: "Vianet LoFi Bhajans",
      credit: "Rasraj Ji Maharaj",
    },
  },
  bajrangbaan: {
    id: "bajrangbaan",
    title: "Bajrang Baan",
    subtitle: "The arrow-prayer of Bajrang Bali",
    stanzas: BAJRANG_BAAN,
    audio: {
      videoId: "wuYgr4gcNLw",
      endT: 218, // closing doha ends; jaikaras follow
      title: "Bajrang Baan (Lofi Version)",
      channel: "Rasraj Ji Maharaj Official",
      credit: "Rasraj Ji Maharaj",
    },
  },
} satisfies Record<string, PrayerText>;

export type TextId = keyof typeof TEXTS;
export const TEXT_IDS = Object.keys(TEXTS) as TextId[];
