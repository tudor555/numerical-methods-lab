"use client";

import { ArrowLeft, ChartLine } from "lucide-react";
import Link from "next/link";
import { useMemo, useReducer, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/provider";
import { findReadyLab } from "@/labs/registry";
import { initialLabState, labReducer } from "@/labs/lab-state";
import type { Preset, ReadyLab } from "@/labs/types";
import { cn } from "@/lib/utils";
import { ComparisonPanel } from "./comparison-panel";
import { Explanation } from "./explanation";
import { MethodForm } from "./method-form";
import { ResultsPanel } from "./results-panel";

function Section({ title, children, id }: { title: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-4">
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Shared lab layout: explanation → form with presets → results (summary, charts, table) → comparisons.
 * All state lives here, so switching method tabs or the language keeps the inputs.
 */
export function LabPage({ slug }: { slug: string }) {
  const lab = findReadyLab(slug);
  if (!lab) throw new Error(`Unknown lab: ${slug}`);
  return <LabView lab={lab} />;
}

function LabView({ lab }: { lab: ReadyLab }) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(labReducer, lab, initialLabState);
  const { activeId, values, presetIds, runs } = state;

  const method = lab.methods.find((m) => m.id === activeId) ?? lab.methods[0];
  const methodValues = values[method.id];
  const prepared = useMemo(() => method.prepare(methodValues), [method, methodValues]);
  const errors = prepared.ok ? {} : prepared.errors;
  const run = runs[method.id];

  const change = (fieldId: string, value: string) => {
    dispatch({ type: "change", methodId: method.id, fieldId, value });
  };

  const loadPreset = (preset: Preset) => {
    dispatch({ type: "preset", preset });
  };

  const execute = () => {
    if (!prepared.ok) return;
    const { run: start, plot, eps, exact } = prepared.prepared;
    dispatch({ type: "run", methodId: method.id, run: { result: start(), plot, eps, exact } });
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-base"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("lab.back")}
        </Link>
        <div>
          <Badge
            variant="outline"
            className="border-primary/50 bg-primary/10 text-primary font-mono tracking-wide uppercase"
          >
            {t("lab.number", { n: lab.number })}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t(lab.titleKey)}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">{t(lab.introKey)}</p>
        </div>
      </header>

      <div
        role="group"
        aria-label={t("lab.methods")}
        className="border-border bg-card flex w-full flex-wrap gap-2 rounded-xl border p-1 sm:w-fit"
      >
        {lab.methods.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={m.id === method.id}
            onClick={() => dispatch({ type: "select", methodId: m.id })}
            className={cn(
              "focus-visible:ring-ring flex-1 rounded-lg px-4 py-2 text-base font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 sm:flex-none",
              m.id === method.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-raised hover:text-foreground",
            )}
          >
            {t(m.tabKey)}
          </button>
        ))}
      </div>

      <Section id="explanation" title={`${t("lab.section.explanation")}: ${t(method.titleKey)}`}>
        <div className="border-border bg-card rounded-xl border p-4 sm:p-6">
          <Explanation blocks={method.explanation} />
        </div>
      </Section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Section id="parameters" title={t("lab.section.parameters")}>
          <div className="border-border bg-card rounded-xl border p-4 sm:p-6">
            <MethodForm
              method={method}
              presets={lab.presets.filter((p) => p.methodId === method.id)}
              activePreset={presetIds[method.id] ?? null}
              values={methodValues}
              errors={errors}
              onChange={change}
              onPreset={loadPreset}
              onRun={execute}
            />
          </div>
        </Section>

        <Section id="results" title={t("lab.section.results")}>
          {run ? (
            <ResultsPanel view={run} valueColumn={method.valueColumn} />
          ) : (
            <div className="border-border text-muted-foreground flex items-center gap-4 rounded-xl border border-dashed p-6 text-base lg:min-h-80 lg:flex-col lg:justify-center lg:text-center">
              <ChartLine className="size-6 shrink-0" aria-hidden />
              {t("result.empty")}
            </div>
          )}
        </Section>
      </div>

      <Section id="comparison" title={t("lab.section.comparison")}>
        <ComparisonPanel lab={lab} />
      </Section>
    </div>
  );
}
