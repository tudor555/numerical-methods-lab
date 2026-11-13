"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/provider";
import { labs } from "@/labs/registry";
import type { LabDefinition } from "@/labs/types";

function LabCard({ lab }: { lab: LabDefinition }) {
  const { t } = useI18n();
  const ready = lab.status === "ready";

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-sm tracking-wide uppercase">
          {t("hub.lab", { n: lab.number })}
        </span>
        {ready ? (
          <ArrowRight
            className="text-primary size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock aria-hidden />
            {t("hub.comingSoon")}
          </Badge>
        )}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-balance">{t(lab.titleKey)}</h2>
      <p className="text-muted-foreground mt-2 text-base">{t(lab.topicKey)}</p>
    </>
  );

  const base = "group flex h-full flex-col rounded-xl border p-4 transition-colors";

  if (!ready) {
    return (
      <div aria-disabled="true" className={`${base} border-border/60 bg-card/50 opacity-60`}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/labs/${lab.slug}`}
      aria-label={`${t("hub.lab", { n: lab.number })}: ${t(lab.titleKey)}. ${t("hub.open")}`}
      className={`${base} border-border bg-card hover:border-primary/60 hover:bg-raised focus-visible:ring-ring outline-none focus-visible:ring-2`}
    >
      {body}
    </Link>
  );
}

export function Hub() {
  const { t } = useI18n();

  return (
    <div>
      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("app.name")}</h1>
        <p className="text-muted-foreground mt-4">{t("app.tagline")}</p>
        <p className="text-muted-foreground mt-2 text-base">{t("hub.intro")}</p>
      </section>
      <h2 className="sr-only">{t("hub.title")}</h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <li key={lab.slug}>
            <LabCard lab={lab} />
          </li>
        ))}
      </ul>
    </div>
  );
}
