import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCourses, getUserProgress } from "@/db/queries";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";
import { getServerDictionary } from "@/lib/i18n/server";

import { List } from "./list";

const CoursesPage = async () => {
  // First-run gate: send users through the language step before choosing a
  // course. Self-clears once a language has been picked (cookie set).
  const cookieStore = await cookies();
  if (!isLocale(cookieStore.get(LOCALE_COOKIE)?.value)) redirect("/onboarding");

  const t = await getServerDictionary();
  const coursesData = getCourses();
  const userProgressData = getUserProgress();

  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ]);

  return (
    <div className="mx-auto h-full max-w-[912px] px-3">
      <h1 className="text-2xl font-bold text-neutral-700">{t.courses.title}</h1>

      <List courses={courses} activeCourseId={userProgress?.activeCourseId} />
    </div>
  );
};

export default CoursesPage;
