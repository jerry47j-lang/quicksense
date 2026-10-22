import { terms } from "../data/terms";
import type {
  BilingualEntry,
  DictionaryEntry,
  Language,
  LookupResult,
  Term,
} from "../types";
import { assetPath } from "./assets";
export const languageNames: Record<Language, string> = {
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Bahasa Indonesia",
};
export function normalize(s: string) {
  return s
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[\s"'“”]+|[\s.!?。！？"'“”]+$/g, "")
    .trim();
}
export function findTerm(
  query: string,
  language: Language | "auto" = "auto",
): Term | undefined {
  const q = normalize(query);
  if (!q) return;
  const eligible = terms.filter(
    (t) => language === "auto" || t.language === language,
  );
  const exact = eligible.find(
    (t) =>
      [t.term, ...(t.aliases || [])].some((v) => normalize(v) === q) ||
      normalize(t.example) === q,
  );
  if (exact) return exact;
  return eligible
    .filter((t) => {
      const term = normalize(t.term);
      if (term.length < 3 && !["ja", "ko", "th"].includes(t.language))
        return false;
      const i = q.indexOf(term);
      if (i < 0) return false;
      if (["ja", "ko", "th"].includes(t.language)) return true;
      return (
        !/[\p{L}\p{N}_]/u.test(q[i - 1] || " ") &&
        !/[\p{L}\p{N}_]/u.test(q[i + term.length] || " ")
      );
    })
    .sort((a, b) => b.term.length - a.term.length)[0];
}
const chunks = new Map<string, Record<string, DictionaryEntry>>();
async function fetchDictionary(path: string) {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 12000);
  try {
    const r = await fetch(assetPath(path), { signal: controller.signal });
    if (!r.ok) throw Error("dictionary_unavailable");
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}
async function chunk(letter: string) {
  if (chunks.has(letter)) return chunks.get(letter)!;
  const data = (await fetchDictionary(
    `dictionary/en/${letter}.json`,
  )) as Record<string, DictionaryEntry>;
  chunks.set(letter, data);
  return data;
}
const bilingualChunks = new Map<string, Record<string, BilingualEntry>>();
async function bilingualChunk(letter: string) {
  if (bilingualChunks.has(letter)) return bilingualChunks.get(letter)!;
  const data = (await fetchDictionary(
    `dictionary/zh-TW/${letter}.json`,
  )) as Record<string, BilingualEntry>;
  bilingualChunks.set(letter, data);
  return data;
}
export function clearLookupCache() {
  chunks.clear();
  bilingualChunks.clear();
}
export async function lookupLocal(
  query: string,
  source: Language | "auto" = "auto",
): Promise<LookupResult> {
  const term = findTerm(query, source);
  if (term) return { query, term, mode: "local" };
  const q = normalize(query);
  if (
    q.length > 100 ||
    !q ||
    !["auto", "en"].includes(source) ||
    !/^[\p{L}\p{N}\s'\-]+$/u.test(q) ||
    q.split(/\s+/).length > 5
  )
    return { query, mode: "miss" };
  const letter = /^[a-z]/.test(q) ? q[0] : "_";
  const candidates = [
    q,
    ...(q.endsWith("ies") ? [`${q.slice(0, -3)}y`] : []),
    ...(q.endsWith("s") && !q.endsWith("ss") ? [q.slice(0, -1)] : []),
    ...(q.endsWith("ing") ? [q.slice(0, -3), `${q.slice(0, -3)}e`] : []),
    ...(q.endsWith("ed") ? [q.slice(0, -2), q.slice(0, -1)] : []),
  ];
  const [en, zh] = await Promise.allSettled([
    chunk(letter),
    bilingualChunk(letter),
  ]);
  if (en.status === "rejected" && zh.status === "rejected")
    throw Error("dictionary_unavailable");
  const data = en.status === "fulfilled" ? en.value : Object.create(null);
  const chinese = zh.status === "fulfilled" ? zh.value : Object.create(null);
  for (const c of candidates) {
    const bilingual =
      Object.hasOwn(chinese, c) && typeof chinese[c]?.translationZh === "string"
        ? chinese[c]
        : undefined;
    if (Object.hasOwn(data, c) || bilingual)
      return {
        query,
        dictionary: {
          ...(Object.hasOwn(data, c)
            ? data[c]
            : { word: bilingual!.word, senses: [] }),
          ...bilingual,
        },
        mode: "dictionary",
      };
  }
  return { query, mode: "miss" };
}
export function lookupMeaning(result: LookupResult) {
  return (
    result.translation?.text ||
    result.analysis?.translation ||
    (result.term && normalize(result.query) === normalize(result.term.example)
      ? result.term.translation
      : result.term?.meaning) ||
    result.dictionary?.translationZh ||
    result.dictionary?.senses[0]?.definitions[0] ||
    ""
  );
}
export function collectionQuery(result: LookupResult) {
  // Save only the recognized expression when the rest of a sentence is unexplained.
  if (
    result.mode === "local" &&
    result.term &&
    normalize(result.query) !== normalize(result.term.example)
  )
    return result.term.term;
  return result.query;
}
export function filterTerms(text: string, language: string, kind: string) {
  const q = normalize(text);
  return terms.filter(
    (t) =>
      (language === "all" || t.language === language) &&
      (kind === "all" || t.kind === kind) &&
      (!q ||
        normalize(
          [t.term, t.meaning, t.region, t.expansion || ""].join(" "),
        ).includes(q)),
  );
}
