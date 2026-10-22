import { assetPath } from "./assets";
export async function registerOffline() {
  if (!("serviceWorker" in navigator)) return false;
  try {
    await navigator.serviceWorker.register(assetPath("sw.js"), {
      scope: import.meta.env.BASE_URL,
    });
    await navigator.serviceWorker.ready;
    return true;
  } catch {
    return false;
  }
}
export async function downloadOfflinePack(
  progress: (loaded: number, total: number) => void,
  signal: AbortSignal,
) {
  if (!("serviceWorker" in navigator) || !("caches" in window))
    throw Error("offline_not_supported");
  const registration = await navigator.serviceWorker.ready;
  if (!registration.active) throw Error("offline_not_ready");
  if (!navigator.serviceWorker.controller)
    await new Promise<void>((resolve, reject) => {
      const done = () => {
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener("controllerchange", done);
        resolve();
      };
      const timer = setTimeout(() => {
        navigator.serviceWorker.removeEventListener("controllerchange", done);
        reject(Error("offline_not_ready"));
      }, 5000);
      navigator.serviceWorker.addEventListener("controllerchange", done, {
        once: true,
      });
    });
  const letters = [..."abcdefghijklmnopqrstuvwxyz_"];
  const files = [
    "dictionary/manifest.json",
    "dictionary/zh-TW/manifest.json",
    ...letters.flatMap((l) => [
      `dictionary/en/${l}.json`,
      `dictionary/zh-TW/${l}.json`,
    ]),
  ];
  progress(0, files.length);
  let loaded = 0;
  for (const file of files) {
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const response = await fetch(assetPath(file), { signal });
    if (!response.ok) throw Error("offline_download_failed");
    // Await the full body; the service worker writes its own versioned cache.
    await response.arrayBuffer();
    progress(++loaded, files.length);
  }
  const keys = await caches.keys(),
    key = keys.find((k) => k.startsWith("quicksense-"));
  if (!key) throw Error("offline_not_ready");
  const cache = await caches.open(key);
  const stored = await Promise.all(
    files.map((f) => cache.match(new URL(assetPath(f), location.href).href)),
  );
  if (stored.some((v) => !v)) throw Error("offline_download_failed");
  return files.length;
}
