import type { Dictionary } from "./en";

/**
 * Swedish dictionary. Typed as `Dictionary` so the type-check enforces parity
 * with the English source. Native review recommended before marketing use.
 */
export const sv: Dictionary = {
  nav: {
    learn: "Lär dig",
    leaderboard: "Topplista",
    quests: "Uppdrag",
    shop: "Butik",
  },
  common: {
    somethingWrong: "Något gick fel.",
  },
  marketing: {
    hero: "Lär dig, öva och bemästra nya språk med Lingo.",
    continueLearning: "Fortsätt lära dig",
    getStarted: "Kom igång",
    haveAccount: "Jag har redan ett konto",
    login: "Logga in",
  },
  footer: {
    croatian: "Kroatiska",
    spanish: "Spanska",
    french: "Franska",
    italian: "Italienska",
    japanese: "Japanska",
  },
  courses: {
    title: "Språkkurser",
  },
  leaderboard: {
    title: "Topplista",
    subtitle: "Se var du står bland andra som lär sig i gemenskapen.",
  },
  quests: {
    title: "Uppdrag",
    subtitle: "Slutför uppdrag genom att tjäna poäng.",
    viewAll: "Visa alla",
  },
  shop: {
    title: "Butik",
    subtitle: "Spendera dina poäng på coola saker.",
    refillHearts: "Fyll på hjärtan",
    full: "fullt",
    unlimitedHearts: "Obegränsade hjärtan",
    settings: "inställningar",
    upgrade: "uppgradera",
    redirecting: "Omdirigerar till kassan...",
  },
  promo: {
    title: "Uppgradera till Pro",
    description: "Få obegränsade hjärtan och mer!",
    cta: "Uppgradera idag",
  },
  unit: {
    continue: "Fortsätt",
  },
  learn: {
    start: "Starta",
  },
  lesson: {
    nicelyDone: "Bra jobbat!",
    tryAgain: "Försök igen.",
    practiceAgain: "Öva igen",
    check: "Kontrollera",
    next: "Nästa",
    retry: "Försök igen",
    continue: "Fortsätt",
    greatJob: "Bra jobbat!",
    lessonComplete: "Du har slutfört lektionen.",
    selectMeaning: "Välj rätt betydelse",
    somethingWrongRetry: "Något gick fel. Försök igen.",
    totalXp: "Total XP",
    heartsLeft: "Hjärtan kvar",
    grammarTip: "Grammatiktips",
  },
  modals: {
    exit: {
      title: "Vänta, gå inte!",
      description: "Du är på väg att lämna lektionen. Är du säker?",
      keepLearning: "Fortsätt lära dig",
      endSession: "Avsluta passet",
    },
    hearts: {
      title: "Du har slut på hjärtan!",
      description: "Skaffa Pro för obegränsade hjärtan, eller köp dem i butiken.",
      getUnlimited: "Skaffa obegränsade hjärtan",
      noThanks: "Nej tack",
    },
    practice: {
      title: "Övningslektion",
      description:
        "Använd övningslektioner för att återfå hjärtan och poäng. Du kan inte förlora hjärtan eller poäng i övningslektioner.",
      understand: "Jag förstår",
    },
  },
  onboarding: {
    title: "Välj ditt språk",
    subtitle: "Vilket språk ska Lingo använda? Du kan ändra detta när som helst.",
    continue: "Fortsätt",
  },
  language: {
    label: "Språk",
  },
};

export default sv;
