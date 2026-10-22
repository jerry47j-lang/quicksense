import { createReadStream } from "node:fs";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parse } from "csv-parse";
import * as OpenCC from "opencc-js";

const revision = "bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b";
const source = `https://raw.githubusercontent.com/skywind3000/ECDICT/${revision}/ecdict.csv`;
await mkdir(".cache", { recursive: true });
try {
  await readFile(".cache/ecdict.csv");
} catch {
  const r = await fetch(source);
  if (!r.ok) throw Error("ECDICT download failed");
  await writeFile(".cache/ecdict.csv", new Uint8Array(await r.arrayBuffer()));
}
const known = new Set();
for (const file of await readdir("public/dictionary/en")) {
  Object.keys(
    JSON.parse(await readFile(`public/dictionary/en/${file}`, "utf8")),
  ).forEach((w) => known.add(w));
}
const convert = OpenCC.Converter({ from: "cn", to: "twp" });
const words = Object.create(null),
  aliases = [];
for await (const row of createReadStream(".cache/ecdict.csv").pipe(
  parse({ columns: true, bom: true, relax_column_count: true }),
)) {
  const word = row.word?.normalize("NFKC").trim().toLowerCase();
  if (
    !word ||
    word.length > 70 ||
    !/^[a-z][a-z '\-]*$/.test(word) ||
    !row.translation?.trim()
  )
    continue;
  const frequent = [row.frq, row.bnc].some(
    (v) => Number(v) > 0 && Number(v) <= 50000,
  );
  if (!known.has(word) && !frequent && !row.tag?.trim() && row.oxford !== "1")
    continue;
  const translationZh = convert(row.translation.replace(/\\n/g, "\n")).slice(
    0,
    4000,
  );
  const entry = {
    word,
    translationZh,
    phonetic: (row.phonetic || "").slice(0, 160),
  };
  words[word] = entry;
  for (const exchange of (row.exchange || "").split("/")) {
    const [kind, form] = exchange.split(":");
    if (
      ["p", "d", "i", "3", "r", "t", "s"].includes(kind) &&
      form &&
      /^[a-z][a-z '\-]{0,69}$/.test(form)
    )
      aliases.push([form, entry]);
  }
}
const entries = Object.keys(words).length;
for (const [form, entry] of aliases)
  if (!Object.hasOwn(words, form)) words[form] = entry;
await mkdir("public/dictionary/zh-TW", { recursive: true });
const chunks = Object.create(null);
for (const letter of "abcdefghijklmnopqrstuvwxyz_")
  chunks[letter] = Object.create(null);
for (const word of Object.keys(words).sort())
  chunks[/^[a-z]/.test(word) ? word[0] : "_"][word] = words[word];
let bytes = 0;
for (const [letter, data] of Object.entries(chunks)) {
  const text = JSON.stringify(data);
  bytes += Buffer.byteLength(text);
  await writeFile(`public/dictionary/zh-TW/${letter}.json`, text);
}
const manifest = {
  name: "ECDICT Traditional Chinese companion",
  source,
  revision,
  license: "MIT",
  entries,
  lookupForms: Object.keys(words).length,
  bytes,
  sourceSha256: createHash("sha256")
    .update(await readFile(".cache/ecdict.csv"))
    .digest("hex"),
  modifications:
    "Retained WordNet matches, frequency-ranked and tagged vocabulary; converted Simplified Chinese to Taiwan Traditional Chinese with OpenCC; included documented inflected forms. Historical dictionary data, not a current slang feed.",
};
await writeFile(
  "public/dictionary/zh-TW/manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  JSON.stringify({
    entries,
    lookupForms: manifest.lookupForms,
    MiB: (bytes / 1048576).toFixed(1),
  }),
);
