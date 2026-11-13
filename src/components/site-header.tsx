"use client";

import Image from "next/image";
import Link from "next/link";
import { LANGS } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();

  return (
    <header className="border-border/70 bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-8 shrink-0"
          />
          <span className="truncate">{t("app.name")}</span>
        </Link>
        <div
          role="group"
          aria-label={t("lang.label")}
          className="border-border bg-raised flex shrink-0 items-center rounded-lg border p-1"
        >
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={lang === code}
              title={t(`lang.${code}`)}
              onClick={() => setLang(code)}
              className={cn(
                "focus-visible:ring-ring rounded-md px-2 py-1 text-sm font-semibold uppercase transition-colors outline-none focus-visible:ring-2",
                lang === code
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
