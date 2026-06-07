import type { Dictionary } from "./en";

/**
 * Polish dictionary. Typed as `Dictionary` so the type-check enforces parity
 * with the English source. Native review recommended before marketing use.
 */
export const pl: Dictionary = {
  nav: {
    learn: "Nauka",
    leaderboard: "Ranking",
    quests: "Zadania",
    shop: "Sklep",
  },
  common: {
    somethingWrong: "Coś poszło nie tak.",
  },
  marketing: {
    hero: "Ucz się, ćwicz i opanuj nowe języki z Lingo.",
    continueLearning: "Kontynuuj naukę",
    getStarted: "Rozpocznij",
    haveAccount: "Mam już konto",
    login: "Zaloguj się",
  },
  footer: {
    croatian: "Chorwacki",
    spanish: "Hiszpański",
    french: "Francuski",
    italian: "Włoski",
    japanese: "Japoński",
  },
  courses: {
    title: "Kursy językowe",
  },
  leaderboard: {
    title: "Ranking",
    subtitle: "Zobacz, jak wypadasz na tle innych uczących się w społeczności.",
  },
  quests: {
    title: "Zadania",
    subtitle: "Wykonuj zadania, zdobywając punkty.",
    viewAll: "Zobacz wszystkie",
  },
  shop: {
    title: "Sklep",
    subtitle: "Wydawaj punkty na fajne rzeczy.",
    refillHearts: "Uzupełnij serca",
    full: "pełne",
    unlimitedHearts: "Nieograniczone serca",
    settings: "ustawienia",
    upgrade: "ulepsz",
    redirecting: "Przekierowywanie do kasy...",
  },
  promo: {
    title: "Przejdź na Pro",
    description: "Zdobądź nieograniczone serca i więcej!",
    cta: "Ulepsz dzisiaj",
  },
  unit: {
    continue: "Kontynuuj",
  },
  learn: {
    start: "Start",
  },
  lesson: {
    nicelyDone: "Dobra robota!",
    tryAgain: "Spróbuj ponownie.",
    practiceAgain: "Ćwicz ponownie",
    check: "Sprawdź",
    next: "Dalej",
    retry: "Ponów",
    continue: "Kontynuuj",
    greatJob: "Świetna robota!",
    lessonComplete: "Ukończyłeś lekcję.",
    selectMeaning: "Wybierz poprawne znaczenie",
    somethingWrongRetry: "Coś poszło nie tak. Spróbuj ponownie.",
    totalXp: "Łączne XP",
    heartsLeft: "Pozostałe serca",
    grammarTip: "Wskazówka",
    matchPairs: "Połącz pary",
    buildSentence: "Ułóż tłumaczenie",
    typePlaceholder: "Wpisz odpowiedź…",
  },
  modals: {
    exit: {
      title: "Zaczekaj, nie odchodź!",
      description: "Zamierzasz opuścić lekcję. Czy na pewno?",
      keepLearning: "Kontynuuj naukę",
      endSession: "Zakończ sesję",
    },
    hearts: {
      title: "Skończyły ci się serca!",
      description:
        "Zdobądź Pro, aby mieć nieograniczone serca, lub kup je w sklepie.",
      getUnlimited: "Zdobądź nieograniczone serca",
      noThanks: "Nie, dziękuję",
    },
    practice: {
      title: "Lekcja ćwiczeniowa",
      description:
        "Używaj lekcji ćwiczeniowych, aby odzyskać serca i punkty. Podczas lekcji ćwiczeniowych nie tracisz serc ani punktów.",
      understand: "Rozumiem",
    },
  },
  onboarding: {
    title: "Wybierz swój język",
    subtitle:
      "Jakiego języka ma używać Lingo? Możesz to zmienić w dowolnej chwili.",
    continue: "Kontynuuj",
  },
  language: {
    label: "Język",
  },
};

export default pl;
