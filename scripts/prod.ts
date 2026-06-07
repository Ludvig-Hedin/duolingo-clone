import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, { schema });

type ChallengeType = (typeof schema.challengesEnum.enumValues)[number];

/**
 * A single answerable item.
 *
 * - `source` the word shown in the question, in the language the learner knows
 * - `target` the correct answer, in the language being learned
 * - `image`  optional illustration (only the Spanish course has assets)
 * - `audio`  optional pronunciation of the target word
 */
type Item = {
  source: string;
  target: string;
  image?: string;
  audio?: string;
};

type SeedLesson = { title: string; tip?: string; items: Item[] };
type SeedUnit = { title: string; description: string; lessons: SeedLesson[] };
type SeedCourse = {
  title: string;
  imageSrc: string;
  /** Wraps a source word into a "pick the translation" prompt, in the source language. */
  selectPrompt: (source: string) => string;
  units: SeedUnit[];
};

/* -------------------------------------------------------------------------- */
/*  Swedish <-> Polish curriculum (shared, drives both directional courses)    */
/* -------------------------------------------------------------------------- */

type Vocab = { en: string; sv: string; pl: string };
type ThemeUnit = {
  theme: string;
  lessons: { title: string; words: Vocab[] }[];
};

const CURRICULUM: ThemeUnit[] = [
  {
    theme: "People & Family",
    lessons: [
      {
        title: "People",
        words: [
          { en: "man", sv: "man", pl: "mężczyzna" },
          { en: "woman", sv: "kvinna", pl: "kobieta" },
          { en: "boy", sv: "pojke", pl: "chłopiec" },
          { en: "girl", sv: "flicka", pl: "dziewczyna" },
          { en: "child", sv: "barn", pl: "dziecko" },
          { en: "friend", sv: "vän", pl: "przyjaciel" },
        ],
      },
      {
        title: "Family",
        words: [
          { en: "mother", sv: "mamma", pl: "mama" },
          { en: "father", sv: "pappa", pl: "tata" },
          { en: "sister", sv: "syster", pl: "siostra" },
          { en: "brother", sv: "bror", pl: "brat" },
          { en: "family", sv: "familj", pl: "rodzina" },
          { en: "grandmother", sv: "mormor", pl: "babcia" },
        ],
      },
    ],
  },
  {
    theme: "Food & Drink",
    lessons: [
      {
        title: "Food",
        words: [
          { en: "bread", sv: "bröd", pl: "chleb" },
          { en: "apple", sv: "äpple", pl: "jabłko" },
          { en: "fish", sv: "fisk", pl: "ryba" },
          { en: "meat", sv: "kött", pl: "mięso" },
          { en: "cheese", sv: "ost", pl: "ser" },
          { en: "egg", sv: "ägg", pl: "jajko" },
        ],
      },
      {
        title: "Drinks",
        words: [
          { en: "water", sv: "vatten", pl: "woda" },
          { en: "milk", sv: "mjölk", pl: "mleko" },
          { en: "coffee", sv: "kaffe", pl: "kawa" },
          { en: "tea", sv: "te", pl: "herbata" },
          { en: "juice", sv: "juice", pl: "sok" },
          { en: "wine", sv: "vin", pl: "wino" },
        ],
      },
    ],
  },
  {
    theme: "Animals",
    lessons: [
      {
        title: "Animals",
        words: [
          { en: "dog", sv: "hund", pl: "pies" },
          { en: "cat", sv: "katt", pl: "kot" },
          { en: "horse", sv: "häst", pl: "koń" },
          { en: "bird", sv: "fågel", pl: "ptak" },
          { en: "cow", sv: "ko", pl: "krowa" },
          { en: "mouse", sv: "mus", pl: "mysz" },
        ],
      },
      {
        title: "More animals",
        words: [
          { en: "pig", sv: "gris", pl: "świnia" },
          { en: "sheep", sv: "får", pl: "owca" },
          { en: "hen", sv: "höna", pl: "kura" },
          { en: "fox", sv: "räv", pl: "lis" },
          { en: "bear", sv: "björn", pl: "niedźwiedź" },
          { en: "duck", sv: "anka", pl: "kaczka" },
        ],
      },
    ],
  },
  {
    theme: "Colors & Adjectives",
    lessons: [
      {
        title: "Colors",
        words: [
          { en: "red", sv: "röd", pl: "czerwony" },
          { en: "blue", sv: "blå", pl: "niebieski" },
          { en: "green", sv: "grön", pl: "zielony" },
          { en: "yellow", sv: "gul", pl: "żółty" },
          { en: "black", sv: "svart", pl: "czarny" },
          { en: "white", sv: "vit", pl: "biały" },
        ],
      },
      {
        title: "Adjectives",
        words: [
          { en: "big", sv: "stor", pl: "duży" },
          { en: "small", sv: "liten", pl: "mały" },
          { en: "good", sv: "bra", pl: "dobry" },
          { en: "bad", sv: "dålig", pl: "zły" },
          { en: "new", sv: "ny", pl: "nowy" },
          { en: "old", sv: "gammal", pl: "stary" },
        ],
      },
    ],
  },
  {
    theme: "Verbs",
    lessons: [
      {
        title: "Verbs",
        words: [
          { en: "to eat", sv: "äta", pl: "jeść" },
          { en: "to drink", sv: "dricka", pl: "pić" },
          { en: "to sleep", sv: "sova", pl: "spać" },
          { en: "to read", sv: "läsa", pl: "czytać" },
          { en: "to write", sv: "skriva", pl: "pisać" },
          { en: "to speak", sv: "tala", pl: "mówić" },
        ],
      },
      {
        title: "More verbs",
        words: [
          { en: "to go", sv: "gå", pl: "iść" },
          { en: "to come", sv: "komma", pl: "przyjść" },
          { en: "to see", sv: "se", pl: "widzieć" },
          { en: "to have", sv: "ha", pl: "mieć" },
          { en: "to want", sv: "vilja", pl: "chcieć" },
          { en: "to know", sv: "veta", pl: "wiedzieć" },
        ],
      },
    ],
  },
  {
    theme: "Greetings & Phrases",
    lessons: [
      {
        title: "Greetings",
        words: [
          { en: "hello", sv: "hej", pl: "cześć" },
          { en: "goodbye", sv: "hej då", pl: "do widzenia" },
          { en: "yes", sv: "ja", pl: "tak" },
          { en: "no", sv: "nej", pl: "nie" },
          { en: "thank you", sv: "tack", pl: "dziękuję" },
          { en: "sorry", sv: "förlåt", pl: "przepraszam" },
        ],
      },
      {
        title: "Phrases",
        words: [
          { en: "good morning", sv: "god morgon", pl: "dzień dobry" },
          { en: "good night", sv: "god natt", pl: "dobranoc" },
          { en: "welcome", sv: "välkommen", pl: "witaj" },
          { en: "cheers", sv: "skål", pl: "na zdrowie" },
          { en: "how are you", sv: "hur mår du", pl: "jak się masz" },
          { en: "I love you", sv: "jag älskar dig", pl: "kocham cię" },
        ],
      },
    ],
  },
  {
    theme: "Numbers",
    lessons: [
      {
        title: "Numbers 1–6",
        words: [
          { en: "one", sv: "ett", pl: "jeden" },
          { en: "two", sv: "två", pl: "dwa" },
          { en: "three", sv: "tre", pl: "trzy" },
          { en: "four", sv: "fyra", pl: "cztery" },
          { en: "five", sv: "fem", pl: "pięć" },
          { en: "six", sv: "sex", pl: "sześć" },
        ],
      },
      {
        title: "Numbers 7–12",
        words: [
          { en: "seven", sv: "sju", pl: "siedem" },
          { en: "eight", sv: "åtta", pl: "osiem" },
          { en: "nine", sv: "nio", pl: "dziewięć" },
          { en: "ten", sv: "tio", pl: "dziesięć" },
          { en: "eleven", sv: "elva", pl: "jedenaście" },
          { en: "twelve", sv: "tolv", pl: "dwanaście" },
        ],
      },
    ],
  },
];

/** Build a directional course (e.g. Swedish → Polish) from the shared curriculum. */
const buildDirectionalCourse = (
  title: string,
  imageSrc: string,
  selectPrompt: (source: string) => string,
  source: (word: Vocab) => string,
  target: (word: Vocab) => string
): SeedCourse => ({
  title,
  imageSrc,
  selectPrompt,
  units: CURRICULUM.map((unit, unitIndex) => ({
    title: `Unit ${unitIndex + 1}`,
    description: unit.theme,
    lessons: unit.lessons.map((lesson) => ({
      title: lesson.title,
      items: lesson.words.map((word) => ({
        source: source(word),
        target: target(word),
      })),
    })),
  })),
});

/* -------------------------------------------------------------------------- */
/*  Courses                                                                     */
/* -------------------------------------------------------------------------- */

const SPANISH: SeedCourse = {
  title: "Spanish",
  imageSrc: "/es.svg",
  selectPrompt: (source) => `Which one of these is "${source}"?`,
  units: [
    {
      title: "Unit 1",
      description: "Basics",
      lessons: [
        {
          title: "People",
          items: [
            {
              source: "the man",
              target: "el hombre",
              image: "/man.svg",
              audio: "/es_man.mp3",
            },
            {
              source: "the woman",
              target: "la mujer",
              image: "/woman.svg",
              audio: "/es_woman.mp3",
            },
            {
              source: "the boy",
              target: "el chico",
              image: "/boy.svg",
              audio: "/es_boy.mp3",
            },
            {
              source: "the girl",
              target: "la niña",
              image: "/girl.svg",
              audio: "/es_girl.mp3",
            },
            {
              source: "the zombie",
              target: "el zombie",
              image: "/zombie.svg",
              audio: "/es_zombie.mp3",
            },
            {
              source: "the robot",
              target: "el robot",
              image: "/robot.svg",
              audio: "/es_robot.mp3",
            },
          ],
        },
        {
          title: "Characters",
          items: [
            {
              source: "the robot",
              target: "el robot",
              image: "/robot.svg",
              audio: "/es_robot.mp3",
            },
            {
              source: "the zombie",
              target: "el zombie",
              image: "/zombie.svg",
              audio: "/es_zombie.mp3",
            },
            {
              source: "the girl",
              target: "la niña",
              image: "/girl.svg",
              audio: "/es_girl.mp3",
            },
            {
              source: "the boy",
              target: "el chico",
              image: "/boy.svg",
              audio: "/es_boy.mp3",
            },
            {
              source: "the woman",
              target: "la mujer",
              image: "/woman.svg",
              audio: "/es_woman.mp3",
            },
            {
              source: "the man",
              target: "el hombre",
              image: "/man.svg",
              audio: "/es_man.mp3",
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Polish → Swedish is a dedicated, learning-focused course for Polish speakers
 * studying Swedish. Unlike a plain word list it teaches the things that actually
 * matter in Swedish: nouns carry their en/ett gender article, verbs are taught
 * as usable present-tense "jag ..." forms, and whole survival sentences appear
 * in context. Units are ordered survival-first.
 */
const pair = (source: string, target: string): Item => ({ source, target });

const POLISH_TO_SWEDISH: SeedCourse = {
  title: "Polish → Swedish",
  imageSrc: "/se.svg",
  selectPrompt: (source) => `Jak powiesz "${source}" po szwedzku?`,
  units: [
    {
      title: "Unit 1",
      description: "Podstawowe zwroty",
      lessons: [
        {
          title: "Powitania",
          tip: `Szwedzki ma trzy dodatkowe samogłoski: "å", "ä", "ö". Akcent zwykle pada na pierwszą sylabę. Powitanie "hej" wymawia się jak angielskie "hey".`,
          items: [
            pair("cześć", "hej"),
            pair("dzień dobry", "god dag"),
            pair("dobry wieczór", "god kväll"),
            pair("dobranoc", "god natt"),
            pair("do widzenia", "hej då"),
            pair("na razie", "vi ses"),
          ],
        },
        {
          title: "Grzeczność",
          items: [
            pair("tak", "ja"),
            pair("nie", "nej"),
            pair("dziękuję", "tack"),
            pair("proszę", "varsågod"),
            pair("przepraszam", "förlåt"),
            pair("nie ma za co", "ingen orsak"),
          ],
        },
      ],
    },
    {
      title: "Unit 2",
      description: "Poznajmy się",
      lessons: [
        {
          title: "Przedstawianie się",
          tip: `W szwedzkim czasownik stoi na drugim miejscu w zdaniu (szyk V2): "Jag heter Anna", "Jag kommer från Polen".`,
          items: [
            pair("Jak się nazywasz?", "Vad heter du?"),
            pair("Nazywam się Anna", "Jag heter Anna"),
            pair("Miło mi", "Trevligt att träffas"),
            pair("Jak się masz?", "Hur mår du?"),
            pair("Dobrze, dziękuję", "Bra, tack"),
            pair("Skąd jesteś?", "Varifrån kommer du?"),
          ],
        },
        {
          title: "Komunikacja",
          items: [
            pair("Czy mówisz po angielsku?", "Talar du engelska?"),
            pair("Nie rozumiem", "Jag förstår inte"),
            pair("Nie wiem", "Jag vet inte"),
            pair(
              "Mówię tylko trochę po szwedzku",
              "Jag talar bara lite svenska"
            ),
            pair("Czy możesz mówić wolniej?", "Kan du tala långsammare?"),
            pair("Co to znaczy?", "Vad betyder det?"),
          ],
        },
      ],
    },
    {
      title: "Unit 3",
      description: "Liczby",
      lessons: [
        {
          title: "Liczby 0–5",
          tip: `Liczba "jeden" to po szwedzku "ett". To samo słowo oznacza rodzaj nijaki rzeczownika; większość rzeczowników ma jednak rodzaj "en".`,
          items: [
            pair("zero", "noll"),
            pair("jeden", "ett"),
            pair("dwa", "två"),
            pair("trzy", "tre"),
            pair("cztery", "fyra"),
            pair("pięć", "fem"),
          ],
        },
        {
          title: "Liczby 6–20",
          items: [
            pair("sześć", "sex"),
            pair("siedem", "sju"),
            pair("osiem", "åtta"),
            pair("dziewięć", "nio"),
            pair("dziesięć", "tio"),
            pair("dwadzieścia", "tjugo"),
          ],
        },
      ],
    },
    {
      title: "Unit 4",
      description: "Ludzie i rodzina",
      lessons: [
        {
          title: "Ludzie",
          tip: `Szwedzkie rzeczowniki mają rodzaj "en" albo "ett". Nie ma prostej reguły — ucz się słowa razem z rodzajnikiem: "en man", "en kvinna", "ett barn".`,
          items: [
            pair("mężczyzna", "en man"),
            pair("kobieta", "en kvinna"),
            pair("chłopiec", "en pojke"),
            pair("dziewczyna", "en flicka"),
            pair("dziecko", "ett barn"),
            pair("przyjaciel", "en vän"),
          ],
        },
        {
          title: "Rodzina",
          items: [
            pair("mama", "en mamma"),
            pair("tata", "en pappa"),
            pair("siostra", "en syster"),
            pair("brat", "en bror"),
            pair("rodzina", "en familj"),
            pair("babcia", "en mormor"),
          ],
        },
      ],
    },
    {
      title: "Unit 5",
      description: "Jedzenie i picie",
      lessons: [
        {
          title: "Jedzenie",
          tip: `Rzeczowniki niepoliczalne zwykle nie mają rodzajnika: "vatten", "kaffe", "bröd". Policzalne mają rodzajnik: "ett äpple", "en fisk".`,
          items: [
            pair("chleb", "bröd"),
            pair("ser", "ost"),
            pair("jabłko", "ett äpple"),
            pair("ryba", "en fisk"),
            pair("mięso", "kött"),
            pair("jajko", "ett ägg"),
          ],
        },
        {
          title: "Picie",
          items: [
            pair("woda", "vatten"),
            pair("kawa", "kaffe"),
            pair("herbata", "te"),
            pair("mleko", "mjölk"),
            pair("piwo", "öl"),
            pair("wino", "vin"),
          ],
        },
      ],
    },
    {
      title: "Unit 6",
      description: "Czasowniki",
      lessons: [
        {
          title: "Podstawowe czasowniki",
          tip: `Szwedzki czasownik w czasie teraźniejszym ma jedną formę dla wszystkich osób: "jag äter", "du äter", "han äter". Pamiętaj o szyku V2.`,
          items: [
            pair("ja jestem", "jag är"),
            pair("ja mam", "jag har"),
            pair("ja chcę", "jag vill"),
            pair("ja mogę", "jag kan"),
            pair("ja wiem", "jag vet"),
            pair("ja rozumiem", "jag förstår"),
          ],
        },
        {
          title: "Czynności",
          items: [
            pair("ja jem", "jag äter"),
            pair("ja piję", "jag dricker"),
            pair("ja mówię", "jag pratar"),
            pair("ja idę", "jag går"),
            pair("ja mieszkam", "jag bor"),
            pair("ja pracuję", "jag jobbar"),
          ],
        },
      ],
    },
    {
      title: "Unit 7",
      description: "Przydatne zdania",
      lessons: [
        {
          title: "W mieście",
          tip: `W pytaniach czasownik stoi przed podmiotem: "Talar du engelska?", "Var ligger stationen?".`,
          items: [
            pair("Gdzie jest toaleta?", "Var är toaletten?"),
            pair("Ile to kosztuje?", "Hur mycket kostar det?"),
            pair("Gdzie jest dworzec?", "Var ligger stationen?"),
            pair("Szukam hotelu", "Jag letar efter ett hotell"),
            pair("Poproszę rachunek", "Kan jag få notan, tack"),
            pair("Pomocy!", "Hjälp!"),
          ],
        },
        {
          title: "Towarzysko",
          items: [
            pair("Na zdrowie!", "Skål!"),
            pair("Smacznego", "Smaklig måltid"),
            pair("Powodzenia", "Lycka till"),
            pair("Do zobaczenia jutro", "Vi ses imorgon"),
            pair("Kocham cię", "Jag älskar dig"),
            pair("Wszystkiego najlepszego", "Grattis"),
          ],
        },
      ],
    },
  ],
};

const COURSES: SeedCourse[] = [
  SPANISH,
  // Learner knows Swedish, learns Polish: prompts Swedish, answers Polish.
  buildDirectionalCourse(
    "Swedish → Polish",
    "/pl.svg",
    (source) => `Vilken av dessa är "${source}"?`,
    (word) => word.sv,
    (word) => word.pl
  ),
  // Learner knows Polish, learns Swedish — dedicated, gender + verbs + sentences.
  POLISH_TO_SWEDISH,
];

/* -------------------------------------------------------------------------- */
/*  Challenge generation                                                        */
/* -------------------------------------------------------------------------- */

type OptionSpec = {
  text: string;
  correct: boolean;
  image?: string;
  audio?: string;
};
type ChallengeSpec = {
  type: ChallengeType;
  order: number;
  question: string;
  options: OptionSpec[];
};

/**
 * For a lesson, optionally lead with a grammar TIP card, then build a SELECT
 * challenge for every item (pick the translation) plus an ASSIST challenge for
 * every other item. Distractors are the next two items in the same lesson, so
 * they stay on-theme. Lessons need >= 3 items.
 */
const buildLessonChallenges = (
  lesson: SeedLesson,
  selectPrompt: (source: string) => string
): ChallengeSpec[] => {
  const { items } = lesson;
  const challenges: ChallengeSpec[] = [];
  let order = 1;

  // A grammar tip, when present, is the first thing shown in the lesson.
  if (lesson.tip) {
    challenges.push({
      type: "TIP",
      order: order++,
      question: lesson.tip,
      options: [],
    });
  }

  const distractorsFor = (index: number) => [
    items[(index + 1) % items.length],
    items[(index + 2) % items.length],
  ];

  items.forEach((item, index) => {
    const [d1, d2] = distractorsFor(index);
    challenges.push({
      type: "SELECT",
      order: order++,
      question: selectPrompt(item.source),
      options: [
        {
          text: item.target,
          correct: true,
          image: item.image,
          audio: item.audio,
        },
        { text: d1.target, correct: false, image: d1.image, audio: d1.audio },
        { text: d2.target, correct: false, image: d2.image, audio: d2.audio },
      ],
    });
  });

  items.forEach((item, index) => {
    if (index % 2 !== 0) return; // every other item also gets a text-only prompt
    const [d1, d2] = distractorsFor(index);
    challenges.push({
      type: "ASSIST",
      order: order++,
      question: `"${item.source}"`,
      options: [
        { text: item.target, correct: true, audio: item.audio },
        { text: d1.target, correct: false, audio: d1.audio },
        { text: d2.target, correct: false, audio: d2.audio },
      ],
    });
  });

  return challenges;
};

const main = async () => {
  try {
    console.log("Seeding database");

    // Delete all existing data
    await Promise.all([
      db.delete(schema.userProgress),
      db.delete(schema.challenges),
      db.delete(schema.units),
      db.delete(schema.lessons),
      db.delete(schema.courses),
      db.delete(schema.challengeOptions),
      db.delete(schema.userSubscription),
    ]);

    for (const courseSeed of COURSES) {
      const [course] = await db
        .insert(schema.courses)
        .values({ title: courseSeed.title, imageSrc: courseSeed.imageSrc })
        .returning();

      for (let u = 0; u < courseSeed.units.length; u++) {
        const unitSeed = courseSeed.units[u];

        const [unit] = await db
          .insert(schema.units)
          .values({
            courseId: course.id,
            title: unitSeed.title,
            description: unitSeed.description,
            order: u + 1,
          })
          .returning();

        const lessons = await db
          .insert(schema.lessons)
          .values(
            unitSeed.lessons.map((lesson, index) => ({
              unitId: unit.id,
              title: lesson.title,
              order: index + 1,
            }))
          )
          .returning();

        for (let l = 0; l < lessons.length; l++) {
          const lesson = lessons[l];
          const specs = buildLessonChallenges(
            unitSeed.lessons[l],
            courseSeed.selectPrompt
          );

          const challenges = await db
            .insert(schema.challenges)
            .values(
              specs.map((spec) => ({
                lessonId: lesson.id,
                type: spec.type,
                question: spec.question,
                order: spec.order,
              }))
            )
            .returning();

          for (const challenge of challenges) {
            const spec = specs[challenge.order - 1];

            // TIP challenges have no options.
            if (spec.options.length === 0) continue;

            await db.insert(schema.challengeOptions).values(
              spec.options.map((option) => ({
                challengeId: challenge.id,
                correct: option.correct,
                text: option.text,
                imageSrc: option.image ?? null,
                audioSrc: option.audio ?? null,
              }))
            );
          }
        }
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database");
  }
};

void main();
