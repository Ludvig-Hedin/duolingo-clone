"use client";

import { Lightbulb } from "lucide-react";

import { useTranslation } from "@/lib/i18n/context";

type TipCardProps = {
  text: string;
};

// Grammar tip shown at the start of a lesson. Quoted substrings are rendered
// bold so the target-language examples stand out from the explanation.
export const TipCard = ({ text }: TipCardProps) => {
  const { t } = useTranslation();
  const segments = text.split('"');

  return (
    <div className="rounded-xl border-2 border-b-4 border-green-200 bg-green-50 p-5 lg:p-6">
      <div className="mb-3 flex items-center gap-x-2 text-green-600">
        <Lightbulb className="h-6 w-6" />
        <span className="text-lg font-bold">{t.lesson.grammarTip}</span>
      </div>

      <p className="text-base leading-relaxed text-neutral-700 lg:text-lg">
        {segments.map((segment, index) =>
          index % 2 === 1 ? (
            <span key={index} className="font-bold text-green-700">
              {segment}
            </span>
          ) : (
            <span key={index}>{segment}</span>
          )
        )}
      </p>
    </div>
  );
};
