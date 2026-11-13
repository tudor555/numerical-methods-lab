"use client";

import { CircleAlert, Play, WandSparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";
import { deriveField, isVisible, visibleDeriveIssue, type DeriveFailure } from "@/labs/fields";
import type {
  ChoiceField,
  ExpressionField,
  FieldDefinition,
  FieldErrors,
  FieldIssue,
  FieldValues,
  MethodDefinition,
  NumberField,
  Preset,
} from "@/labs/types";
import { cn } from "@/lib/utils";
import { Tex } from "./formula";

function FieldMessage({ id, issue }: { id: string; issue: FieldIssue }) {
  const { t } = useI18n();
  return (
    <p id={id} className="text-error flex items-start gap-2 text-sm">
      <CircleAlert className="mt-1 size-4 shrink-0" aria-hidden />
      <span>{t(issue.key, issue.params)}</span>
    </p>
  );
}

function FieldLabel({ field, htmlFor }: { field: FieldDefinition; htmlFor?: string }) {
  const { t } = useI18n();
  const Tag = htmlFor ? "label" : "span";
  return (
    <Tag htmlFor={htmlFor} className="flex flex-wrap items-baseline gap-x-2 text-base font-medium">
      <Tex tex={field.symbol} />
      <span className="text-muted-foreground text-sm font-normal">{t(field.labelKey)}</span>
    </Tag>
  );
}

function ChoiceInput({
  field,
  value,
  onChange,
}: {
  field: ChoiceField;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  const labelId = `field-${field.id}-label`;
  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <div id={labelId}>
        <FieldLabel field={field} />
      </div>
      <div
        role="group"
        aria-labelledby={labelId}
        className="border-border bg-raised flex w-fit flex-wrap rounded-lg border p-1"
      >
        {field.options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "focus-visible:ring-ring rounded-md px-4 py-1 text-base transition-colors outline-none focus-visible:ring-2",
              value === option.value
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  field,
  fields,
  values,
  issue,
  onChange,
}: {
  field: NumberField | ExpressionField;
  fields: readonly FieldDefinition[];
  values: FieldValues;
  issue?: FieldIssue;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  // A failed "Derive from f" message, with the source and own values it was computed from.
  const [deriveFailure, setDeriveFailure] = useState<DeriveFailure | null>(null);
  const inputId = `field-${field.id}`;
  const messageId = `${inputId}-message`;
  const hintId = `${inputId}-hint`;
  const sourceValue = field.derive ? (values[field.derive.from] ?? "") : "";
  const ownValue = values[field.id] ?? "";
  // Shown only while neither the source field nor this field has changed since the failure.
  const deriveIssue = visibleDeriveIssue(deriveFailure, sourceValue, ownValue);
  const shown = deriveIssue ?? issue;

  const runDerive = () => {
    const outcome = deriveField(field, fields, values);
    if (outcome.ok) {
      setDeriveFailure(null);
      onChange(outcome.value);
    } else {
      setDeriveFailure({ issue: outcome.issue, source: sourceValue, own: ownValue });
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2",
        (field.kind === "expression" || field.derive) && "sm:col-span-2",
      )}
    >
      <FieldLabel field={field} htmlFor={inputId} />
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={values[field.id] ?? ""}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={shown ? true : undefined}
          aria-describedby={shown ? messageId : hintId}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="bg-raised dark:bg-raised h-10 font-mono"
        />
        {field.derive && (
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0"
            onClick={runDerive}
            aria-label={t("form.derive")}
            title={t("form.derive")}
          >
            <WandSparkles aria-hidden />
            <span className="hidden sm:inline">{t("form.derive")}</span>
          </Button>
        )}
      </div>
      {shown ? (
        <FieldMessage id={messageId} issue={shown} />
      ) : (
        <p id={hintId} className="text-muted-foreground text-sm">
          {field.kind === "expression"
            ? t("form.exprHint", { vars: field.variables.join(", ") })
            : t("form.numberHint")}
        </p>
      )}
    </div>
  );
}

export function MethodForm({
  method,
  presets,
  activePreset,
  values,
  errors,
  onChange,
  onPreset,
  onRun,
}: {
  method: MethodDefinition;
  presets: readonly Preset[];
  activePreset: string | null;
  values: FieldValues;
  errors: FieldErrors;
  onChange: (id: string, value: string) => void;
  onPreset: (preset: Preset) => void;
  onRun: () => void;
}) {
  const { t } = useI18n();
  const blocked = Object.keys(errors).length > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!blocked) onRun();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {presets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            {t("lab.presets")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant="outline"
                aria-pressed={activePreset === preset.id}
                onClick={() => onPreset(preset)}
                className={cn(
                  "h-auto min-h-8 py-1 whitespace-normal",
                  activePreset === preset.id &&
                    "border-primary/70 text-foreground dark:border-primary/70",
                )}
              >
                {t(preset.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {method.fields.map((field) => {
          if (!isVisible(field, values)) return null;
          if (field.kind === "choice") {
            return (
              <ChoiceInput
                key={field.id}
                field={field}
                value={values[field.id] ?? ""}
                onChange={(value) => onChange(field.id, value)}
              />
            );
          }
          return (
            <TextInput
              key={field.id}
              field={field}
              fields={method.fields}
              values={values}
              issue={errors[field.id]}
              onChange={(value) => onChange(field.id, value)}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={blocked} className="px-6">
          <Play aria-hidden />
          {t("form.run")}
        </Button>
        {blocked && (
          <p className="text-error flex items-center gap-2 text-base">
            <CircleAlert className="size-4" aria-hidden />
            {t("form.blocked")}
          </p>
        )}
      </div>
    </form>
  );
}
