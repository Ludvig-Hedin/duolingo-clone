/**
 * Supported app (UI) languages and helpers for resolving a user's locale.
 *
 * The active locale is stored in the `app_lang` cookie so it is available to
 * both server components (SSR `<html lang>`, server-rendered text) and client
 * components (the i18n context). There is intentionally no database column:
 * the cookie is the single source of truth, which keeps the backend simple and
 * avoids any schema migration on the live database. Cross-device sync can be
 * layered on later via a `userProgress.appLanguage` column.
 */

export const LOCALES = ["en", "sv", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "app_lang";

/** Native display names, shown in the onboarding picker and the switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  sv: "Svenska",
  pl: "Polski",
};

/** Flag asset per locale (falls back to a globe icon if ever null). */
export const LOCALE_FLAGS: Record<Locale, string | null> = {
  en: "/gb.svg",
  sv: "/se.svg",
  pl: "/pl.svg",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Map any BCP-47 tag (e.g. "sv-SE", "pl", "en-US") to a supported locale. */
export const resolveLocale = (value?: string | null): Locale => {
  if (!value) return DEFAULT_LOCALE;

  const primary = value.trim().toLowerCase().split("-")[0];

  return isLocale(primary) ? primary : DEFAULT_LOCALE;
};

/**
 * Pick the best supported locale from an `Accept-Language` header, honouring
 * quality (`;q=`) ordering. Falls back to the default locale.
 */
export const resolveAcceptLanguage = (header?: string | null): Locale => {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");

      return {
        primary: tag.trim().toLowerCase().split("-")[0],
        quality: quality ? Number(quality) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { primary } of ranked) {
    if (isLocale(primary)) return primary;
  }

  return DEFAULT_LOCALE;
};
