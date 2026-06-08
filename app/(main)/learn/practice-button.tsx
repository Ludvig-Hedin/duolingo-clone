"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

// Entry point to the spaced-repetition review session (/practice).
export const PracticeButton = () => {
  const { t } = useTranslation();

  return (
    <Link href="/practice" className="block w-full">
      <Button variant="secondary" className="w-full gap-x-2">
        <RefreshCw className="h-4 w-4" />
        {t.modals.practice.title}
      </Button>
    </Link>
  );
};
