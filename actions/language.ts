"use server";

import { cookies } from "next/headers";

import { LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/locales";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persist the chosen app language in the `app_lang` cookie. Ignores unsupported
 * values so a bad client payload can never poison the cookie.
 */
export const setLocaleAction = async (locale: Locale) => {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
};
