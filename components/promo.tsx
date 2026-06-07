import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getServerDictionary } from "@/lib/i18n/server";

export const Promo = async () => {
  const t = await getServerDictionary();

  return (
    <div className="space-y-4 rounded-xl border-2 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.svg" alt="Pro" height={26} width={26} />

          <h3 className="text-lg font-bold">{t.promo.title}</h3>
        </div>

        <p className="text-muted-foreground">{t.promo.description}</p>
      </div>

      <Button variant="super" className="w-full" size="lg" asChild>
        <Link href="/shop">{t.promo.cta}</Link>
      </Button>
    </div>
  );
};
