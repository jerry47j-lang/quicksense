import type { Language, Profile } from "../types";
export function resolveTarget(
  text: string,
  profile: Pick<Profile, "target" | "source" | "smartTarget">,
): Language {
  if (profile.smartTarget === false) return profile.target;
  if (profile.source === "zh-TW") return "en";
  if (profile.source !== "auto") return "zh-TW";
  const han = (text.match(/\p{Script=Han}/gu) || []).length,
    latin = (text.match(/[a-z]/gi) || []).length;
  const japanese = /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text);
  return han > 0 && !japanese && han >= latin / 3 ? "en" : "zh-TW";
}
const codes: Record<Language, string> = {
  "zh-TW": "zh-TW",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
  it: "it",
  vi: "vi",
  th: "th",
  id: "id",
};
export function freeTranslationUrl(
  text: string,
  source: Language | "auto",
  target: Language,
) {
  if (!text.trim() || text.length > 5000) throw Error("translation_length");
  const url = new URL("https://translate.google.com/");
  url.search = new URLSearchParams({
    sl: source === "auto" ? "auto" : codes[source],
    tl: codes[target],
    text,
    op: "translate",
  }).toString();
  return url.href;
}
