import { cookies, headers } from "next/headers";

import {
  getDictionary,
  type Dictionary,
} from "./dictionaries";
import {
  LOCALE_COOKIE,
  isLocale,
  resolveAcceptLanguage,
  type Locale,
} from "./locales";

/**
 * Resolve the active locale on the server.
 *
 * Order of precedence:
 *   1. The `app_lang` cookie (an explicit user choice).
 *   2. The request's `Accept-Language` header (the device/browser default).
 *
 * Reading cookies/headers opts routes into dynamic rendering, which is already
 * the case across this auth-gated app.
 */
export const getCurrentLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;

  if (isLocale(cookieValue)) return cookieValue;

  const acceptLanguage = (await headers()).get("accept-language");

  return resolveAcceptLanguage(acceptLanguage);
};

export const getServerDictionary = async (): Promise<Dictionary> =>
  getDictionary(await getCurrentLocale());
