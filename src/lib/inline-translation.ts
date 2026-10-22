import { franc } from "franc-min";
import type { Language } from "../types";

const languages: Record<string, Language> = {
  eng: "en",
  jpn: "ja",
  kor: "ko",
  spa: "es",
  fra: "fr",
  deu: "de",
  por: "pt",
  ita: "it",
  vie: "vi",
  tha: "th",
  ind: "id",
};
export function detectSource(text: string): Language {
  if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text)) return "ja";
  if (/\p{Script=Hangul}/u.test(text)) return "ko";
  if (/\p{Script=Thai}/u.test(text)) return "th";
  if (/\p{Script=Han}/u.test(text)) return "zh-TW";
  if (text.trim().length < 15) return "en";
  return (
    languages[franc(text, { only: Object.keys(languages), minLength: 15 })] ||
    "en"
  );
}
export function splitTranslation(text: string, maxBytes = 480): string[] {
  const encoder = new TextEncoder(),
    parts: string[] = [];
  let part = "",
    bytes = 0;
  for (const char of text) {
    const size = encoder.encode(char).length;
    if (bytes + size > maxBytes) {
      const cut = Math.max(
        part.lastIndexOf(" "),
        part.lastIndexOf("。"),
        part.lastIndexOf(". "),
        part.lastIndexOf("\n"),
      );
      if (cut > part.length / 2) {
        const keep = part.slice(cut + 1);
        parts.push(part.slice(0, cut + 1));
        part = keep;
        bytes = encoder.encode(part).length;
      } else {
        parts.push(part);
        part = "";
        bytes = 0;
      }
    }
    part += char;
    bytes += size;
  }
  if (part) parts.push(part);
  return parts;
}
export type InlineTranslation = {
  text: string;
  source: Language;
  target: Language;
  cached: boolean;
};
const cache = new Map<string, InlineTranslation>();
let daily = { date: "", used: 0 };
const storageKey = "quicksense.free-translation-usage.v1";
function reserve(characters: number) {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved?.date === date && Number.isFinite(saved.used))
      daily = {
        date,
        used: Math.max(daily.date === date ? daily.used : 0, saved.used),
      };
  } catch {}
  if (daily.date !== date) daily = { date, used: 0 };
  if (daily.used + characters > 5000) throw Error("free_quota");
  daily.used += characters;
  try {
    localStorage.setItem(storageKey, JSON.stringify(daily));
  } catch {}
}
export async function translateInline(
  text: string,
  source: Language | "auto",
  target: Language,
  signal: AbortSignal,
): Promise<InlineTranslation> {
  const input = text.trim();
  if (!input || input.length > 6000) throw Error("translation_length");
  const detected = source === "auto" ? detectSource(input) : source;
  if (detected === target)
    return { text: input, source: detected, target, cached: false };
  const key = JSON.stringify([detected, target, input]);
  const hit = cache.get(key);
  if (hit) return { ...hit, cached: true };
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  if (typeof navigator !== "undefined" && !navigator.onLine)
    throw Error("free_offline");
  const parts = splitTranslation(input);
  reserve([...input].length);
  const output: string[] = [];
  for (const part of parts) {
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    if (!part.trim()) {
      output.push(part);
      continue;
    }
    const url = new URL("https://api.mymemory.translated.net/get");
    url.search = new URLSearchParams({
      q: part,
      langpair: `${detected}|${target}`,
      mt: "1",
    }).toString();
    const timeout = new AbortController(),
      abort = () => timeout.abort();
    signal.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => timeout.abort(), 18000);
    try {
      const response = await fetch(url, {
        signal: timeout.signal,
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
      });
      if (response.status === 429) throw Error("free_quota");
      if (!response.ok) throw Error("free_unavailable");
      const data = await response.json();
      if (
        data.quotaFinished ||
        Number(data.responseStatus) === 429 ||
        /USED ALL AVAILABLE FREE|NEXT AVAILABLE IN/i.test(
          String(data.responseData?.translatedText || ""),
        )
      )
        throw Error("free_quota");
      if (Number(data.responseStatus) !== 200)
        throw Error(
          /LANGUAGE|LANGPAIR/i.test(data.responseDetails || "")
            ? "free_language"
            : "free_unavailable",
        );
      const translated = data.responseData?.translatedText;
      if (
        typeof translated !== "string" ||
        !translated.trim() ||
        translated.length > 12000
      )
        throw Error("free_invalid");
      // Render text only. Decode common provider entities without inserting HTML.
      const decoded = translated.replace(
        /&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi,
        (entity, code: string) => {
          const names: Record<string, string> = {
            amp: "&",
            quot: '"',
            apos: "'",
            lt: "<",
            gt: ">",
          };
          if (code[0] !== "#") return names[code.toLowerCase()] || entity;
          const n =
            code[1].toLowerCase() === "x"
              ? parseInt(code.slice(2), 16)
              : parseInt(code.slice(1), 10);
          return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff)
            ? String.fromCodePoint(n)
            : entity;
        },
      );
      output.push(
        (part.match(/^\s*/)?.[0] || "") +
          decoded.trim() +
          (part.match(/\s*$/)?.[0] || ""),
      );
    } catch (error) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      if (timeout.signal.aborted) throw Error("free_timeout");
      throw error;
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    }
  }
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  const result = {
    text: output.join(""),
    source: detected,
    target,
    cached: false,
  };
  cache.set(key, result);
  if (cache.size > 60) cache.delete(cache.keys().next().value!);
  return result;
}
export function translationErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  return code === "free_quota"
    ? "免費翻譯額度暫時用完（服務按網路 IP 計算，匿名每日 5,000 字元）。可稍後再試，或改用下方 Google 翻譯。"
    : code === "free_offline"
      ? "目前沒有網路。已下載的英漢字義仍能查；整句翻譯請連線後重試。"
      : code === "free_language"
        ? "這組語言暫時無法翻譯，請手動選擇來源語言或使用 Google 翻譯。"
        : code === "free_timeout"
          ? "免費翻譯服務回應較慢，已停止等待。原文保留，可以重試。"
          : "免費翻譯暫時未完成。原文已保留，可以重試或改用 Google 翻譯。";
}
