import { readFile } from "node:fs/promises";
import vm from "node:vm";
import assert from "node:assert/strict";
// Exercise the actual generated worker, including a subdirectory deployment.
const handlers = {},
  entries = new Map(),
  buckets = new Map();
const base = "https://example.test/quicksense/";
const absolute = (v) => new URL(typeof v === "string" ? v : v.url, base).href;
const cache = {
  async addAll(paths) {
    for (const p of paths) entries.set(absolute(p), new Response("shell"));
  },
  async put(key, response) {
    entries.set(absolute(key), response.clone());
  },
  async match(key) {
    return entries.get(absolute(key))?.clone();
  },
};
let online = true,
  calls = 0;
const context = {
  URL,
  Response,
  console,
  self: {
    location: new URL(base + "sw.js"),
    addEventListener: (name, fn) => (handlers[name] = fn),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  },
  caches: {
    open: async (key) => {
      buckets.set(key, cache);
      return cache;
    },
    keys: async () => [...buckets.keys()],
    delete: async (key) => buckets.delete(key),
  },
  fetch: async () => {
    calls++;
    if (!online) throw Error("offline");
    return new Response("dictionary");
  },
};
vm.runInNewContext(await readFile("dist/sw.js", "utf8"), context);
await new Promise((resolve, reject) =>
  handlers.install({ waitUntil: (p) => p.then(resolve, reject) }),
);
await new Promise((resolve, reject) =>
  handlers.activate({ waitUntil: (p) => p.then(resolve, reject) }),
);
async function request(url, mode = "cors", method = "GET") {
  let response;
  handlers.fetch({
    request: { url, method, mode },
    respondWith: (p) => (response = p),
  });
  return response;
}
assert.equal(
  await (await request(base + "dictionary/zh-TW/d.json")).text(),
  "dictionary",
);
const priorCalls = calls;
online = false;
assert.equal(
  await (await request(base + "dictionary/zh-TW/d.json")).text(),
  "dictionary",
);
assert.equal(calls, priorCalls, "cached dictionary must avoid network");
assert.equal(
  await (await request(base, "navigate")).text(),
  "shell",
  "offline reload must show shell",
);
assert.equal(
  await request("https://translate.google.com/?text=test"),
  undefined,
  "external translation must never be cached",
);
assert.equal(
  await request("https://example.test/other/data"),
  undefined,
  "worker must stay inside app scope",
);
assert.equal(
  await request(base + "analyze", "cors", "POST"),
  undefined,
  "non-GET must never be cached",
);
console.log(
  "Generated worker: cached dictionary, offline navigation, external/scope/POST exclusions pass.",
);
