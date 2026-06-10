import type { Locale } from "./locales";

/**
 * Localized display names for the seeded courses, keyed by their canonical
 * (English) DB title. The course rows in the database stay English; only the
 * presentation is translated. Falls back to the DB title if a key is missing.
 */
export const COURSE_TITLES: Record<Locale, Record<string, string>> = {
  en: {
    Spanish: "Spanish",
    "Swedish → Polish": "Swedish → Polish",
    "Polish → Swedish": "Polish → Swedish",
    "Polish → English": "Polish → English",
    "Swedish → English": "Swedish → English",
  },
  sv: {
    Spanish: "Spanska",
    "Swedish → Polish": "Svenska → Polska",
    "Polish → Swedish": "Polska → Svenska",
    "Polish → English": "Polska → Engelska",
    "Swedish → English": "Svenska → Engelska",
  },
  pl: {
    Spanish: "Hiszpański",
    "Swedish → Polish": "Szwedzki → Polski",
    "Polish → Swedish": "Polski → Szwedzki",
    "Polish → English": "Polski → Angielski",
    "Swedish → English": "Szwedzki → Angielski",
  },
};

export const localizeCourseTitle = (locale: Locale, title: string): string =>
  COURSE_TITLES[locale]?.[title] ?? title;
