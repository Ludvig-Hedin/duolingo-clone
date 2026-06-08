import { redirect } from "next/navigation";

import {
  getPracticeChallenges,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";

import { Quiz } from "../lesson/quiz";

// Spaced-repetition review session. Runs the due challenges through the same
// <Quiz> in practice mode (initialPercentage = 100): correct answers refund a
// heart and push the review further out, mistakes don't penalize.
const PracticePage = async () => {
  const [challenges, userProgress, userSubscription] = await Promise.all([
    getPracticeChallenges(),
    getUserProgress(),
    getUserSubscription(),
  ]);

  if (!challenges || !userProgress) return redirect("/learn");

  return (
    <Quiz
      initialLessonId={challenges[0].lessonId}
      initialLessonChallenges={challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={100}
      userSubscription={userSubscription}
    />
  );
};

export default PracticePage;
