import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";
import { getRequestLang } from "@/i18n/server";
import { translate } from "@/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: translate(lang, "notFound.title"),
    description: translate(lang, "notFound.body"),
  };
}

export default function NotFound() {
  return <NotFoundView />;
}
