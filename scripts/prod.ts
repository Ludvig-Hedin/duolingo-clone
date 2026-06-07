import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, { schema });

/**
 * A single vocabulary entry.
 *
 * - `image`   shared, language-neutral illustration (e.g. /man.svg)
 * - `source`  the word shown in the question, in the language the learner
 *             already knows (the "from" language of the course)
 * - `target`  the correct answer, in the language being learned (the "to"
 *             language of the course)
 * - `audio`   optional pronunciation of the target word (omitted when no
 *             audio asset exists for that language)
 */
type Word = {
  image: string;
  source: string;
  target: string;
  audio?: string;
};

type CourseSeed = {
  title: string;
  imageSrc: string;
  /** Wraps a source word into a "pick the translation" prompt, in the source language. */
  selectPrompt: (source: string) => string;
  /** Exactly six words: man, woman, boy, girl, zombie, robot (in this order). */
  words: [Word, Word, Word, Word, Word, Word];
};

/**
 * Challenge templates shared by every course. Indices map into a course's
 * `words` array (0 man, 1 woman, 2 boy, 3 girl, 4 zombie, 5 robot). This
 * reproduces the original 8-challenge lesson layout for all courses.
 */
const CHALLENGE_TEMPLATES: {
  type: (typeof schema.challengesEnum.enumValues)[number];
  word: number;
  distractors: [number, number];
}[] = [
  { type: "SELECT", word: 0, distractors: [1, 2] },
  { type: "SELECT", word: 1, distractors: [2, 0] },
  { type: "SELECT", word: 2, distractors: [1, 0] },
  { type: "ASSIST", word: 0, distractors: [1, 2] },
  { type: "SELECT", word: 4, distractors: [0, 1] },
  { type: "SELECT", word: 5, distractors: [4, 2] },
  { type: "SELECT", word: 3, distractors: [4, 0] },
  { type: "ASSIST", word: 4, distractors: [1, 2] },
];

const UNITS = [
  { title: "Unit 1", suffix: "Learn the basics of" },
  { title: "Unit 2", suffix: "Learn intermediate" },
] as const;

const LESSON_TITLES = [
  "Nouns",
  "Verbs",
  "Adjectives",
  "Phrases",
  "Sentences",
] as const;

const COURSES: CourseSeed[] = [
  {
    title: "Spanish",
    imageSrc: "/es.svg",
    selectPrompt: (source) => `Which one of these is "${source}"?`,
    words: [
      {
        image: "/man.svg",
        source: "the man",
        target: "el hombre",
        audio: "/es_man.mp3",
      },
      {
        image: "/woman.svg",
        source: "the woman",
        target: "la mujer",
        audio: "/es_woman.mp3",
      },
      {
        image: "/boy.svg",
        source: "the boy",
        target: "el chico",
        audio: "/es_boy.mp3",
      },
      {
        image: "/girl.svg",
        source: "the girl",
        target: "la niña",
        audio: "/es_girl.mp3",
      },
      {
        image: "/zombie.svg",
        source: "the zombie",
        target: "el zombie",
        audio: "/es_zombie.mp3",
      },
      {
        image: "/robot.svg",
        source: "the robot",
        target: "el robot",
        audio: "/es_robot.mp3",
      },
    ],
  },
  {
    // Learner knows Swedish, is learning Polish. Prompts are Swedish, answers Polish.
    title: "Swedish → Polish",
    imageSrc: "/pl.svg",
    selectPrompt: (source) => `Vilken av dessa är "${source}"?`,
    words: [
      { image: "/man.svg", source: "mannen", target: "mężczyzna" },
      { image: "/woman.svg", source: "kvinnan", target: "kobieta" },
      { image: "/boy.svg", source: "pojken", target: "chłopiec" },
      { image: "/girl.svg", source: "flickan", target: "dziewczynka" },
      { image: "/zombie.svg", source: "zombien", target: "zombie" },
      { image: "/robot.svg", source: "roboten", target: "robot" },
    ],
  },
  {
    // Learner knows Polish, is learning Swedish. Prompts are Polish, answers Swedish.
    title: "Polish → Swedish",
    imageSrc: "/se.svg",
    selectPrompt: (source) => `Który z nich to "${source}"?`,
    words: [
      { image: "/man.svg", source: "mężczyzna", target: "mannen" },
      { image: "/woman.svg", source: "kobieta", target: "kvinnan" },
      { image: "/boy.svg", source: "chłopiec", target: "pojken" },
      { image: "/girl.svg", source: "dziewczynka", target: "flickan" },
      { image: "/zombie.svg", source: "zombie", target: "zombien" },
      { image: "/robot.svg", source: "robot", target: "roboten" },
    ],
  },
];

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

      const units = await db
        .insert(schema.units)
        .values(
          UNITS.map((unit, index) => ({
            courseId: course.id,
            title: unit.title,
            description: `${unit.suffix} ${courseSeed.title}`,
            order: index + 1,
          }))
        )
        .returning();

      for (const unit of units) {
        const lessons = await db
          .insert(schema.lessons)
          .values(
            LESSON_TITLES.map((title, index) => ({
              unitId: unit.id,
              title,
              order: index + 1,
            }))
          )
          .returning();

        for (const lesson of lessons) {
          const challenges = await db
            .insert(schema.challenges)
            .values(
              CHALLENGE_TEMPLATES.map((template, index) => {
                const word = courseSeed.words[template.word];

                return {
                  lessonId: lesson.id,
                  type: template.type,
                  question:
                    template.type === "ASSIST"
                      ? `"${word.source}"`
                      : courseSeed.selectPrompt(word.source),
                  order: index + 1,
                };
              })
            )
            .returning();

          for (const challenge of challenges) {
            // Match by stored order rather than array position, so the option
            // mapping never depends on INSERT ... RETURNING row ordering.
            const template = CHALLENGE_TEMPLATES[challenge.order - 1];
            const isSelect = template.type === "SELECT";

            // Correct option first, then the two distractors.
            const optionWords = [
              courseSeed.words[template.word],
              courseSeed.words[template.distractors[0]],
              courseSeed.words[template.distractors[1]],
            ];

            await db.insert(schema.challengeOptions).values(
              optionWords.map((word, index) => ({
                challengeId: challenge.id,
                correct: index === 0,
                text: word.target,
                // ASSIST challenges are text-only (no illustration).
                imageSrc: isSelect ? word.image : null,
                audioSrc: word.audio ?? null,
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
