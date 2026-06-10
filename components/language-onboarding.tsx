"use client";

import { useEffect, useState, useTransition } from "react";

import { Globe } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { dictionaries } from "@/lib/i18n/dictionaries";
import {
  LOCALES,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  resolveLocale,
  type Locale,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type LanguageOnboardingProps = {
  /** Server-resolved default (from the Accept-Language header). */
  initialLocale: Locale;
};

/**
 * First-run language step. Pre-selects the device language, lets the user
 * confirm or change it, persists the choice, then continues to course
 * selection.
 */
export const LanguageOnboarding = ({
  initialLocale,
}: LanguageOnboardingProps) => {
  const router = useRouter();
  const { t, persistLocale } = useTranslation();
  const [selected, setSelected] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  // Refine the pre-selection using the actual device language, which is more
  // accurate than the server's Accept-Language guess. Runs once on mount.
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      setSelected(resolveLocale(navigator.language));
    }
  }, []);

  const onContinue = () => {
    // Persist on the server before navigating to the cookie-guarded /courses.
    // The client cookie is written synchronously inside persistLocale, so the
    // guard passes regardless; navigate even if the server write rejects so the
    // user can never get stranded on this screen.
    startTransition(async () => {
      try {
        await persistLocale(selected);
      } finally {
        router.push("/courses");
      }
    });
  };

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center gap-y-8 px-4">
      <div className="flex flex-col items-center gap-y-3 text-center">
        <Image src="/mascot.svg" alt="Mascot" height={80} width={80} priority />

        <h1 className="text-2xl font-bold text-neutral-700">
          {t.onboarding.title}
        </h1>

        <p className="text-balance text-muted-foreground">
          {t.onboarding.subtitle}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-3">
        {LOCALES.map((option) => {
          const flag = LOCALE_FLAGS[option];
          const isActive = selected === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(option)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-x-4 rounded-xl border-2 border-b-[4px] p-4 text-left transition hover:bg-black/5 active:translate-y-[2px]",
                isActive
                  ? "border-green-300 bg-green-100 hover:bg-green-100"
                  : "border-slate-200"
              )}
            >
              <div className="relative h-[34px] w-[46px] shrink-0 overflow-hidden rounded-md border">
                {flag ? (
                  <Image
                    src={flag}
                    alt={LOCALE_LABELS[option]}
                    fill
                    sizes="46px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white">
                    <Globe className="h-5 w-5 text-green-600" />
                  </span>
                )}
              </div>

              <p
                className={cn(
                  "font-bold text-neutral-700",
                  isActive && "text-green-700"
                )}
              >
                {LOCALE_LABELS[option]}
              </p>
            </button>
          );
        })}
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={onContinue}
        disabled={isPending}
        aria-disabled={isPending}
      >
        {dictionaries[selected].onboarding.continue}
      </Button>
    </div>
  );
};
