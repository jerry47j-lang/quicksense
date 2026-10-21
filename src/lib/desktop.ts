import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Analysis, Language } from "../types";
export const desktop = isTauri();
export const isMac =
  typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
export const shortcutLabel = isMac ? "⌘ ⇧ Space" : "Ctrl ⇧ Space";
export async function readClipboard() {
  if (desktop) return invoke<string>("read_clipboard");
  return navigator.clipboard.readText();
}
export async function writeClipboard(text: string) {
  if (desktop) return invoke("write_clipboard", { text });
  return navigator.clipboard.writeText(text);
}
export async function saveServiceKey(key: string) {
  if (desktop) return invoke("save_service_key", { key });
  if (key) sessionStorage.setItem("quicksense.serviceKey", key);
  else sessionStorage.removeItem("quicksense.serviceKey");
}
export function validateServiceUrl(value: string) {
  const u = new URL(value);
  if (u.username || u.password || u.search || u.hash)
    throw Error("invalid_service_url");
  if (
    u.protocol !== "https:" &&
    !(
      u.protocol === "http:" &&
      ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname)
    )
  )
    throw Error("invalid_service_url");
  return u.origin + u.pathname.replace(/\/$/, "");
}
export async function analyze(
  query: string,
  source: Language | "auto",
  target: Language,
  url: string,
): Promise<Analysis> {
  const endpoint = validateServiceUrl(url);
  if (desktop)
    return invoke<Analysis>("analyze_text", {
      query,
      source,
      target,
      serviceUrl: endpoint,
    });
  const response = await fetch(`${endpoint}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("quicksense.serviceKey") || ""}`,
    },
    body: JSON.stringify({ text: query, source, target }),
    signal: AbortSignal.timeout(30000),
  });
  const body = (await response.json()) as {
    analysis: Analysis;
    error?: string;
  };
  if (!response.ok) throw Error(body.error || "translation_failed");
  return body.analysis;
}
