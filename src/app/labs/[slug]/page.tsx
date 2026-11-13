import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabPage } from "@/components/lab/lab-page";
import { getRequestLang } from "@/i18n/server";
import { translate } from "@/i18n/translate";
import { findReadyLab } from "@/labs/registry";

interface LabRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LabRouteProps): Promise<Metadata> {
  const lab = findReadyLab((await params).slug);
  if (!lab) return {};
  const lang = await getRequestLang();
  return {
    title: `${translate(lang, "lab.number", { n: lab.number })}: ${translate(lang, lab.titleKey)}`,
    description: translate(lang, lab.topicKey),
  };
}

export default async function LabRoute({ params }: LabRouteProps) {
  const { slug } = await params;
  if (!findReadyLab(slug)) notFound();
  return <LabPage slug={slug} />;
}
