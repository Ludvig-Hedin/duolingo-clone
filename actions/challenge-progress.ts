"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { MAX_HEARTS } from "@/constants";
import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";

// Spaced repetition: hours until a correctly-answered challenge is due again,
// indexed by its (capped) strength. Each correct answer grows the interval.
const REVIEW_INTERVALS_HOURS = [4, 24, 72, 168, 336, 720];

const nextReviewDate = (strength: number) => {
  const index = Math.min(strength, REVIEW_INTERVALS_HOURS.length) - 1;
  const hours = REVIEW_INTERVALS_HOURS[Math.max(index, 0)];
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

export const upsertChallengeProgress = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) throw new Error("User progress not found.");

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) throw new Error("Challenge not found.");

  // Grammar tips are not scored, so they never consume a heart.
  const isTip = challenge.type === "TIP";

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (
    !isTip &&
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  )
    return { error: "hearts" };

  if (isPractice) {
    const strength = isTip
      ? existingChallengeProgress.strength
      : Math.min(
          existingChallengeProgress.strength + 1,
          REVIEW_INTERVALS_HOURS.length
        );

    await db
      .update(challengeProgress)
      .set({
        completed: true,
        strength,
        nextReviewAt: isTip ? null : nextReviewDate(strength),
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, userId));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/practice");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
    strength: isTip ? 0 : 1,
    nextReviewAt: isTip ? null : nextReviewDate(1),
  });

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/practice");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
