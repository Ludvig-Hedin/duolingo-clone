import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LanguageOnboarding } from "@/components/language-onboarding";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";
import { getCurrentLocale } from "@/lib/i18n/server";

/**
 * First-run app-language step. Self-skips once a language has been chosen, so
 * it only ever appears once. Reached from course selection (see
 * `app/(main)/courses/page.tsx`).
 */
const OnboardingPage = async () => {
  const cookieStore = await cookies();

  if (isLocale(cookieStore.get(LOCALE_COOKIE)?.value)) redirect("/courses");

  const initialLocale = await getCurrentLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <LanguageOnboarding initialLocale={initialLocale} />
    </div>
  );
};

export default OnboardingPage;
