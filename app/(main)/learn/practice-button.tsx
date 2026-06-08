"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

type PracticeButtonProps = {
  due: number;
};

// Entry point to the spaced-repetition review session (/practice). Hidden until
// the learner has something to review, so it's never a dead button.
export const PracticeButton = ({ due }: PracticeButtonProps) => {
  const { t } = useTranslation();

  if (due <= 0) return null;

  return (
    <Link href="/practice" className="block w-full">
      <Button variant="secondary" className="w-full gap-x-2">
        <RefreshCw className="h-4 w-4" />
        {t.modals.practice.title}
      </Button>
    </Link>
  );
};
