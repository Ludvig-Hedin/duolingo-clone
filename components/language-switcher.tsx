"use client";

import { Languages } from "lucide-react";

import { useTranslation } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
};

/**
 * Compact app-language picker. A native `<select>` keeps it fully accessible
 * (keyboard, click-outside, screen readers) with zero extra dependencies.
 */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { locale, setLocale, t, isPending } = useTranslation();

  return (
    <div className={cn("relative flex items-center", className)}>
      <Languages className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-500" />

      <select
        aria-label={t.language.label}
        value={locale}
        disabled={isPending}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="h-10 w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-neutral-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {LOCALE_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
};
