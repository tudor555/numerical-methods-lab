import { cookies } from "next/headers";
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang } from "./config";

/** The language stored in the request's cookie, or the default. Server only. */
export async function getRequestLang(): Promise<Lang> {
  const stored = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(stored) ? stored : DEFAULT_LANG;
}
