import { lab1 } from "./lab-1";
import type { LabDefinition, ReadyLab } from "./types";

type PlannedNumber = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

const planned = <N extends PlannedNumber>(number: N, slug: string): LabDefinition => ({
  number,
  slug,
  status: "coming-soon",
  titleKey: `lab${number}.title`,
  topicKey: `lab${number}.topic`,
});

/** All 13 labs in course order. Labs 2–13 are listed as "coming soon" until they ship. */
export const labs: readonly LabDefinition[] = [
  lab1,
  planned(2, "secant-steffensen"),
  planned(3, "halley-chebyshev"),
  planned(4, "third-order"),
  planned(5, "newton-systems"),
  planned(6, "nonlinear-systems"),
  planned(7, "euler"),
  planned(8, "runge-kutta-2-3"),
  planned(9, "runge-kutta-4"),
  planned(10, "picard"),
  planned(11, "boundary-value"),
  planned(12, "green-function"),
  planned(13, "finite-differences"),
];

export function findReadyLab(slug: string): ReadyLab | undefined {
  const lab = labs.find((l) => l.slug === slug);
  return lab?.status === "ready" ? lab : undefined;
}
