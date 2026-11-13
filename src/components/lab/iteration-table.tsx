"use client";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSmall, formatValue } from "@/lib/format";
import type { ScalarIterationRow } from "@/lib/methods/types";
import { cn } from "@/lib/utils";
import type { ExactSolution } from "@/labs/types";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { Tex } from "./formula";

/** Rows shown in full: a run at the default cap of 1000 (n = 0…1000) is never shortened. */
export const FULL_TABLE_LIMIT = 1001;
const KEEP = 50;

/**
 * Splits a long run into its first and last rows. Rendering 100 000 rows would freeze the page,
 * and the start and the end are what a reader compares.
 */
export function splitRows<T>(
  rows: readonly T[],
  limit = FULL_TABLE_LIMIT,
  keep = KEEP,
): { head: readonly T[]; tail: readonly T[]; hidden: number } {
  if (rows.length <= limit) return { head: rows, tail: [], hidden: 0 };
  return { head: rows.slice(0, keep), tail: rows.slice(-keep), hidden: rows.length - 2 * keep };
}

export function IterationTable({
  rows,
  valueColumn,
  errorAt,
  exact,
}: {
  rows: readonly ScalarIterationRow[];
  /** TeX header of the f(xₙ) column; omitted when the method has no f. */
  valueColumn?: string;
  /** n of the row the run failed at; that row is highlighted. */
  errorAt?: number;
  /** Adds an |xₙ − exact| column when the exact solution is known. */
  exact?: ExactSolution;
}) {
  const { t } = useI18n();
  // "Show all" belongs to the run it was clicked for; a new run starts shortened again.
  const [shownInFull, setShownInFull] = useState<readonly ScalarIterationRow[] | null>(null);
  const { head, tail, hidden } = splitRows(rows, shownInFull === rows ? Infinity : undefined);
  const columns = 3 + (valueColumn ? 1 : 0) + (exact ? 1 : 0);
  const renderRow = (row: ScalarIterationRow) => (
    <TableRow key={row.n} className={cn(row.n === errorAt && "bg-error/10 hover:bg-error/15")}>
      <TableCell className="text-muted-foreground text-right">{row.n}</TableCell>
      <TableCell className="text-right">{formatValue(row.x)}</TableCell>
      {valueColumn && <TableCell className="text-right">{formatSmall(row.fx)}</TableCell>}
      <TableCell className="text-right">{formatSmall(row.diff)}</TableCell>
      {exact && (
        <TableCell className="text-right">{formatSmall(Math.abs(row.x - exact.value))}</TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="border-border bg-card max-h-[28rem] overflow-auto rounded-xl border">
      <Table className="font-mono text-sm tabular-nums">
        <TableHeader className="bg-raised sticky top-0 z-10">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-right">
              <Tex tex="n" />
            </TableHead>
            <TableHead className="text-right">
              <Tex tex="x_n" />
            </TableHead>
            {valueColumn && (
              <TableHead className="text-right">
                <Tex tex={valueColumn} />
              </TableHead>
            )}
            <TableHead className="text-right">
              <Tex tex="|x_n - x_{n-1}|" />
            </TableHead>
            {exact && (
              <TableHead className="text-right">
                <Tex tex={`|x_n - ${exact.tex}|`} />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {head.map(renderRow)}
          {hidden > 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns} className="text-center font-sans">
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
