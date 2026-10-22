import type { Profile, SavedItem } from "../types";
export const defaultProfile: Profile = {
  name: "新朋友",
  avatar: "sprout",
  target: "zh-TW",
  smartTarget: true,
  autoTranslate: true,
  freeTranslationConsent: false,
  source: "auto",
  mode: "work",
  serviceUrl: "",
  allowOnline: false,
  onboarded: false,
  completedLessons: [],
  reviewLog: [],
};
const PROFILE = "quicksense.profile.v1",
  SAVED = "quicksense.saved.v1",
  HISTORY = "quicksense.history.v1";
const temporary = new Map<string, string>();
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key) temporary.delete(e.key);
    else temporary.clear();
  });
export function storageAvailable() {
  try {
    localStorage.setItem("quicksense.storage-probe", "1");
    localStorage.removeItem("quicksense.storage-probe");
    return true;
  } catch {
    return false;
  }
}
function persist(key: string, value: unknown) {
  const text = JSON.stringify(value);
  temporary.set(key, text);
  try {
    localStorage.setItem(key, text);
  } catch {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("quicksense-storage-unavailable"));
  }
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("quicksense-storage"));
}
function read<T>(key: string, fallback: T): T {
  try {
    return (
      JSON.parse(temporary.get(key) || localStorage.getItem(key) || "null") ??
      fallback
    );
  } catch {
    return fallback;
  }
}
export function loadProfile(): Profile {
  const value = read<unknown>(PROFILE, {});
  const p = (
    value && typeof value === "object" && !Array.isArray(value) ? value : {}
  ) as Partial<Profile>;
  return {
    ...defaultProfile,
    ...p,
    freeTranslationConsent: p.freeTranslationConsent === true,
    autoTranslate: p.autoTranslate !== false,
    smartTarget:
      typeof p.smartTarget === "boolean"
        ? p.smartTarget
        : !p.target || p.target === "zh-TW",
    name:
      typeof p.name === "string" ? p.name.slice(0, 24) : defaultProfile.name,
    completedLessons: Array.isArray(p.completedLessons)
      ? p.completedLessons.filter((x) => typeof x === "string")
      : [],
    reviewLog: Array.isArray(p.reviewLog)
      ? p.reviewLog.filter(
          (x) =>
            typeof x?.at === "number" && typeof x?.remembered === "boolean",
        )
      : [],
  };
}
export function saveProfile(profile: Profile) {
  persist(PROFILE, profile);
}
export function loadSaved(): SavedItem[] {
  const value = read<unknown>(SAVED, []);
  return (Array.isArray(value) ? value : []).filter(
    (x) =>
      typeof x?.id === "string" &&
      typeof x?.query === "string" &&
      typeof x?.meaning === "string" &&
      typeof x?.dueAt === "number",
  );
}
export function saveItems(items: SavedItem[]) {
  persist(SAVED, items);
}
export function loadHistory(): string[] {
  const value = read<unknown>(HISTORY, []);
  return (Array.isArray(value) ? value : [])
    .filter((x) => typeof x === "string")
    .slice(0, 12);
}
export function addHistory(query: string) {
  const list = [query, ...loadHistory().filter((x) => x !== query)].slice(
    0,
    12,
  );
  persist(HISTORY, list);
  return list;
}
export function scheduleReview(
  item: SavedItem,
  remembered: boolean,
  now = Date.now(),
): SavedItem {
  const interval = remembered
    ? item.reviews === 0
      ? 1
      : Math.min(60, Math.max(1, item.interval) * 2.5)
    : 0;
  return {
    ...item,
    reviews: remembered ? item.reviews + 1 : 0,
    interval,
    dueAt: now + (remembered ? Math.round(interval * 86400000) : 10 * 60000),
  };
}
export function makeBackup(profile: Profile, items: SavedItem[]) {
  return {
    format: "quicksense-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      ...profile,
      serviceUrl: "",
      allowOnline: false,
      freeTranslationConsent: false,
    },
    items,
  };
}
export function parseBackup(input: unknown): {
  profile: Profile;
  items: SavedItem[];
} {
  if (!input || typeof input !== "object") throw Error("invalid_backup");
  const b = input as Record<string, unknown>;
  if (
    b.format !== "quicksense-backup" ||
    b.version !== 1 ||
    !Array.isArray(b.items) ||
    b.items.length > 10000
  )
    throw Error("invalid_backup");
  const p = b.profile as Partial<Profile>;
  if (
    !p ||
    typeof p.name !== "string" ||
    ![
      "zh-TW",
      "en",
      "ja",
      "ko",
      "es",
      "fr",
      "de",
      "pt",
      "it",
      "vi",
      "th",
      "id",
    ].includes(String(p.target))
  )
    throw Error("invalid_backup");
  const items = b.items.filter(
    (x): x is SavedItem =>
      !!x &&
      typeof x === "object" &&
      typeof x.id === "string" &&
      typeof x.query === "string" &&
      x.query.length <= 6000 &&
      typeof x.meaning === "string" &&
      x.meaning.length <= 12000 &&
      Number.isFinite(x.dueAt) &&
      Number.isFinite(x.createdAt) &&
      Number.isFinite(x.reviews) &&
      Number.isFinite(x.interval),
  );
  if (items.length !== b.items.length) throw Error("invalid_backup");
  return {
    profile: {
      ...defaultProfile,
      name: p.name.slice(0, 24),
      avatar: ["sprout", "cat", "fox"].includes(String(p.avatar))
        ? p.avatar!
        : "sprout",
      target: p.target!,
      smartTarget:
        typeof p.smartTarget === "boolean"
          ? p.smartTarget
          : p.target === "zh-TW",
      completedLessons: Array.isArray(p.completedLessons)
        ? p.completedLessons.filter((x) => typeof x === "string")
        : [],
      reviewLog: [],
      onboarded: true,
    },
    items,
  };
}
