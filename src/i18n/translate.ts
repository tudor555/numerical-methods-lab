import type { Lang } from "./config";
import { en, type MessageKey } from "./en";
import { ro } from "./ro";

const dictionaries: Record<Lang, Record<MessageKey, string>> = { en, ro };

export type MessageParams = Record<string, string | number>;

/**
 * Looks up a key. A key missing from the dictionary renders as `⟦key⟧` in development
 * so it is easy to spot, and as the bare key in production. Used on the server and the client.
 */
export function translate(lang: Lang, key: MessageKey, params?: MessageParams): string {
  const message: string | undefined = (dictionaries[lang] as Partial<Record<string, string>>)[key];
  if (message === undefined) {
    return process.env.NODE_ENV === "production" ? key : `⟦${key}⟧`;
  }
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
