export type Language =
  | "zh-TW"
  | "en"
  | "ja"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "vi"
  | "th"
  | "id";
export type Term = {
  id: string;
  term: string;
  aliases?: string[];
  language: Language;
  region: string;
  kind: "work" | "slang" | "daily";
  meaning: string;
  tone: string;
  expansion?: string;
  note: string;
  example: string;
  translation: string;
  reply?: string;
  grammar?: string;
  source: string;
  checked: string;
  level: "A1" | "A2" | "B1" | "B2";
};
export type DictionarySense = {
  pos: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
};
export type BilingualEntry = {
  word: string;
  translationZh: string;
  phonetic: string;
};
export type DictionaryEntry = {
  word: string;
  senses: DictionarySense[];
  translationZh?: string;
  phonetic?: string;
};
export type Analysis = {
  meaning: string;
  tone: string;
  language: string;
  translation: string;
  grammar: { pattern: string; explanation: string; example: string }[];
  alternatives: { register: string; text: string; meaning: string }[];
  terms: { term: string; meaning: string }[];
  uncertainty: string | null;
};
export type LookupResult = {
  query: string;
  term?: Term;
  dictionary?: DictionaryEntry;
  analysis?: Analysis;
  translation?: import("./lib/inline-translation").InlineTranslation;
  mode: "local" | "dictionary" | "online" | "miss" | "translated";
  cached?: boolean;
};
export type SavedItem = {
  id: string;
  query: string;
  meaning: string;
  language: string;
  source: string;
  createdAt: number;
  dueAt: number;
  reviews: number;
  interval: number;
};
export type Profile = {
  name: string;
  avatar: "sprout" | "cat" | "fox";
  target: Language;
  smartTarget?: boolean;
  autoTranslate?: boolean;
  freeTranslationConsent?: boolean;
  source: Language | "auto";
  mode: "work" | "break" | "meeting";
  serviceUrl: string;
  allowOnline: boolean;
  onboarded: boolean;
  completedLessons: string[];
  reviewLog: { at: number; remembered: boolean }[];
};
export type Lesson = {
  id: string;
  level: "A1" | "A2" | "B1";
  title: string;
  subtitle: string;
  minutes: number;
  pattern: string;
  explanation: string;
  examples: { en: string; zh: string }[];
  questions: {
    prompt: string;
    options: string[];
    answer: number;
    why: string;
  }[];
};
