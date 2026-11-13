"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export function NotFoundView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <Image src="/logo.png" alt="" width={64} height={64} className="size-16" />
      <p className="text-primary font-mono text-base tracking-widest">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{t("notFound.title")}</h1>
      <p className="text-muted-foreground">{t("notFound.body")}</p>
      <Link href="/" className={buttonVariants({ size: "lg", className: "mt-2 px-4" })}>
        <ArrowLeft aria-hidden />
        {t("notFound.back")}
      </Link>
    </div>
  );
}
