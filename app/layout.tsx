import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";

import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";
import { I18nProvider } from "@/lib/i18n/context";
import { getCurrentLocale } from "@/lib/i18n/server";

import "./globals.css";

const font = Nunito({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#22C55E",
};

export const metadata: Metadata = siteConfig;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: "/favicon.ico",
        },
        variables: {
          colorPrimary: "#22C55E",
        },
      }}
      afterSignOutUrl="/"
    >
      <html lang={locale}>
        <body className={font.className}>
          <I18nProvider locale={locale}>
            <Toaster theme="light" richColors closeButton />
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
