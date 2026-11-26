import { lab1 } from "./lab-1";
import { lab2 } from "./lab-2";
import { lab3 } from "./lab-3";
import { lab4 } from "./lab-4";
import { lab5 } from "./lab-5";
import { lab6 } from "./lab-6";
import { lab7 } from "./lab-7";
import type { LabDefinition, ReadyLab } from "./types";

type PlannedNumber = 8 | 9 | 10 | 11 | 12 | 13;

const planned = <N extends PlannedNumber>(number: N, slug: string): LabDefinition => ({
  number,
  slug,
  status: "coming-soon",
  titleKey: `lab${number}.title`,
  topicKey: `lab${number}.topic`,
});

/** All 13 labs in course order. Labs that are not built yet are listed as "coming soon". */
export const labs: readonly LabDefinition[] = [
  lab1,
  lab2,
  lab3,
  lab4,
  lab5,
  lab6,
  lab7,
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
