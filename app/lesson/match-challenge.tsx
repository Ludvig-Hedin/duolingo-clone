"use client";

import { useState } from "react";

import { challengeOptions } from "@/db/schema";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type MatchChallengeProps = {
  options: (typeof challengeOptions.$inferSelect)[];
  onComplete: () => void;
  disabled?: boolean;
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Tap-to-pair exercise. Each option encodes one pair as "source=target".
export const MatchChallenge = ({
  options,
  onComplete,
  disabled,
}: MatchChallengeProps) => {
  const { t } = useTranslation();

  // pair index -> { left, right }
  const [pairs] = useState(() =>
    options.map((o) => {
      const [left, right] = o.text.split("=");
      return { left, right };
    })
  );
  // TODO(bug-hunt): shuffle() uses Math.random() in a useState initializer. If
  // this challenge is the first one server-rendered (mid-lesson reload), the
  // server/client tile order differs → React hydration warning + brief flash.
  // Advancing client-side (the common path) is unaffected. Fix: shuffle in a
  // useEffect after mount, or gate behind a mounted flag.
  const [leftOrder] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [rightOrder] = useState(() => shuffle(pairs.map((_, i) => i)));

  const [matched, setMatched] = useState<number[]>([]);
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [selRight, setSelRight] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);

  const isMatched = (key: number) => matched.includes(key);

  const tryResolve = (left: number | null, right: number | null) => {
    if (left === null || right === null) return;

    if (left === right) {
      const next = [...matched, left];
      setMatched(next);
      setSelLeft(null);
      setSelRight(null);
      if (next.length === pairs.length) onComplete();
    } else {
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setSelLeft(null);
        setSelRight(null);
      }, 600);
    }
  };

  const onLeft = (key: number) => {
    if (disabled || wrong || isMatched(key)) return;
    setSelLeft(key);
    tryResolve(key, selRight);
  };

  const onRight = (key: number) => {
    if (disabled || wrong || isMatched(key)) return;
    setSelRight(key);
    tryResolve(selLeft, key);
  };

  const tile = (
    key: number,
    text: string,
    selected: boolean,
    onClick: () => void
  ) => (
    <button
      key={key}
      onClick={onClick}
      disabled={disabled || isMatched(key)}
      className={cn(
        "rounded-xl border-2 border-b-4 p-3 text-sm font-semibold text-neutral-700 transition active:border-b-2 lg:p-4 lg:text-base",
        isMatched(key) &&
          "border-green-300 bg-green-100 text-green-600 opacity-60",
        !isMatched(key) && "hover:bg-black/5",
        selected && !wrong && "border-sky-300 bg-sky-100 text-sky-600",
        selected && wrong && "border-rose-300 bg-rose-100 text-rose-600"
      )}
    >
      {text}
    </button>
  );

  return (
    <div className="flex-1">
      <div className="flex h-full items-center justify-center">
        <div className="w-full lg:w-[600px]">
          <h1 className="mb-6 text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-2xl">
            {t.lesson.matchPairs}
          </h1>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="flex flex-col gap-y-3">
              {leftOrder.map((key) =>
                tile(key, pairs[key].left, selLeft === key, () => onLeft(key))
              )}
            </div>
            <div className="flex flex-col gap-y-3">
              {rightOrder.map((key) =>
                tile(key, pairs[key].right, selRight === key, () =>
                  onRight(key)
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
