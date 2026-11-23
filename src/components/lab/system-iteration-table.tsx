"use client";

import { useState, type ReactNode } from "react";
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
import { CARD_LAYOUT, CellLabel, useIsPhone } from "./table-layout";
import { splitRows } from "./iteration-table";

/** TeX of the max-norm error against the exact solution (x*, y*). */
export const SYSTEM_ERROR_TEX = "\\max(|x_n - x^*|, |y_n - y^*|)";

/** Two values stacked in one cell: the x one on top, the y one below. */
function Pair({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <span className="flex flex-col">
      <span>{top}</span>
      <span>{bottom}</span>
    </span>
  );
}

/**
 * One column: its header and how a row fills it. Pairs stack x over y in one column, so the table
 * fits the results column without scrolling sideways and every value keeps its full precision.
 */
type Column = {
  id: string;
  header: ReactNode;
  value: (row: SystemIterationRow) => ReactNode;
  muted?: boolean;
};

const pairColumn = (
  top: string,
  bottom: string,
  value: (row: SystemIterationRow) => [ReactNode, ReactNode],
): Column => ({
  id: top,
  header: <Pair top={<Tex tex={top} />} bottom={<Tex tex={bottom} />} />,
  value: (row) => {
    const [x, y] = value(row);
    return <Pair top={x} bottom={y} />;
  },
});

const COLUMNS: readonly Column[] = [
  { id: "n", header: <Tex tex="n" />, value: (row) => row.n, muted: true },
  pairColumn("x_n", "y_n", (row) => [formatValue(row.x), formatValue(row.y)]),
  pairColumn("F(x_n, y_n)", "G(x_n, y_n)", (row) => [formatSmall(row.F), formatSmall(row.G)]),
  pairColumn("|x_n - x_{n-1}|", "|y_n - y_{n-1}|", (row) => [
    formatSmall(row.dx),
    formatSmall(row.dy),
  ]),
];

/** The table of a 2×2 system run: n, (xₙ, yₙ), F and G there, and both differences, each pair in one column. */
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
  const phone = useIsPhone();
  // "Show all" belongs to the run it was clicked for; a new run starts shortened again.
  const [shownInFull, setShownInFull] = useState<readonly SystemIterationRow[] | null>(null);
  const { head, tail, hidden } = splitRows(rows, shownInFull === rows ? Infinity : undefined);
  const columns: readonly Column[] = exact
    ? [
        ...COLUMNS,
        {
          id: "error",
          header: <Tex tex={SYSTEM_ERROR_TEX} />,
          value: (row) =>
            formatSmall(Math.max(Math.abs(row.x - exact.x), Math.abs(row.y - exact.y))),
        },
      ]
    : COLUMNS;
  const renderRow = (row: SystemIterationRow) => (
    <TableRow
      key={row.n}
      className={cn(CARD_LAYOUT.row, row.n === errorAt && "bg-error/10 hover:bg-error/15")}
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          className={cn("text-right", CARD_LAYOUT.cell, column.muted && "text-muted-foreground")}
        >
          <CellLabel phone={phone}>{column.header}</CellLabel>
          {column.value(row)}
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
                key={column.id}
                className={cn("h-auto py-2 text-right", column.id === "n" && "w-12")}
              >
                {column.header}
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
