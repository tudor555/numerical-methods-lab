"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/i18n/provider";
import type { SystemExactSolution } from "@/labs/types";
import { formatSmall, formatValue } from "@/lib/format";
import type { SystemIterationRow } from "@/lib/methods/types";
import { cn } from "@/lib/utils";
import { Tex } from "./formula";
import { splitRows } from "./iteration-table";

/** TeX of the max-norm error against the exact solution (x*, y*). */
export const SYSTEM_ERROR_TEX = "\\max(|x_n - x^*|, |y_n - y^*|)";

const HEADERS = [
  "n",
  "x_n",
  "y_n",
  "F(x_n, y_n)",
  "G(x_n, y_n)",
  "|x_n - x_{n-1}|",
  "|y_n - y_{n-1}|",
] as const;

/** The table of a 2×2 system run: n, (xₙ, yₙ), F and G there, and both differences. */
export function SystemIterationTable({
  rows,
  errorAt,
  exact,
}: {
  rows: readonly SystemIterationRow[];
  /** n of the row the run failed at; that row is highlighted. */
  errorAt?: number;
  /** Adds a max(|xₙ − x*|, |yₙ − y*|) column when the exact solution is known. */
  exact?: SystemExactSolution;
}) {
  const { t } = useI18n();
  // "Show all" belongs to the run it was clicked for; a new run starts shortened again.
  const [shownInFull, setShownInFull] = useState<readonly SystemIterationRow[] | null>(null);
  const { head, tail, hidden } = splitRows(rows, shownInFull === rows ? Infinity : undefined);
  const headers = exact ? [...HEADERS, SYSTEM_ERROR_TEX] : HEADERS;
  const renderRow = (row: SystemIterationRow) => (
    <TableRow key={row.n} className={cn(row.n === errorAt && "bg-error/10 hover:bg-error/15")}>
      <TableCell className="text-muted-foreground text-right">{row.n}</TableCell>
      <TableCell className="text-right">{formatValue(row.x)}</TableCell>
      <TableCell className="text-right">{formatValue(row.y)}</TableCell>
      <TableCell className="text-right">{formatSmall(row.F)}</TableCell>
      <TableCell className="text-right">{formatSmall(row.G)}</TableCell>
      <TableCell className="text-right">{formatSmall(row.dx)}</TableCell>
      <TableCell className="text-right">{formatSmall(row.dy)}</TableCell>
      {exact && (
        <TableCell className="text-right">
          {formatSmall(Math.max(Math.abs(row.x - exact.x), Math.abs(row.y - exact.y)))}
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="border-border bg-card max-h-[28rem] overflow-auto rounded-xl border">
      <Table className="font-mono text-sm tabular-nums">
        <TableHeader className="bg-raised sticky top-0 z-10">
          <TableRow className="hover:bg-transparent">
            {headers.map((tex) => (
              <TableHead key={tex} className={cn("text-right", tex === "n" && "w-12")}>
                <Tex tex={tex} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {head.map(renderRow)}
          {hidden > 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={headers.length} className="text-center font-sans">
                <span className="text-muted-foreground mr-4">
                  {t("table.hidden", { count: hidden })}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShownInFull(rows)}
                >
                  {t("table.showAll")}
                </Button>
              </TableCell>
            </TableRow>
          )}
          {tail.map(renderRow)}
        </TableBody>
      </Table>
    </div>
  );
}
