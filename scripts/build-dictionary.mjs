import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { XMLParser } from "fast-xml-parser";
const url = "https://en-word.net/static/english-wordnet-2025.xml.gz";
await mkdir(".cache", { recursive: true });
let compressed;
try {
  compressed = await readFile(".cache/oewn-2025.xml.gz");
} catch {
  console.log(
    "Downloading Open English WordNet 2025 from the official release…",
  );
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw Error(`Download failed: ${response.status}`);
  compressed = Buffer.from(await response.arrayBuffer());
  await writeFile(".cache/oewn-2025.xml.gz", compressed);
}
console.log(
  `Archive ${(compressed.length / 1048576).toFixed(1)} MiB. Converting to letter-indexed offline packs…`,
);
const xml = gunzipSync(compressed).toString("utf8");
const doc = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  isArray: (n) =>
    [
      "Lexicon",
      "LexicalEntry",
      "Sense",
      "Synset",
      "Definition",
      "Example",
    ].includes(n),
}).parse(xml);
const lexicons = doc.LexicalResource.Lexicon;
const list = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const text = (x) => (typeof x === "string" ? x : x?.["#text"] || "");
const synsets = new Map();
for (const lex of lexicons)
  for (const syn of list(lex.Synset))
    synsets.set(syn.id, {
      pos: syn.partOfSpeech,
      definitions: list(syn.Definition).map(text).filter(Boolean),
      examples: list(syn.Example).map(text).filter(Boolean),
      members: [],
    });
for (const lex of lexicons)
  for (const entry of list(lex.LexicalEntry))
    for (const sense of list(entry.Sense)) {
      const s = synsets.get(sense.synset);
      if (s) s.members.push(entry.Lemma.writtenForm);
    }
const chunks = Object.create(null);
let senses = 0;
for (const lex of lexicons)
  for (const entry of list(lex.LexicalEntry)) {
    const word = entry.Lemma.writtenForm.replaceAll("_", " ");
    const normalized = word
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ")
      .trim();
    const bucket = /^[a-z]/.test(normalized) ? normalized[0] : "_";
    chunks[bucket] ??= Object.create(null);
    const target = (chunks[bucket][normalized] ??= { word, senses: [] });
    for (const sense of list(entry.Sense)) {
      const syn = synsets.get(sense.synset);
      if (!syn) continue;
      const item = {
        pos: entry.Lemma.partOfSpeech || syn.pos,
        definitions: syn.definitions,
        examples: syn.examples.slice(0, 2),
        synonyms: [...new Set(syn.members.filter((w) => w !== word))].slice(
          0,
          8,
        ),
      };
      if (
        target.senses.length < 12 &&
        !target.senses.some((s) => s.definitions[0] === item.definitions[0])
      ) {
        target.senses.push(item);
        senses++;
      }
    }
  }
await mkdir("public/dictionary/en", { recursive: true });
let total = 0,
  entries = 0;
for (const [letter, data] of Object.entries(chunks)) {
  const json = JSON.stringify(data);
  total += Buffer.byteLength(json);
  entries += Object.keys(data).length;
  await writeFile(`public/dictionary/en/${letter}.json`, json);
}
const manifest = {
  id: "oewn-2025",
  label: "Open English WordNet 2025",
  language: "en",
  entries,
  senses,
  bytes: total,
  source: url,
  sourceSha256: createHash("sha256").update(compressed).digest("hex"),
  license: "CC BY 4.0 + underlying Princeton WordNet terms",
  attribution: "Open English WordNet team; Princeton University WordNet",
  modified:
    "Converted from XML into lower-case, letter-indexed JSON; up to twelve senses and two examples per sense.",
  snapshot: "2025 edition",
  builtAt: new Date().toISOString(),
};
await writeFile(
  "public/dictionary/manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  JSON.stringify({
    entries,
    senses,
    bytes: total,
    MiB: (total / 1048576).toFixed(1),
  }),
);
