import { describe, it, expect, vi, afterEach } from "vitest";
import { collectionQuery, lookupMeaning,clearLookupCache } from "../src/lib/lookup";
import {
  findTerm,
  normalize,
  filterTerms,
  lookupLocal,
} from "../src/lib/lookup";
import { terms } from "../src/data/terms";
import { lessons } from "../src/data/lessons";
import {
  defaultProfile,
  makeBackup,
  parseBackup,
  scheduleReview,
} from "../src/lib/storage";
import { validInput, isAnalysis } from "../service/worker";
import type { SavedItem } from "../src/types";
afterEach(() => {vi.unstubAllGlobals();clearLookupCache();});
describe("language lookup", () => {
  it.each([
    ["FYI", "fyi"],
    ["iykyk", "iykyk"],
    ["お疲れ様です", "otsukare"],
    ["ㅋㅋ", "kkk"],
    ["vale", "vale"],
    ["arvo", "arvo"],
    ["Can we circle back on this after lunch?", "circle-back"],
  ])("recognizes %s without network", async (input, id) => {
    vi.stubGlobal("fetch", () => {
      throw Error("unexpected network");
    });
    const result = await lookupLocal(input);
    expect(result.mode).toBe("local");
    expect(result.term?.id).toBe(id);
  });
  it("respects the selected source language", () => {
    expect(findTerm("vale", "ja")).toBeUndefined();
  });
  it("does not match substrings inside unrelated words", () => {
    expect(findTerm("a bandwidthless FYIndustry")).toBeUndefined();
    expect(findTerm("the teamwork continues")).toBeUndefined();
  });
  it("normalizes Unicode punctuation and case", () => {
    expect(normalize("  I’M Ready！ ")).toBe("i'm ready");
  });
  it("does not call a lexicon result a complete arbitrary translation", async () => {
    const r = await lookupLocal(
      "Please circle back tomorrow with the numbers.",
    );
    expect(r.mode).toBe("local");
    expect(r.term?.term).toBe("circle back");
    expect(r.analysis).toBeUndefined();
  });
  it("loads a real dictionary chunk for an ordinary word", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      json: async () => ({
        serendipity: {
          word: "serendipity",
          senses: [
            {
              pos: "n",
              definitions: ["good luck in making unexpected discoveries"],
              examples: [],
              synonyms: [],
            },
          ],
        },
      }),
    }));
    const r = await lookupLocal("serendipity");
    expect(r.mode).toBe("dictionary");
    expect(r.dictionary?.word).toBe("serendipity");
  });
  it("handles missing or hostile property names safely", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: true, json: async () => ({}) }));
    expect((await lookupLocal("__proto__")).mode).toBe("miss");
    expect(
      (
        await lookupLocal(
          "an entirely unfamiliar long sentence that should never turn into a fabricated translation",
        )
      ).mode,
    ).toBe("miss");
  });
  it("filters by locale and usage category", () => {
    expect(
      filterTerms("", "ja", "work").every(
        (t) => t.language === "ja" && t.kind === "work",
      ),
    ).toBe(true);
    expect(filterTerms("下午", "all", "all").some((t) => t.id === "arvo")).toBe(
      true,
    );
  });
});
describe("learning and backups", () => {
  it("keeps partial phrase explanations and curated complete examples distinct in saved study cards", async () => {
    const partial = await lookupLocal(
      "Please circle back tomorrow with the numbers.",
    );
    expect(collectionQuery(partial)).toBe("circle back");
    expect(lookupMeaning(partial)).toBe(partial.term?.meaning);
    const example = await lookupLocal(
      "Can we circle back on this after lunch?",
    );
    expect(collectionQuery(example)).toBe(example.query);
    expect(lookupMeaning(example)).toBe(example.term?.translation);
  });
  const item: SavedItem = {
    id: "1",
    query: "FYI",
    meaning: "供你參考",
    language: "en",
    source: "local",
    createdAt: 1,
    dueAt: 1,
    reviews: 0,
    interval: 0,
  };
  it("spreads successful reviews and brings difficult ones back sooner", () => {
    const first = scheduleReview(item, true, 1000),
      next = scheduleReview(first, true, 1000),
      again = scheduleReview(next, false, 1000);
    expect(first.dueAt).toBe(86401000);
    expect(next.dueAt).toBeGreaterThan(first.dueAt);
    expect(again.dueAt).toBe(601000);
    expect(again.reviews).toBe(0);
  });
  it("round-trips learning data without exporting service credentials", () => {
    const backup = makeBackup(
      {
        ...defaultProfile,
        name: "Jerry",
        serviceUrl: "https://private.example",
        allowOnline: true,
      },
      [item],
    );
    expect(backup.profile.serviceUrl).toBe("");
    expect(parseBackup(backup).items[0].query).toBe("FYI");
    expect(parseBackup(backup).profile.allowOnline).toBe(false);
  });
  it("rejects arbitrary or malformed backups", () => {
    expect(() => parseBackup({ version: 1, items: [] })).toThrow();
    expect(() =>
      parseBackup({
        ...makeBackup(defaultProfile, [item]),
        items: [{ ...item, dueAt: "bad" }],
      }),
    ).toThrow();
  });
  it("ships ordered A1–B1 lessons with valid answers and stable IDs", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(lessons[0].level).toBe("A1");
    expect(lessons.at(-1)?.level).toBe("B1");
    for (const l of lessons)
      for (const q of l.questions) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.why.length).toBeGreaterThan(5);
      }
  });
  it("retains regional context and reference links for curated notes", () => {
    expect(new Set(terms.map((t) => t.id)).size).toBe(terms.length);
    for (const t of terms) {
      expect(t.region.length).toBeGreaterThan(0);
      expect(t.source).toMatch(/^https:/);
      expect(t.note.length).toBeGreaterThan(5);
    }
  });
});
describe("translation boundary", () => {
  it("validates source and target language independently", () => {
    expect(validInput({ text: "こんにちは", source: "ja", target: "en" })).toBe(
      true,
    );
    expect(validInput({ text: "hello", source: "auto", target: "xx" })).toBe(
      false,
    );
    expect(validInput({ text: "", source: "en", target: "ja" })).toBe(false);
    expect(
      validInput({ text: "a".repeat(6001), source: "en", target: "ja" }),
    ).toBe(false);
  });
  it("does not accept an invented partial response as a valid analysis", () => {
    expect(isAnalysis({ translation: "你好" })).toBe(false);
    expect(
      isAnalysis({
        meaning: "greeting",
        tone: "neutral",
        language: "en",
        translation: "你好",
        grammar: [],
        alternatives: [],
        terms: [],
        uncertainty: null,
      }),
    ).toBe(true);
  });
});
