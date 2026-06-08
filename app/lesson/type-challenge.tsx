"use client";

import { useState } from "react";

import { Footer } from "./footer";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type TypeChallengeProps = {
  question: string;
  answer: string;
  onCorrect: () => void;
  onWrong: () => void;
  disabled?: boolean;
};

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.]+$/g, "");

// Diacritic-folded form, so a beginner who types "forlat" still passes "förlåt".
const fold = (value: string) =>
  normalize(value).replace(/[åä]/g, "a").replace(/ö/g, "o");

export const TypeChallenge = ({
  question,
  answer,
  onCorrect,
  onWrong,
  disabled,
}: TypeChallengeProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"none" | "wrong">("none");

  const check = () => {
    if (!value.trim() || disabled) return;

    const ok =
      normalize(value) === normalize(answer) || fold(value) === fold(answer);

    if (ok) {
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

            <input
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setStatus("none");
              }}
              placeholder={t.lesson.typePlaceholder}
              disabled={disabled}
              className={cn(
                "w-full rounded-xl border-2 border-b-4 p-4 text-lg text-neutral-700 outline-none transition focus:border-sky-300",
                status === "wrong" && "border-rose-300 bg-rose-50 text-rose-600"
              )}
            />

            {status === "wrong" && (
              <p className="text-base font-bold text-green-600">{answer}</p>
            )}
          </div>
        </div>
      </div>

      <Footer
        status={status}
        onCheck={check}
        disabled={disabled || !value.trim()}
      />
    </>
  );
};
