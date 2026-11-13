"use client";

import { CircleCheck, OctagonX, TriangleAlert, type LucideIcon } from "lucide-react";
import type { MessageKey } from "@/i18n/en";
import { useI18n } from "@/i18n/provider";
import type { RunStatus } from "@/lib/methods/types";
import { cn } from "@/lib/utils";

export const STATUS_STYLE: Record<RunStatus, { icon: LucideIcon; text: string; tint: string }> = {
  converged: { icon: CircleCheck, text: "text-success", tint: "border-success/40 bg-success/10" },
  "max-iterations": {
    icon: TriangleAlert,
    text: "text-warning",
    tint: "border-warning/40 bg-warning/10",
  },
  error: { icon: OctagonX, text: "text-error", tint: "border-error/40 bg-error/10" },
};

/** Status pill: color, icon and text, so it never relies on color alone. */
export function StatusBadge({ status }: { status: RunStatus }) {
  const { t } = useI18n();
  const style = STATUS_STYLE[status];
  const Icon = style.icon;
  const key = `result.status.${status}` satisfies MessageKey;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-2 py-1 text-sm font-semibold",
        style.text,
        style.tint,
      )}
    >
      <Icon className="size-4" aria-hidden />
      {t(key)}
    </span>
  );
}
