/**
 * English dictionary. This is the source of truth for the dictionary shape:
 * `sv` and `pl` are typed as `Dictionary`, so missing or extra keys fail the
 * type-check. When adding a new string, add it here first.
 */
export const en = {
  nav: {
    learn: "Learn",
    leaderboard: "Leaderboard",
    quests: "Quests",
    shop: "Shop",
  },
  common: {
    somethingWrong: "Something went wrong.",
  },
  marketing: {
    hero: "Learn, practice and master new languages with Lingo.",
    continueLearning: "Continue Learning",
    getStarted: "Get Started",
    haveAccount: "I already have an account",
    login: "Login",
  },
  footer: {
    croatian: "Croatian",
    spanish: "Spanish",
    french: "French",
    italian: "Italian",
    japanese: "Japanese",
  },
  courses: {
    title: "Language Courses",
  },
  leaderboard: {
    title: "Leaderboard",
    subtitle: "See where you stand among other learners in the community.",
  },
  quests: {
    title: "Quests",
    subtitle: "Complete quests by earning points.",
    viewAll: "View all",
  },
  shop: {
    title: "Shop",
    subtitle: "Spend your points on cool stuff.",
    refillHearts: "Refill hearts",
    full: "full",
    unlimitedHearts: "Unlimited hearts",
    settings: "settings",
    upgrade: "upgrade",
    redirecting: "Redirecting to checkout...",
  },
  promo: {
    title: "Upgrade to Pro",
    description: "Get unlimited hearts and more!",
    cta: "Upgrade today",
  },
  unit: {
    continue: "Continue",
  },
  learn: {
    start: "Start",
  },
  lesson: {
    nicelyDone: "Nicely done!",
    tryAgain: "Try again.",
    practiceAgain: "Practice again",
    check: "Check",
    next: "Next",
    retry: "Retry",
    continue: "Continue",
    greatJob: "Great job!",
    lessonComplete: "You've completed the lesson.",
    selectMeaning: "Select the correct meaning",
    somethingWrongRetry: "Something went wrong. Please try again.",
    totalXp: "Total XP",
    heartsLeft: "Hearts left",
  },
  modals: {
    exit: {
      title: "Wait, don't go!",
      description: "You're about to leave the lesson. Are you sure?",
      keepLearning: "Keep learning",
      endSession: "End session",
    },
    hearts: {
      title: "You ran out of hearts!",
      description: "Get Pro for unlimited hearts, or purchase them in the store.",
      getUnlimited: "Get unlimited hearts",
      noThanks: "No thanks",
    },
    practice: {
      title: "Practice lesson",
      description:
        "Use practice lessons to regain hearts and points. You cannot lose hearts or points in practice lessons.",
      understand: "I understand",
    },
  },
  onboarding: {
    title: "Choose your language",
    subtitle: "Which language should Lingo use? You can change this anytime.",
    continue: "Continue",
  },
  language: {
    label: "Language",
  },
};

export type Dictionary = typeof en;

export default en;
