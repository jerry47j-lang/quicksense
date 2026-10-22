import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
let api: typeof import("../src/lib/inline-translation");
beforeEach(async () => {
  vi.resetModules();
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  vi.stubGlobal("navigator", { onLine: true });
  api = await import("../src/lib/inline-translation");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function provider(text = "translated", extra = {}) {
  return new Response(
    JSON.stringify({
      responseStatus: 200,
      responseData: { translatedText: text },
      ...extra,
    }),
  );
}
describe("free inline translation", () => {
  it.each([
    ["我想把會議改到明天。", "zh-TW"],
    ["お元気ですか", "ja"],
    ["안녕하세요", "ko"],
    ["สวัสดีครับ", "th"],
    ["Please send me the meeting notes tomorrow.", "en"],
  ])("detects source %s", (text, language) =>
    expect(api.detectSource(text)).toBe(language),
  );
  it("preserves every Unicode character while respecting the official 500-byte limit", () => {
    const text = "明天開會🦊 é café. ".repeat(70),
      parts = api.splitTranslation(text);
    expect(parts.join("")).toBe(text);
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts)
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(480);
  });
  it("uses the actual target, sends no email/key/cookies, decodes text and caches exact duplicates", async () => {
    const fn = vi.fn(async () => provider("I&#39;m hungry &amp; ready."));
    vi.stubGlobal("fetch", fn);
    const result = await api.translateInline(
      "我餓了",
      "auto",
      "en",
      new AbortController().signal,
    );
    expect(result.text).toBe("I'm hungry & ready.");
    expect(result.source).toBe("zh-TW");
    const [url, options] = fn.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.origin).toBe("https://api.mymemory.translated.net");
    expect(url.searchParams.get("q")).toBe("我餓了");
    expect(url.searchParams.get("langpair")).toBe("zh-TW|en");
    expect([...url.searchParams.keys()]).toEqual(["q", "langpair", "mt"]);
    expect(options.credentials).toBe("omit");
    expect(options.cache).toBe("no-store");
    expect(
      (
        await api.translateInline(
          "我餓了",
          "auto",
          "en",
          new AbortController().signal,
        )
      ).cached,
    ).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("does not use a public provider when offline or cancelled", async () => {
    const fn = vi.fn();
    vi.stubGlobal("fetch", fn);
    vi.stubGlobal("navigator", { onLine: false });
    await expect(
      api.translateInline("hello", "en", "ja", new AbortController().signal),
    ).rejects.toThrow("free_offline");
    const controller = new AbortController();
    controller.abort();
    await expect(
      api.translateInline("hello", "en", "ja", controller.signal),
    ).rejects.toThrow("Cancelled");
    expect(fn).not.toHaveBeenCalled();
  });
  it("never returns quota/error text as a translation", async () => {
    vi.stubGlobal("fetch", async () =>
      provider("MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS", {
        quotaFinished: true,
      }),
    );
    await expect(
      api.translateInline("hello", "en", "ja", new AbortController().signal),
    ).rejects.toThrow("free_quota");
  });
  it("stops at the daily free cap before sending any request", async () => {
    localStorage.setItem(
      "quicksense.free-translation-usage.v1",
      JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        used: 4998,
      }),
    );
    const fn = vi.fn();
    vi.stubGlobal("fetch", fn);
    await expect(
      api.translateInline("hello", "en", "ja", new AbortController().signal),
    ).rejects.toThrow("free_quota");
    expect(fn).not.toHaveBeenCalled();
  });
  it("does not show a partial sentence if a later segment fails", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce(provider("first segment"))
      .mockRejectedValueOnce(Error("network"));
    vi.stubGlobal("fetch", fn);
    await expect(
      api.translateInline(
        "This is a long sentence. ".repeat(40),
        "en",
        "ja",
        new AbortController().signal,
      ),
    ).rejects.toThrow("network");
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("cancels a pending old response", async () => {
    vi.stubGlobal(
      "fetch",
      (_url: unknown, options: RequestInit) =>
        new Promise((_resolve, reject) =>
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          ),
        ),
    );
    const controller = new AbortController();
    const pending = api.translateInline("hello", "en", "ja", controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow("Cancelled");
  });
  it("ends slow requests with a retryable error", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      (_url: unknown, options: RequestInit) =>
        new Promise((_resolve, reject) =>
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          ),
        ),
    );
    const pending = api.translateInline(
      "hello",
      "en",
      "ja",
      new AbortController().signal,
    );
    const checked = expect(pending).rejects.toThrow("free_timeout");
    await vi.advanceTimersByTimeAsync(18000);
    await checked;
  });
  it("keeps consent disabled in exported and imported profiles", async () => {
    const storage = await import("../src/lib/storage");
    const backup = storage.makeBackup(
      { ...storage.defaultProfile, freeTranslationConsent: true },
      [],
    );
    expect(backup.profile.freeTranslationConsent).toBe(false);
    expect(storage.parseBackup(backup).profile.freeTranslationConsent).toBe(
      false,
    );
  });
});
