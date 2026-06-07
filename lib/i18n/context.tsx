"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { setLocaleAction } from "@/actions/language";

import { dictionaries, type Dictionary } from "./dictionaries";
import { LOCALE_COOKIE, type Locale } from "./locales";

type I18nContextValue = {
  locale: Locale;
  /** The active dictionary, accessed as `t.section.key`. */
  t: Dictionary;
  /** Change language in place (used by the sidebar switcher). */
  setLocale: (next: Locale) => void;
  /**
   * Persist a language on the server and resolve once done, so the caller can
   * safely navigate afterwards (used by onboarding before redirecting to a
   * cookie-guarded route).
   */
  persistLocale: (next: Locale) => Promise<void>;
  isPending: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** Instant client-side update: chrome language + cookie for the next request. */
const writeClientLocale = (next: Locale) => {
  if (typeof document === "undefined") return;

  document.documentElement.lang = next;
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
};

type I18nProviderProps = {
  /** Server-resolved locale, so the first client render matches SSR. */
  locale: Locale;
  children: ReactNode;
};

export const I18nProvider = ({ locale: initialLocale, children }: I18nProviderProps) => {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;

      // Optimistic: switch chrome and set the cookie immediately.
      setLocaleState(next);
      writeClientLocale(next);

      // Persist authoritatively and re-render server-rendered text.
      startTransition(async () => {
        await setLocaleAction(next);
        router.refresh();
      });
    },
    [locale, router]
  );

  const persistLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    writeClientLocale(next);
    await setLocaleAction(next);
  }, []);

  return (
    <I18nContext.Provider
      value={{ locale, t: dictionaries[locale], setLocale, persistLocale, isPending }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (!context)
    throw new Error("useTranslation must be used within an I18nProvider.");

  return context;
};
