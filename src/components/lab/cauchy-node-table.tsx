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
import { formatSmall, formatValue } from "@/lib/format";
import type { CauchyNodeRow } from "@/lib/methods/types";
import { cn } from "@/lib/utils";
import { nodeError } from "./charts";
import { Tex } from "./formula";
import { splitRows } from "./iteration-table";
import { CARD_LAYOUT, CellLabel, useIsPhone } from "./table-layout";

/** y(x) at a node, or null where it is undefined. */
export function exactAt(exact: (x: number) => number, x: number): number | null {
  try {
    const value = exact(x);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** One column: its TeX header and how a row fills it. */
type Column = { tex: string; value: (row: CauchyNodeRow) => ReactNode; muted?: boolean };

/**
 * The nodes of a Cauchy run: i, xᵢ and yᵢ, plus y(xᵢ) and |y(xᵢ) − yᵢ| when the exact solution is
 * known.
 */
export function CauchyNodeTable({
  rows,
  errorAt,
  exact,
}: {
  rows: readonly CauchyNodeRow[];
  /** i of the node the run failed at; that row is highlighted. */
  errorAt?: number;
  exact?: (x: number) => number;
}) {
  const { t } = useI18n();
  const phone = useIsPhone();
  // "Show all" belongs to the run it was clicked for; a new run starts shortened again.
  const [shownInFull, setShownInFull] = useState<readonly CauchyNodeRow[] | null>(null);
  const { head, tail, hidden } = splitRows(rows, shownInFull === rows ? Infinity : undefined);
  const columns: Column[] = [
    { tex: "i", value: (row) => row.i, muted: true },
    { tex: "x_i", value: (row) => formatValue(row.x) },
    { tex: "y_i", value: (row) => formatValue(row.y) },
    ...(exact
      ? [
          {
            tex: "y(x_i)",
            value: (row: CauchyNodeRow) => {
              const value = exactAt(exact, row.x);
              return value === null ? "—" : formatValue(value);
            },
          },
          {
            tex: "|y(x_i) - y_i|",
            value: (row: CauchyNodeRow) => formatSmall(nodeError(row, exact)),
          },
        ]
      : []),
  ];
  const renderRow = (row: CauchyNodeRow) => (
    <TableRow
      key={row.i}
      className={cn(CARD_LAYOUT.row, row.i === errorAt && "bg-error/10 hover:bg-error/15")}
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
                className={cn("text-right", column.tex === "i" && "w-12")}
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
                  {t("table.hiddenNodes", { count: hidden })}
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
