import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { I18nProvider } from "@/i18n/provider";
import { getRequestLang } from "@/i18n/server";
import { translate } from "@/i18n/translate";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const name = translate(lang, "app.name");
  return {
    title: { default: name, template: `%s · ${name}` },
    description: translate(lang, "app.tagline"),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getRequestLang();

  return (
    <html lang={lang} className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <I18nProvider initialLang={lang}>
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-16 sm:px-6">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
