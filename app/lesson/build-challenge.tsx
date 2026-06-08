"use client";

import { useState } from "react";

import { challengeOptions } from "@/db/schema";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

import { Footer } from "./footer";

type BuildChallengeProps = {
  question: string;
  options: (typeof challengeOptions.$inferSelect)[];
  onCorrect: () => void;
  onWrong: () => void;
  disabled?: boolean;
};

type Token = { id: number; word: string; order: number };

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Word-bank exercise. Options encode "position|word"; position 0 = decoy.
export const BuildChallenge = ({
  question,
  options,
  onCorrect,
  onWrong,
  disabled,
}: BuildChallengeProps) => {
  const { t } = useTranslation();

  const [tokens] = useState<Token[]>(() =>
    options.map((o) => {
      const [order, word] = o.text.split("|");
      return { id: o.id, word, order: Number(order) };
    })
  );
  // TODO(bug-hunt): shuffle() uses Math.random() in a useState initializer — same
  // hydration-mismatch edge as MatchChallenge if this challenge is server-rendered
  // first (mid-lesson reload). Fix: shuffle in a useEffect after mount.
  const [bankOrder] = useState(() => shuffle(tokens.map((token) => token.id)));
  const [picked, setPicked] = useState<number[]>([]);
  const [status, setStatus] = useState<"none" | "wrong">("none");

  const target = tokens
    .filter((token) => token.order > 0)
    .sort((a, b) => a.order - b.order)
    .map((token) => token.word)
    .join(" ");

  const wordOf = (id: number) => tokens.find((token) => token.id === id)!.word;

  const pick = (id: number) => {
    if (disabled || picked.includes(id)) return;
    setPicked((prev) => [...prev, id]);
    setStatus("none");
  };

  const unpick = (id: number) => {
    if (disabled) return;
    setPicked((prev) => prev.filter((pickedId) => pickedId !== id));
    setStatus("none");
  };

  const check = () => {
    if (!picked.length || disabled) return;
    const answer = picked.map(wordOf).join(" ");
    if (answer === target) {
      onCorrect();
    } else {
      setStatus("wrong");
      onWrong();
    }
  };

  return (
    <>
      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-8 px-6 lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-2xl">
              {question}
            </h1>

            {/* Answer row */}
            <div
              className={cn(
                "flex min-h-[56px] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-3",
                status === "wrong" && "border-rose-300 bg-rose-50"
              )}
            >
              {picked.map((id) => (
                <button
                  key={id}
                  onClick={() => unpick(id)}
                  disabled={disabled}
                  className="rounded-lg border-2 border-b-4 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 active:border-b-2"
                >
                  {wordOf(id)}
                </button>
              ))}
            </div>

            {/* Word bank */}
            <div className="flex flex-wrap gap-2">
              {bankOrder.map((id) => {
                const used = picked.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => pick(id)}
                    disabled={disabled || used}
                    className={cn(
                      "rounded-lg border-2 border-b-4 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-black/5 active:border-b-2",
                      used && "border-neutral-100 text-transparent"
                    )}
                  >
                    {wordOf(id)}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-neutral-400">
              {t.lesson.buildSentence}
            </span>
          </div>
        </div>
      </div>

      <Footer
        status={status}
        onCheck={check}
        disabled={disabled || !picked.length}
      />
    </>
  );
};
