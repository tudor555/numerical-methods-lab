"use client";

import { useSyncExternalStore, type ReactNode } from "react";

/** Phone widths, the same as Tailwind's `max-sm:` variant. */
const PHONE_QUERY = "(width < 40rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True on a phone, where iteration tables show each row as a card. False on the server. */
export function useIsPhone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

/**
 * Classes that turn an iteration table into one card per row on a phone: the header row hides,
 * and each cell puts its column label (see {@link CellLabel}) on the left and its value on the right.
 */
export const CARD_LAYOUT = {
  table: "max-sm:block",
  header: "max-sm:hidden",
  body: "max-sm:block",
  row: "max-sm:block max-sm:py-2",
  cell: "max-sm:flex max-sm:items-start max-sm:justify-between max-sm:gap-4 max-sm:py-1",
} as const;

/** A cell's column label, shown inside the cell only on a phone, where the header row is hidden. */
export function CellLabel({ phone, children }: { phone: boolean; children: ReactNode }) {
  if (!phone) return null;
  return <span className="text-muted-foreground text-left font-sans">{children}</span>;
}
