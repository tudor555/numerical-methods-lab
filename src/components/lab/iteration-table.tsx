"use client";

import { useState, type ReactNode } from "react";

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
import { CARD_LAYOUT, CellLabel, useIsPhone } from "./table-layout";

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

/** One column: its TeX header and how a row fills it. */
type Column<Row> = { tex: string; value: (row: Row) => ReactNode; muted?: boolean };

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
  const phone = useIsPhone();
  // "Show all" belongs to the run it was clicked for; a new run starts shortened again.
  const [shownInFull, setShownInFull] = useState<readonly ScalarIterationRow[] | null>(null);
  const { head, tail, hidden } = splitRows(rows, shownInFull === rows ? Infinity : undefined);
  const columns: Column<ScalarIterationRow>[] = [
    { tex: "n", value: (row) => row.n, muted: true },
    { tex: "x_n", value: (row) => formatValue(row.x) },
    ...(valueColumn
      ? [{ tex: valueColumn, value: (row: ScalarIterationRow) => formatSmall(row.fx) }]
      : []),
    { tex: "|x_n - x_{n-1}|", value: (row) => formatSmall(row.diff) },
    ...(exact
      ? [
          {
            tex: `|x_n - ${exact.tex}|`,
            value: (row: ScalarIterationRow) => formatSmall(Math.abs(row.x - exact.value)),
          },
        ]
      : []),
  ];
  const renderRow = (row: ScalarIterationRow) => (
    <TableRow
      key={row.n}
      className={cn(CARD_LAYOUT.row, row.n === errorAt && "bg-error/10 hover:bg-error/15")}
    >
      {columns.map((column) => (
        <TableCell
          key={column.tex}
          className={cn("text-right", CARD_LAYOUT.cell, column.muted && "text-muted-foreground")}
        >
          <CellLabel phone={phone}>
            <Tex tex={column.tex} />
          </CellLabel>
          <span>{column.value(row)}</span>
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div className="border-border bg-card max-h-[28rem] overflow-auto rounded-xl border max-sm:max-h-[70vh]">
      <Table className={cn("font-mono text-sm tabular-nums", CARD_LAYOUT.table)}>
        <TableHeader className={cn("bg-raised sticky top-0 z-10", CARD_LAYOUT.header)}>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.tex}
                className={cn("text-right", column.tex === "n" && "w-12")}
              >
                <Tex tex={column.tex} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className={CARD_LAYOUT.body}>
          {head.map(renderRow)}
          {hidden > 0 && (
            <TableRow className={cn("hover:bg-transparent", CARD_LAYOUT.row)}>
              <TableCell
                colSpan={columns.length}
                className="text-center font-sans whitespace-normal"
              >
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
