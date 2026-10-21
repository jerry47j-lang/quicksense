import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Clock3,
  Cloud,
  Code2,
  Download,
  ExternalLink,
  Globe2,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Keyboard,
  Languages,
  Leaf,
  LoaderCircle,
  Maximize2,
  Menu,
  Monitor,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Upload,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PixelAvatar, PixelRoom } from "./components/PixelRoom";
import { terms } from "./data/terms";
import { lessons } from "./data/lessons";
import {
  filterTerms,
  collectionQuery,
  languageNames,
  lookupLocal,
  lookupMeaning,
  normalize,
} from "./lib/lookup";
import {
  addHistory,
  defaultProfile,
  loadHistory,
  loadProfile,
  loadSaved,
  makeBackup,
  parseBackup,
  saveItems,
  saveProfile,
  scheduleReview,
} from "./lib/storage";
import {
  analyze,
  desktop,
  isMac,
  readClipboard,
  writeClipboard,
  saveServiceKey,
  shortcutLabel,
  validateServiceUrl,
} from "./lib/desktop";
import type {
  Language,
  Lesson,
  LookupResult,
  Profile,
  SavedItem,
  Term,
} from "./types";
import "./style.css";
type View = "lookup" | "library" | "learn" | "world" | "room" | "settings";
const quick = new URLSearchParams(location.search).get("quick") === "1";
const repo = "https://github.com/jerry47j-lang/quicksense";
const nav = [
  { id: "lookup", label: "快查翻譯", en: "QUICK LOOKUP", Icon: Search },
  { id: "library", label: "我的單字庫", en: "MY COLLECTION", Icon: BookMarked },
  { id: "learn", label: "學習小徑", en: "LEARNING PATH", Icon: GraduationCap },
  { id: "world", label: "世界用語", en: "WORLD EXPRESSIONS", Icon: Globe2 },
  { id: "room", label: "我的小書房", en: "MY LITTLE STUDY", Icon: Home },
] as const;
function App() {
  const [view, setView] = useState<View>("lookup"),
    [profile, setProfile] = useState<Profile>(loadProfile),
    [saved, setSaved] = useState<SavedItem[]>(loadSaved),
    [history, setHistory] = useState<string[]>(loadHistory);
  const [query, setQuery] = useState(
      quick ? "" : "Can we circle back on this after lunch?",
    ),
    [result, setResult] = useState<LookupResult | null>(
      quick
        ? null
        : {
            query: "Can we circle back on this after lunch?",
            term: terms[0],
            mode: "local",
          },
    );
  const [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [expanded, setExpanded] = useState(false),
    [tab, setTab] = useState<"meaning" | "grammar" | "reply">("meaning");
  const [modal, setModal] = useState<
      "name" | "review" | "backup" | "online" | null
    >(null),
    [nameDraft, setNameDraft] = useState(profile.name),
    [serviceKey, setServiceKey] = useState("");
  const [worldText, setWorldText] = useState(""),
    [worldLanguage, setWorldLanguage] = useState("all"),
    [worldKind, setWorldKind] = useState("all"),
    [libraryText, setLibraryText] = useState("");
  const [lesson, setLesson] = useState<Lesson | null>(null),
    [question, setQuestion] = useState(-1),
    [answer, setAnswer] = useState<number | null>(null),
    [mistakes, setMistakes] = useState(0);
  const [reviewReveal, setReviewReveal] = useState(false),
    [reviewedSession, setReviewedSession] = useState<string[]>([]),
    [sidebarOpen, setSidebarOpen] = useState(false),
    [manifest, setManifest] = useState<{
      entries: number;
      bytes: number;
      senses: number;
      snapshot: string;
    } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null),
    inputRef = useRef<HTMLTextAreaElement>(null),
    fileRef = useRef<HTMLInputElement>(null),
    requestRef = useRef(0),
    profileRef = useRef(profile);
  profileRef.current = profile;
  const notify = (t: string) => setToast(t);
  function updateProfile(changes: Partial<Profile>) {
    setProfile((current) => {
      const next = { ...current, ...changes };
      saveProfile(next);
      return next;
    });
  }
  function updateSaved(items: SavedItem[]) {
    setSaved(items);
    saveItems(items);
  }
  useEffect(() => {
    if (!desktop) return;
    const openReference = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest(
        'a[href^="https:"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      event.preventDefault();
      void invoke("open_reference", { url: anchor.href }).catch(() =>
        notify("無法開啟參考來源，請從專案文件查看。"),
      );
    };
    document.addEventListener("click", openReference);
    return () => document.removeEventListener("click", openReference);
  }, []);
  useEffect(() => {
    fetch("/dictionary/manifest.json")
      .then((r) => r.json())
      .then(setManifest)
      .catch(() => {});
    const onStorage = () => {
      setSaved(loadSaved());
      setProfile(loadProfile());
      setHistory(loadHistory());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        if (quick && desktop) invoke("hide_quick").catch(() => {});
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void runLookup(query);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setView("lookup");
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [query, profile]);
  useEffect(() => {
    if (!desktop || !quick) return;
    let unlisten: (() => void) | undefined;
    let active = true;
    listen<string>("quick-lookup", () => {
      // Both startup and events consume the same pending value once.
      void invoke<string | null>("take_pending_query")
        .then((q) => {
          if (!active || q === null) return;
          setQuery(q);
          if (q.trim()) void runLookup(q);
        })
        .catch(() => {});
    }).then((fn) => {
      if (active) unlisten = fn;
      else fn();
    });
    invoke<string | null>("take_pending_query")
      .then((q) => {
        if (active && q) {
          setQuery(q);
          void runLookup(q);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      unlisten?.();
    };
  }, []);
  async function runLookup(text = query, forceOnline = false) {
    const input = text.trim();
    if (!input) {
      inputRef.current?.focus();
      return;
    }
    if (input.length > 6000) {
      notify("一次最多查詢 6,000 個字元，請分段查詢。");
      return;
    }
    const request = ++requestRef.current;
    setBusy(true);
    setTab("meaning");
    setExpanded(false);
    try {
      const p = profileRef.current;
      const local = await lookupLocal(input, p.source);
      if (request !== requestRef.current) return;
      setResult(local);
      setHistory(addHistory(input));
      if (
        forceOnline ||
        (p.allowOnline && p.serviceUrl && local.mode === "miss")
      ) {
        if (!p.allowOnline || !p.serviceUrl) {
          setModal("online");
          return;
        }
        const cacheKey = `quicksense.cache:${p.serviceUrl}:${p.source}:${p.target}:${input}`;
        let cached: string | null = null;
        try {
          cached = sessionStorage.getItem(cacheKey);
        } catch {}
        const analysis = cached
          ? JSON.parse(cached)
          : await analyze(input, p.source, p.target, p.serviceUrl);
        if (request !== requestRef.current) return;
        setResult({ ...local, mode: "online", analysis, cached: !!cached });
        if (!cached)
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(analysis));
          } catch {}
      }
    } catch (e) {
      const code =
        e instanceof Error ? e.message : typeof e === "string" ? e : "unknown";
      notify(
        code === "dictionary_unavailable"
          ? "離線辭典尚未載入，請確認資料包已安裝。"
          : code === "budget_exhausted"
            ? "連線服務的額度已用完；離線辭典仍可使用。"
            : code === "unauthorized" || code === "service_key_missing"
              ? "請在設定中確認翻譯服務通行碼。"
              : "連線分析未完成，請稍後重試。已找到的離線結果仍會保留。",
      );
    } finally {
      if (request === requestRef.current) setBusy(false);
    }
  }
  async function paste() {
    try {
      const text = await readClipboard();
      setQuery(text);
      if (text.trim()) await runLookup(text);
      else notify("剪貼簿裡沒有文字。");
    } catch {
      notify("目前無法讀取剪貼簿，請直接貼到輸入框。");
      inputRef.current?.focus();
    }
  }
  function selectTerm(t: Term) {
    setView("lookup");
    setQuery(t.example);
    setResult({ query: t.example, term: t, mode: "local" });
    setTab("meaning");
    setExpanded(false);
    setHistory(addHistory(t.term));
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function collect() {
    if (!result || result.mode === "miss") return;
    const key = normalize(collectionQuery(result));
    if (saved.some((x) => normalize(x.query) === key)) {
      notify("這個內容已經在你的單字庫裡。");
      return;
    }
    updateSaved([
      {
        id: crypto.randomUUID(),
        query: collectionQuery(result),
        meaning: lookupMeaning(result),
        language: result.analysis?.language || result.term?.language || "en",
        source: result.analysis
          ? profile.serviceUrl
          : result.term?.source ||
            (result.dictionary ? "https://en-word.net/" : profile.serviceUrl),
        createdAt: Date.now(),
        dueAt: Date.now(),
        reviews: 0,
        interval: 0,
      },
      ...saved,
    ]);
    notify("已放進你的單字庫，下次可以回來複習。");
  }
  function speak(text: string, lang = "en") {
    if (!("speechSynthesis" in window)) {
      notify("這個環境沒有提供朗讀功能。");
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const code = lang === "zh-TW" ? "zh-TW" : lang;
    const voice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(code.toLowerCase()),
    );
    if (!voice) {
      notify("目前沒有這個語言的系統語音，請先安裝對應語音。");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = code;
    if (voice) u.voice = voice;
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  async function copy(text: string, message = "內容已複製。") {
    try {
      await writeClipboard(text);
      notify(message);
    } catch {
      notify("目前無法複製，請選取文字後手動複製。");
    }
  }
  async function exportData() {
    const data = JSON.stringify(makeBackup(profile, saved), null, 2);
    if (desktop) {
      try {
        if (await invoke<boolean>("export_backup", { data }))
          notify("已匯出學習資料，備份不含服務通行碼。");
      } catch {
        notify("備份未寫入，請確認儲存位置可寫入。");
      }
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quicksense-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("已匯出學習資料，備份不含服務通行碼。");
  }
  async function importData(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      notify("備份檔案過大，請使用 20 MB 以內的備份。");
      return;
    }
    try {
      const data = parseBackup(JSON.parse(await file.text()));
      const map = new Map(saved.map((x) => [normalize(x.query), x]));
      data.items.forEach((x) => {
        if (!map.has(normalize(x.query))) map.set(normalize(x.query), x);
      });
      updateSaved([...map.values()]);
      updateProfile({
        ...data.profile,
        serviceUrl: profile.serviceUrl,
        allowOnline: profile.allowOnline,
      });
      notify("備份已合併，現有單字不會被覆蓋。");
    } catch {
      notify("無法讀取這份備份，請選擇 QuickSense 匯出的 JSON 檔。");
    }
  }
  const due = saved.filter(
    (x) => x.dueAt <= Date.now() && !reviewedSession.includes(x.id),
  );
  const reviewItem = due[0];
  function review(remembered: boolean) {
    if (!reviewItem) return;
    updateSaved(
      saved.map((x) =>
        x.id === reviewItem.id ? scheduleReview(x, remembered) : x,
      ),
    );
    updateProfile({
      reviewLog: [...profile.reviewLog, { at: Date.now(), remembered }].slice(
        -1000,
      ),
    });
    setReviewedSession([...reviewedSession, reviewItem.id]);
    setReviewReveal(false);
  }
  function startLesson(l: Lesson) {
    setLesson(l);
    setQuestion(-1);
    setAnswer(null);
    setMistakes(0);
    setView("learn");
  }
  function nextQuestion() {
    if (!lesson) return;
    if (answer !== null && answer !== lesson.questions[question]?.answer)
      setMistakes((m) => m + 1);
    if (question + 1 >= lesson.questions.length) {
      if (mistakes === 0 && answer === lesson.questions[question]?.answer) {
        updateProfile({
          completedLessons: [
            ...new Set([...profile.completedLessons, lesson.id]),
          ],
        });
        notify("這一課完成了！下一段學習小徑已開啟。");
      } else notify("先把這一課再練一次，就能解鎖下一課。");
      setQuestion(lesson.questions.length);
    } else {
      setQuestion(question + 1);
      setAnswer(null);
    }
  }
  const currentNav = nav.find((n) => n.id === view),
    term = result?.term;
  const sentenceMatch =
    !!term && normalize(result?.query || "") === normalize(term.example);
  const foundPhrase =
    !!term &&
    normalize(result?.query || "") !== normalize(term.term) &&
    !sentenceMatch;
  const savedAlready =
    !!result &&
    saved.some(
      (x) => normalize(x.query) === normalize(collectionQuery(result)),
    );
  const completed = profile.completedLessons.length;
  const nextLesson =
    lessons.find((l) => !profile.completedLessons.includes(l.id)) || lessons[0];
  const progress = Math.round((completed / lessons.length) * 100);
  const date = new Intl.DateTimeFormat("zh-TW", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
  const world = filterTerms(worldText, worldLanguage, worldKind);
  return (
    <div
      className={`app ${quick ? "quick-app" : ""} ${profile.mode === "meeting" ? "meeting-mode" : ""}`}
    >
      {!quick && (
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <a
            className="logo"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("lookup");
            }}
          >
            <img src="/icon.svg" />
            <span>
              QuickSense<small>快懂 · 語言小書房</small>
            </span>
          </a>
          <div className="profile-mini">
            <span className="mini-avatar">
              <PixelAvatar kind={profile.avatar} size={31} />
            </span>
            <div>
              <strong>{profile.name} 的小書房</strong>
              <span>每天一點點，世界懂更多</span>
            </div>
            <button
              aria-label="編輯名字"
              onClick={() => {
                setNameDraft(profile.name);
                setModal("name");
              }}
            >
              <Settings2 size={14} />
            </button>
          </div>
          <div className="nav-caption">你的學習空間</div>
          <nav>
            {nav.map(({ id, label, en, Icon }) => (
              <button
                key={id}
                className={view === id ? "active" : ""}
                onClick={() => {
                  setView(id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {id === "library" && saved.length > 0 && (
                  <em>{saved.length}</em>
                )}
                {id === "learn" && <span className="new-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-tip">
            <Keyboard size={22} />
            <strong>一個快捷鍵，就快懂。</strong>
            <p>複製文字後，隨時叫出快查小窗。</p>
            <kbd>{shortcutLabel}</kbd>
            <span>{desktop ? "桌面快捷鍵已啟用" : "桌面版提供全域快捷鍵"}</span>
          </div>
          <div className="sidebar-bottom">
            <button
              className={view === "settings" ? "active" : ""}
              onClick={() => setView("settings")}
            >
              <Settings2 size={17} />
              偏好設定
            </button>
            <a href={repo} target="_blank" rel="noreferrer">
              <Code2 size={17} />
              開源製作 · Codex
              <ArrowUpRight size={13} />
            </a>
            <div className="local-label">
              <span />
              學習紀錄保存在這台裝置
            </div>
          </div>
        </aside>
      )}
      <div className="main-shell">
        <header className="header">
          <div>
            <button
              className="mobile-menu icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="開啟選單"
            >
              <Menu size={20} />
            </button>
            {quick ? (
              <>
                <img className="mini-logo" src="/icon.svg" />
                <strong>QuickSense 快懂</strong>
                <span className="quiet-label">隨手一查</span>
              </>
            ) : (
              <>
                <span className="header-breadcrumb">我的小書房</span>
                <ChevronRight size={13} />
                <strong>{currentNav?.label || "偏好設定"}</strong>
              </>
            )}
          </div>
          <div className="header-end">
            {quick ? (
              <button
                className="icon-btn"
                title="開啟完整小書房"
                onClick={() =>
                  desktop
                    ? invoke("open_main")
                    : window.open(location.origin, "_blank")
                }
              >
                <Maximize2 size={16} />
              </button>
            ) : (
              <>
                <span className="status-pill">
                  <span />
                  {profile.allowOnline && profile.serviceUrl
                    ? "連線＋離線"
                    : "離線辭典就緒"}
                </span>
                <button
                  className="avatar-button"
                  aria-label="設定個人角色"
                  onClick={() => {
                    setNameDraft(profile.name);
                    setModal("name");
                  }}
                >
                  <PixelAvatar kind={profile.avatar} size={26} />
                </button>
              </>
            )}
          </div>
        </header>
        <main>
          {!quick && view === "lookup" && (
            <>
              <section className="greeting">
                <div>
                  <div className="overline">
                    <Sun size={13} />
                    {date} · LITTLE STEPS, BIG WORLD
                  </div>
                  <h1>
                    嗨，{profile.name}
                    <span className="greeting-star">✦</span>
                    <br />
                    今天，也快懂一點。
                  </h1>
                  <p>看懂一句話，學會一點點。你的世界，又大了一點。</p>
                  <div className="mode-switch" aria-label="使用情境">
                    {(
                      [
                        { id: "work", label: "上班中", Icon: Monitor },
                        { id: "break", label: "午休一下", Icon: Sun },
                        { id: "meeting", label: "開會快查", Icon: Headphones },
                      ] as const
                    ).map(({ id, label, Icon }) => (
                      <button
                        className={profile.mode === id ? "selected" : ""}
                        key={id}
                        onClick={() => {
                          updateProfile({ mode: id });
                          if (id === "break") startLesson(nextLesson);
                        }}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="room-preview">
                  <div className="room-preview-label">
                    <span /> {profile.name.toUpperCase()}'S LITTLE STUDY{" "}
                    <span className="tiny-level">LV. {1 + completed}</span>
                  </div>
                  <PixelRoom
                    name={profile.name}
                    books={saved.length}
                    avatar={profile.avatar}
                  />
                  <div className="room-bottom">
                    <Leaf size={12} />
                    {saved.length === 0
                      ? "每收藏一句話，小書房就多一點故事。"
                      : `你已收藏 ${saved.length} 個讓世界更清楚的片刻。`}
                  </div>
                </div>
              </section>
            </>
          )}
          {(view === "lookup" || quick) && (
            <>
              {!quick && profile.mode === "meeting" && (
                <div className="meeting-bar">
                  <span>
                    <Headphones size={15} />
                    開會快查 · 精簡畫面
                  </span>
                  <button
                    className="text-button"
                    onClick={() => updateProfile({ mode: "work" })}
                  >
                    <Monitor size={14} />
                    回到上班模式
                  </button>
                </div>
              )}
              <section className="lookup-panel">
                <div className="panel-title">
                  <div>
                    <span className="square-icon">
                      <Languages size={17} />
                    </span>
                    <h2>遇到不懂的，放進來就好。</h2>
                  </div>
                  <span className="keyboard-hint">
                    <kbd>{isMac ? "⌘" : "Ctrl"}</kbd> + <kbd>Enter</kbd> 查詢
                  </span>
                </div>
                <div className="language-row">
                  <label>
                    <Globe2 size={14} />
                    <select
                      aria-label="來源語言"
                      value={profile.source}
                      onChange={(e) =>
                        updateProfile({
                          source: e.target.value as Profile["source"],
                        })
                      }
                    >
                      <option value="auto">自動辨識語言</option>
                      {Object.entries(languageNames).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ArrowRight size={14} />
                  <label>
                    <select
                      aria-label="翻譯成"
                      value={profile.target}
                      onChange={(e) =>
                        updateProfile({ target: e.target.value as Language })
                      }
                    >
                      {Object.entries(languageNames).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} />
                  </label>
                  <span className="language-hint">單字、縮寫、句子都可以</span>
                </div>
                <textarea
                  ref={inputRef}
                  aria-label="查詢文字"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="貼上你剛遇到的外文，例如：Can we circle back on this after lunch?"
                  maxLength={6000}
                  rows={quick ? 3 : 2}
                />
                <div className="input-bottom">
                  <button className="paste-button" onClick={paste}>
                    <ClipboardPaste size={14} />
                    貼上並快查
                  </button>
                  <span className="input-count">{query.length} / 6,000</span>
                  <button
                    className="primary-button"
                    onClick={() => runLookup()}
                    disabled={busy || !query.trim()}
                  >
                    {busy ? (
                      <LoaderCircle size={15} className="spin" />
                    ) : (
                      <Sparkles size={15} />
                    )}{" "}
                    {busy ? "正在查詢…" : "快懂一下"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </section>
              {!quick && (
                <div className="try-row">
                  <span>隨手試試</span>
                  {["FYI", "IYKYK", "お疲れ様です", "ㅋㅋ", "vale", "arvo"].map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setQuery(t);
                          void runLookup(t);
                        }}
                      >
                        {t}
                        <ArrowUpRight size={10} />
                      </button>
                    ),
                  )}
                </div>
              )}
              {result && (
                <section className="result-panel">
                  <div className="result-tabs">
                    <div role="tablist" aria-label="結果分類">
                      {(
                        [
                          { id: "meaning", label: "意思與語氣" },
                          { id: "grammar", label: "文法拆解" },
                          { id: "reply", label: "怎麼回更自然" },
                        ] as const
                      ).map((t) => (
                        <button
                          role="tab"
                          aria-selected={tab === t.id}
                          className={tab === t.id ? "active" : ""}
                          onClick={() => setTab(t.id)}
                          key={t.id}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <span
                      className={`result-source ${result.mode === "online" ? "online" : ""}`}
                    >
                      {result.mode === "online" ? (
                        <Cloud size={12} />
                      ) : (
                        <WifiOff size={12} />
                      )}{" "}
                      {result.mode === "online"
                        ? "AI 連線解釋"
                        : result.mode === "dictionary"
                          ? "離線英文辭典"
                          : "離線用語庫"}
                    </span>
                  </div>
                  {result.mode === "miss" ? (
                    <div className="miss-result">
                      <span className="empty-avatar">
                        <PixelAvatar kind={profile.avatar} size={50} />
                      </span>
                      <h3>這段內容需要連線解釋。</h3>
                      <p>
                        內建辭典適合英文單字與已收錄用語；任意句子的翻譯和文法分析，需要啟用翻譯服務。
                      </p>
                      <button
                        className="primary-button"
                        onClick={() =>
                          profile.allowOnline && profile.serviceUrl
                            ? runLookup(query, true)
                            : setModal("online")
                        }
                      >
                        <Cloud size={15} />
                        設定連線翻譯
                      </button>
                    </div>
                  ) : (
                    <>
                      {tab === "meaning" && (
                        <div className="meaning-content">
                          <div className="meaning-main">
                            <div className="term-label">
                              <span className="pixel-spark">✦</span>
                              {result.mode === "dictionary"
                                ? result.dictionary?.word
                                : result.mode === "online"
                                  ? result.analysis?.language
                                  : term?.region}
                              {term && (
                                <span className="tone-chip">{term.tone}</span>
                              )}
                            </div>
                            <h3>
                              {result.mode === "online"
                                ? result.analysis?.translation
                                : result.mode === "dictionary"
                                  ? result.dictionary?.senses[0]?.definitions[0]
                                  : sentenceMatch
                                    ? term?.translation
                                    : term?.meaning}
                            </h3>
                            {foundPhrase && (
                              <div className="partial-note">
                                辨識到片語「{term?.term}
                                」：以下是片語說明，並非整句翻譯。
                              </div>
                            )}
                            {result.mode === "dictionary" && (
                              <div className="partial-note">
                                這是英文辭義；切換目標語言不會自動翻譯離線資料。
                              </div>
                            )}
                            <p className="meaning-note">
                              {result.analysis?.meaning ||
                                term?.note ||
                                result.dictionary?.senses[0]?.examples[0]}
                            </p>
                            {result.analysis?.uncertainty && (
                              <p className="uncertainty">
                                {result.analysis.uncertainty}
                              </p>
                            )}
                            <div className="meaning-actions">
                              <button
                                onClick={collect}
                                className={savedAlready ? "collected" : ""}
                              >
                                <Star
                                  size={14}
                                  fill={savedAlready ? "currentColor" : "none"}
                                />
                                {savedAlready ? "已收藏" : "放進單字庫"}
                              </button>
                              <button
                                onClick={() =>
                                  speak(
                                    result.query,
                                    result.analysis?.language ||
                                      term?.language ||
                                      "en",
                                  )
                                }
                              >
                                <Volume2 size={15} />
                                聽聽怎麼說
                              </button>
                              <button
                                onClick={() =>
                                  void copy(
                                    lookupMeaning(result),
                                    "意思已複製。",
                                  )
                                }
                              >
                                <ClipboardPaste size={14} />
                                複製意思
                              </button>
                              {!result.analysis && (
                                <button
                                  disabled={busy}
                                  onClick={() =>
                                    profile.allowOnline && profile.serviceUrl
                                      ? void runLookup(result.query, true)
                                      : setModal("online")
                                  }
                                >
                                  <Cloud size={14} />
                                  連線翻譯與解釋
                                </button>
                              )}
                            </div>
                          </div>
                          {term && (
                            <aside className="usage-card">
                              <span className="small-overline">
                                A LITTLE MORE CONTEXT
                              </span>
                              <h4>這句可以這樣用</h4>
                              <p lang={term.language}>{term.example}</p>
                              <span>{term.translation}</span>
                              <div>
                                <span className="tiny-leaf">✿</span>{" "}
                                {term.language === "en"
                                  ? "把學到的，放回真實情境。"
                                  : "留意場合，語氣也要一起懂。"}
                              </div>
                            </aside>
                          )}
                          {result.dictionary && (
                            <div className="dictionary-extra">
                              {result.dictionary.senses
                                .slice(1, expanded ? 12 : 3)
                                .map((sense, i) => (
                                  <article key={i}>
                                    <span>{sense.pos}</span>
                                    <p>{sense.definitions.join("; ")}</p>
                                    {sense.synonyms.length > 0 && (
                                      <small>
                                        相關詞：{sense.synonyms.join(" · ")}
                                      </small>
                                    )}
                                  </article>
                                ))}
                              {result.dictionary.senses.length > 3 && (
                                <button
                                  className="text-button"
                                  onClick={() => setExpanded(!expanded)}
                                >
                                  {expanded ? "收起辭義" : "顯示更多辭義"}
                                  <ChevronDown size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {tab === "grammar" && (
                        <div className="grammar-content">
                          {result.analysis?.grammar.map((g, i) => (
                            <article key={i}>
                              <span className="small-overline">
                                PATTERN {i + 1}
                              </span>
                              <h3>{g.pattern}</h3>
                              <p>{g.explanation}</p>
                              <blockquote>{g.example}</blockquote>
                            </article>
                          ))}
                          {!result.analysis && term?.grammar ? (
                            <article>
                              <span className="small-overline">
                                PATTERN NOTE
                              </span>
                              <h3>{term.term}</h3>
                              <p>{term.grammar}</p>
                              <blockquote>{term.example}</blockquote>
                            </article>
                          ) : (
                            !result.analysis && (
                              <div className="inline-empty">
                                <BookOpen size={24} />
                                <p>
                                  這個詞條沒有完整的句子文法解析。可以先看學習小徑，或連線分析你貼上的完整句子。
                                </p>
                              </div>
                            )
                          )}
                          <button
                            className="text-button"
                            disabled={busy}
                            onClick={() =>
                              profile.allowOnline && profile.serviceUrl
                                ? runLookup(result.query, true)
                                : setModal("online")
                            }
                          >
                            <Cloud size={14} />
                            連線分析完整文法
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                      {tab === "reply" && (
                        <div className="reply-content">
                          {result.analysis?.alternatives.map((a, i) => (
                            <article key={i}>
                              <span className="tone-chip">{a.register}</span>
                              <h3>{a.text}</h3>
                              <p>{a.meaning}</p>
                              <button
                                className="text-button"
                                onClick={() =>
                                  void copy(a.text, "回覆已複製。")
                                }
                              >
                                複製這句
                                <ClipboardPaste size={13} />
                              </button>
                            </article>
                          ))}
                          {!result.analysis && term?.reply ? (
                            <article>
                              <span className="tone-chip">
                                參考回覆 · 請依情境調整
                              </span>
                              <h3>{term.reply}</h3>
                              <p>
                                這是針對上方範例寫的回覆，不會自動替你傳送。
                              </p>
                              <button
                                className="text-button"
                                onClick={() =>
                                  void copy(term.reply!, "回覆已複製。")
                                }
                              >
                                複製這句
                                <ClipboardPaste size={13} />
                              </button>
                            </article>
                          ) : (
                            !result.analysis && (
                              <div className="inline-empty">
                                <MessageIcon />
                                <p>
                                  這個詞條尚未提供回覆範例。連線後可依你貼上的句子，生成適合的說法。
                                </p>
                              </div>
                            )
                          )}
                          <button
                            className="text-button"
                            disabled={busy}
                            onClick={() =>
                              profile.allowOnline && profile.serviceUrl
                                ? runLookup(result.query, true)
                                : setModal("online")
                            }
                          >
                            <Cloud size={14} />
                            連線產生回覆建議
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                      <div className="result-foot">
                        <span>
                          <ShieldCheck size={12} />
                          {result.mode === "online"
                            ? "AI 解釋可能有誤，重要內容請再確認。"
                            : term
                              ? `用語筆記 · 整理日期 ${term.checked}`
                              : "Open English WordNet 2025 · CC BY 4.0"}
                        </span>
                        <a
                          href={term?.source || "https://en-word.net/"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          參考來源
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </>
                  )}
                </section>
              )}
              {!quick && (
                <div className="bottom-grid">
                  <section className="daily-lesson">
                    <div className="section-line">
                      <h3>
                        <Leaf size={17} />
                        午休學一點
                      </h3>
                      <span>約 {nextLesson.minutes} 分鐘</span>
                    </div>
                    <div className="daily-body">
                      <span className="lesson-level">{nextLesson.level}</span>
                      <div>
                        <h4>{nextLesson.title}</h4>
                        <p>{nextLesson.subtitle}</p>
                      </div>
                      <button
                        aria-label="開始今日課程"
                        onClick={() => startLesson(nextLesson)}
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                    <div className="progress-track">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <div className="progress-label">
                      <span>你的英語小徑</span>
                      <strong>
                        {completed} / {lessons.length} 課
                      </strong>
                    </div>
                  </section>
                  <section className="review-card">
                    <div className="section-line">
                      <h3>
                        <BookMarked size={17} />
                        自己的內容，記得更久
                      </h3>
                      <span className="soft-tag">間隔複習</span>
                    </div>
                    <p>
                      {due.length
                        ? `今天有 ${due.length} 個收藏可以再看一眼。`
                        : "把剛查到的單字放進收藏，下次從自己遇過的內容開始。"}
                    </p>
                    <button
                      className="text-button"
                      onClick={() => {
                        setReviewedSession([]);
                        setReviewReveal(false);
                        if (saved.length) setModal("review");
                        else setView("library");
                      }}
                    >
                      {saved.length ? "開始複習" : "看看我的單字庫"}
                      <ArrowRight size={14} />
                    </button>
                  </section>
                </div>
              )}
              {!quick && history.length > 0 && (
                <div className="recent-row">
                  <Clock3 size={13} />
                  <span>最近查過</span>
                  {history.slice(0, 4).map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setQuery(h);
                        void runLookup(h);
                      }}
                    >
                      {h.length > 22 ? h.slice(0, 22) + "…" : h}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {!quick && view === "world" && (
            <section className="page">
              <div className="page-kicker">WORDS TRAVEL. MEANINGS CHANGE.</div>
              <h1>
                世界那麼大，
                <br />
                用語慢慢懂。
              </h1>
              <p className="page-description">
                縮寫、口語、職場說法。連同地區、場合和語氣，一起收進你的理解裡。
              </p>
              <div className="world-toolbar">
                <div className="small-search">
                  <Search size={15} />
                  <input
                    placeholder="搜尋用語、意思或地區"
                    aria-label="搜尋世界用語"
                    value={worldText}
                    onChange={(e) => setWorldText(e.target.value)}
                  />
                </div>
                <select
                  aria-label="篩選語言"
                  value={worldLanguage}
                  onChange={(e) => setWorldLanguage(e.target.value)}
                >
                  <option value="all">所有語言</option>
                  {Object.entries(languageNames)
                    .filter(([id]) => terms.some((t) => t.language === id))
                    .map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                </select>
                <select
                  aria-label="篩選用語類型"
                  value={worldKind}
                  onChange={(e) => setWorldKind(e.target.value)}
                >
                  <option value="all">所有情境</option>
                  <option value="work">職場說法</option>
                  <option value="slang">網路／俚語</option>
                  <option value="daily">日常口語</option>
                </select>
              </div>
              <div className="world-summary">
                用語起步庫 · {world.length} 個詞條 ·
                不代表所有國家或最新流行語排名
              </div>
              <div className="world-grid">
                {world.map((t) => (
                  <button
                    key={t.id}
                    className="term-card"
                    onClick={() => selectTerm(t)}
                  >
                    <div>
                      <span className="term-region">{t.region}</span>
                      <ArrowUpRight size={15} />
                    </div>
                    <h3>{t.term}</h3>
                    <p>{t.meaning}</p>
                    <span className="tone-chip">{t.tone}</span>
                  </button>
                ))}
              </div>
              {world.length === 0 && (
                <div className="empty-state">
                  <Globe2 size={30} />
                  <p>還沒有這個篩選的內容，換個關鍵字試試。</p>
                </div>
              )}
            </section>
          )}
          {!quick && view === "library" && (
            <section className="page">
              <div className="page-kicker">YOUR WORDS. YOUR WORLD.</div>
              <div className="page-title-row">
                <div>
                  <h1>我的單字庫</h1>
                  <p className="page-description">
                    每個收藏，都是你真正遇過的語言。
                  </p>
                </div>
                <button
                  className="outline-button"
                  onClick={() => {
                    setReviewedSession([]);
                    setReviewReveal(false);
                    setModal("review");
                  }}
                  disabled={!due.length}
                >
                  <RotateCcw size={15} />
                  複習 {due.length} 個
                </button>
              </div>
              <div className="library-toolbar">
                <div className="small-search">
                  <Search size={15} />
                  <input
                    aria-label="搜尋收藏"
                    placeholder="搜尋你的收藏"
                    value={libraryText}
                    onChange={(e) => setLibraryText(e.target.value)}
                  />
                </div>
                <span>{saved.length} 個收藏</span>
                <button onClick={exportData}>
                  <Download size={14} />
                  匯出
                </button>
              </div>
              {saved.length === 0 ? (
                <div className="empty-state">
                  <PixelAvatar kind={profile.avatar} size={64} />
                  <h3>第一本小筆記，等你開始。</h3>
                  <p>查詢後按「放進單字庫」，就能慢慢整理出自己的語言收藏。</p>
                  <button
                    className="primary-button"
                    onClick={() => setView("lookup")}
                  >
                    去查一句話
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <div className="saved-list">
                  {saved
                    .filter((s) =>
                      normalize(`${s.query} ${s.meaning}`).includes(
                        normalize(libraryText),
                      ),
                    )
                    .map((s) => (
                      <article key={s.id}>
                        <div>
                          <span className="small-overline">
                            {s.language} ·{" "}
                            {s.reviews ? `已複習 ${s.reviews} 次` : "新收藏"}
                          </span>
                          <h3>{s.query}</h3>
                          <p>{s.meaning}</p>
                        </div>
                        <button
                          className="icon-btn"
                          aria-label={`查詢 ${s.query}`}
                          onClick={() => {
                            setView("lookup");
                            setQuery(s.query);
                            void runLookup(s.query);
                          }}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label={`移除收藏 ${s.query}`}
                          onClick={() => {
                            updateSaved(saved.filter((x) => x.id !== s.id));
                            notify("已移除這個收藏。");
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </article>
                    ))}
                </div>
              )}
            </section>
          )}
          {!quick && view === "learn" && (
            <section className="page">
              {!lesson ? (
                <>
                  <div className="page-kicker">ONE SMALL STEP AT A TIME.</div>
                  <h1>不急，慢慢學就會。</h1>
                  <p className="page-description">
                    從一句自我介紹，到一封自然的追蹤訊息。每天三分鐘，把英語用進生活裡。
                  </p>
                  <div className="path-progress">
                    <PixelAvatar kind={profile.avatar} size={42} />
                    <div>
                      <strong>{profile.name} 的英語小徑</strong>
                      <span>已完成 {completed} 課 · 從 A1 走向 B1</span>
                    </div>
                    <span>{progress}%</span>
                  </div>
                  <div className="lesson-path">
                    {lessons.map((l, i) => {
                      const done = profile.completedLessons.includes(l.id),
                        unlocked =
                          i === 0 ||
                          profile.completedLessons.includes(lessons[i - 1].id);
                      return (
                        <button
                          key={l.id}
                          className={`lesson-card ${done ? "done" : ""} ${unlocked ? "" : "locked"}`}
                          disabled={!unlocked}
                          onClick={() => startLesson(l)}
                        >
                          <span className="path-node">
                            {done ? (
                              <Check size={20} />
                            ) : (
                              String(i + 1).padStart(2, "0")
                            )}
                          </span>
                          <div>
                            <span className="small-overline">
                              {l.level} · {l.minutes} MIN
                            </span>
                            <h3>{l.title}</h3>
                            <p>{l.subtitle}</p>
                          </div>
                          <span>
                            {done
                              ? "再練一次"
                              : unlocked
                                ? "開始學習"
                                : "完成上一課後開啟"}
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="text-button"
                    onClick={() => setLesson(null)}
                  >
                    <ArrowLeft size={14} />
                    回到學習小徑
                  </button>
                  <div className="lesson-content">
                    <span className="lesson-level">
                      {lesson.level} · 約 {lesson.minutes} 分鐘
                    </span>
                    <h1>{lesson.title}</h1>
                    {question === -1 ? (
                      <>
                        <div className="pattern-box">
                          <span className="small-overline">
                            TODAY’S PATTERN
                          </span>
                          <h2>{lesson.pattern}</h2>
                          <p>{lesson.explanation}</p>
                        </div>
                        {lesson.examples.map((e) => (
                          <div className="lesson-example" key={e.en}>
                            <p>{e.en}</p>
                            <span>{e.zh}</span>
                            <button
                              aria-label={`朗讀 ${e.en}`}
                              className="icon-btn"
                              onClick={() => speak(e.en)}
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          className="primary-button"
                          onClick={() => {
                            setQuestion(0);
                            setAnswer(null);
                          }}
                        >
                          懂一點了，試試看
                          <ArrowRight size={16} />
                        </button>
                      </>
                    ) : question < lesson.questions.length ? (
                      <>
                        <span className="question-counter">
                          小練習 {question + 1} / {lesson.questions.length}
                        </span>
                        <h2 className="question-prompt">
                          {lesson.questions[question].prompt}
                        </h2>
                        <div className="answer-options">
                          {lesson.questions[question].options.map((opt, i) => (
                            <button
                              key={opt}
                              className={
                                answer === i
                                  ? i === lesson.questions[question].answer
                                    ? "correct"
                                    : "incorrect"
                                  : ""
                              }
                              disabled={answer !== null}
                              onClick={() => setAnswer(i)}
                            >
                              <span>{String.fromCharCode(65 + i)}</span>
                              {opt}
                              {answer === i &&
                                (i === lesson.questions[question].answer ? (
                                  <Check size={17} />
                                ) : (
                                  <RotateCcw size={17} />
                                ))}
                            </button>
                          ))}
                        </div>
                        {answer !== null && (
                          <div
                            className={`answer-note ${answer === lesson.questions[question].answer ? "correct" : ""}`}
                          >
                            <strong>
                              {answer === lesson.questions[question].answer
                                ? "答對了，你懂這個用法！"
                                : "差一點，再看一下這個地方。"}
                            </strong>
                            <p>{lesson.questions[question].why}</p>
                          </div>
                        )}
                        <button
                          className="primary-button"
                          disabled={answer === null}
                          onClick={nextQuestion}
                        >
                          {question + 1 === lesson.questions.length
                            ? "完成這次練習"
                            : "下一題"}
                          <ArrowRight size={15} />
                        </button>
                      </>
                    ) : (
                      <div className="lesson-finish">
                        <PixelAvatar kind={profile.avatar} size={76} />
                        <h2>
                          {profile.completedLessons.includes(lesson.id)
                            ? "又學會一點點了！"
                            : "先再練一次，讓這個用法更熟。"}
                        </h2>
                        <p>不需要一次懂所有事。今天記住一個用法，就很夠了。</p>
                        <button
                          className="primary-button"
                          onClick={() => startLesson(lesson)}
                        >
                          再練一次
                          <RotateCcw size={15} />
                        </button>
                        <button
                          className="text-button"
                          onClick={() => setLesson(null)}
                        >
                          回到小徑
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}
          {!quick && view === "room" && (
            <section className="page room-page">
              <div className="page-kicker">A SMALL PLACE FOR A BIG WORLD.</div>
              <h1>{profile.name} 的語言小書房</h1>
              <p className="page-description">
                這裡記得你遇過的字，也陪你慢慢學會。
              </p>
              <div className="big-room">
                <PixelRoom
                  name={profile.name}
                  books={saved.length}
                  avatar={profile.avatar}
                />
              </div>
              <div className="room-stats">
                <div>
                  <Star size={20} />
                  <strong>{saved.length}</strong>
                  <span>語言收藏</span>
                </div>
                <div>
                  <BookOpen size={20} />
                  <strong>{completed}</strong>
                  <span>已完成課程</span>
                </div>
                <div>
                  <Leaf size={20} />
                  <strong>
                    {profile.reviewLog.filter((r) => r.remembered).length}
                  </strong>
                  <span>想起來的片刻</span>
                </div>
              </div>
              <div className="room-customize">
                <h3>哪個小夥伴陪你學？</h3>
                <div>
                  {(["sprout", "cat", "fox"] as const).map((a) => (
                    <button
                      className={profile.avatar === a ? "selected" : ""}
                      key={a}
                      onClick={() => updateProfile({ avatar: a })}
                    >
                      <PixelAvatar kind={a} size={52} />
                      <span>
                        {a === "sprout"
                          ? "芽芽"
                          : a === "cat"
                            ? "小麥貓"
                            : "栗子狐"}
                      </span>
                      {profile.avatar === a && <Check size={15} />}
                    </button>
                  ))}
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setNameDraft(profile.name);
                    setModal("name");
                  }}
                >
                  換個名字
                  <Settings2 size={14} />
                </button>
              </div>
            </section>
          )}
          {!quick && view === "settings" && (
            <section className="page settings-page">
              <div className="page-kicker">MAKE YOURSELF AT HOME.</div>
              <h1>照你的步調，設定就好。</h1>
              <section className="settings-box">
                <h2>
                  <Keyboard size={18} />
                  桌面快查
                </h2>
                <div className="setting-row">
                  <div>
                    <strong>全域快捷鍵</strong>
                    <p>只在你按下快捷鍵或「貼上並快查」時讀取剪貼簿。</p>
                  </div>
                  <kbd>{shortcutLabel}</kbd>
                </div>
                <p className="help-note">
                  {desktop
                    ? "關閉視窗會縮到系統匣／選單列；請從選單選擇 Quit 結束程式。"
                    : "目前是瀏覽器預覽。全域快捷鍵、常駐選單與系統憑證儲存只在桌面版提供。"}
                </p>
              </section>
              <section className="settings-box">
                <h2>
                  <Cloud size={18} />
                  連線翻譯與文法
                </h2>
                <p>
                  開啟後，僅將你主動查詢的文字送到設定的翻譯服務；服務端再向 AI
                  供應商請求分析。離線查詢仍然優先。
                </p>
                <label className="field-label">
                  服務網址
                  <input
                    placeholder="https://your-quicksense-service.workers.dev"
                    value={profile.serviceUrl}
                    onChange={(e) =>
                      updateProfile({
                        serviceUrl: e.target.value,
                        allowOnline: false,
                      })
                    }
                  />
                </label>
                <label className="field-label">
                  服務通行碼
                  <input
                    type="password"
                    autoComplete="off"
                    value={serviceKey}
                    onChange={(e) => setServiceKey(e.target.value)}
                    placeholder={
                      desktop
                        ? "儲存在 Windows／macOS 系統憑證庫"
                        : "瀏覽器預覽只保留在目前分頁工作階段"
                    }
                  />
                </label>
                <button
                  className="outline-button"
                  onClick={async () => {
                    try {
                      validateServiceUrl(profile.serviceUrl);
                      if (serviceKey) await saveServiceKey(serviceKey);
                      else if (desktop) {
                        const has = await invoke<boolean>("has_service_key");
                        if (!has) {
                          notify("請先填入服務通行碼。");
                          return;
                        }
                      } else if (
                        !sessionStorage.getItem("quicksense.serviceKey")
                      ) {
                        notify("請先填入服務通行碼。");
                        return;
                      }
                      setServiceKey("");
                      setModal("online");
                    } catch {
                      notify("請使用 HTTPS 服務網址，並確認系統憑證庫可用。");
                    }
                  }}
                >
                  儲存並設定連線
                  <ArrowRight size={14} />
                </button>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.allowOnline}
                    onChange={(e) =>
                      e.target.checked
                        ? setModal("online")
                        : updateProfile({ allowOnline: false })
                    }
                  />
                  找不到離線結果時，自動使用連線服務
                </label>
              </section>
              <section className="settings-box">
                <h2>
                  <BookOpen size={18} />
                  離線資料包
                </h2>
                <div className="pack-row">
                  <span className="pack-icon">EN</span>
                  <div>
                    <strong>Open English WordNet 2025</strong>
                    <p>
                      {manifest
                        ? `${manifest.entries.toLocaleString()} 個詞條 · ${(manifest.bytes / 1048576).toFixed(1)} MiB · 英文辭義`
                        : "正在讀取資料包資訊…"}
                    </p>
                  </div>
                  <span className="pack-installed">
                    <Check size={13} />
                    已內建
                  </span>
                </div>
                <div className="pack-row">
                  <span className="pack-icon peach">世</span>
                  <div>
                    <strong>各國用語起步庫</strong>
                    <p>
                      {terms.length} 則獨立撰寫的用語筆記 · 含地區、語氣與例句
                    </p>
                  </div>
                  <span className="pack-installed">
                    <Check size={13} />
                    已內建
                  </span>
                </div>
                <p className="help-note">
                  尚未收錄所有國家與最新流行語。擴充資料以版本化資料包維護，不會自動下載大型模型。
                </p>
                <a
                  className="text-button"
                  href="https://github.com/globalwordnet/english-wordnet"
                  target="_blank"
                  rel="noreferrer"
                >
                  辭典來源與授權
                  <ExternalLink size={13} />
                </a>
              </section>
              <section className="settings-box">
                <h2>
                  <ShieldCheck size={18} />
                  你的資料，留在自己手上
                </h2>
                <p>
                  名字、收藏、課程進度與查詢紀錄保存在這台裝置。第一版沒有跨裝置同步，也不在背景監聽剪貼簿。連線結果只快取於目前工作階段。
                </p>
                <div className="settings-actions">
                  <button className="outline-button" onClick={exportData}>
                    <Download size={15} />
                    匯出學習備份
                  </button>
                  <button
                    className="outline-button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={15} />
                    匯入備份
                  </button>
                  <input
                    type="file"
                    ref={fileRef}
                    hidden
                    accept="application/json,.json"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void importData(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </section>
              <section className="codex-note">
                <Code2 size={22} />
                <div>
                  <h3>全程使用 Codex 設計與製作</h3>
                  <p>
                    Jerry 定義產品方向與審核成果，使用 Codex
                    協作完成研究、介面、程式、測試與文件。應用程式碼採 MIT
                    授權，辭典資料保留原始授權與署名。
                  </p>
                  <a href={repo} target="_blank" rel="noreferrer">
                    查看原始碼
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </section>
            </section>
          )}
          {!quick && (
            <footer>
              <span>
                <span className="footer-sprout">✿</span>慢慢學，也能懂得很多。
              </span>
              <div>
                <span>Windows + macOS</span>
                <span className="footer-divider" />
                <a href={repo} target="_blank" rel="noreferrer">
                  Built with Codex
                  <ArrowUpRight size={11} />
                </a>
              </div>
            </footer>
          )}
        </main>
      </div>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="關閉選單"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <dialog
        ref={dialogRef}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setModal(null);
        }}
      >
        <div className="dialog-content">
          <button
            className="dialog-close icon-btn"
            aria-label="關閉對話框"
            onClick={() => setModal(null)}
          >
            <X size={19} />
          </button>
          {modal === "name" && (
            <>
              <PixelAvatar kind={profile.avatar} size={60} />
              <div className="page-kicker">WELCOME TO YOUR LITTLE STUDY.</div>
              <h2>怎麼稱呼你呢？</h2>
              <p>給小書房一個名字，讓每次學習多一點熟悉感。</p>
              <label className="field-label">
                你的名字
                <input
                  autoFocus
                  value={nameDraft}
                  maxLength={24}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nameDraft.trim()) {
                      updateProfile({
                        name: nameDraft.trim(),
                        onboarded: true,
                      });
                      setModal(null);
                    }
                  }}
                />
              </label>
              <button
                className="primary-button"
                disabled={!nameDraft.trim()}
                onClick={() => {
                  updateProfile({ name: nameDraft.trim(), onboarded: true });
                  setModal(null);
                  notify(`歡迎回來，${nameDraft.trim()}。`);
                }}
              >
                這就是我的小書房
                <ArrowRight size={15} />
              </button>
            </>
          )}
          {modal === "online" && (
            <>
              <Cloud size={30} />
              <h2>把需要的內容，交給連線服務。</h2>
              <p>
                任意句子翻譯、文法與回覆建議會將你主動查詢的文字傳送至設定的服務及其
                AI 供應商。機密內容請依你的工作規範處理。
              </p>
              <div className="online-summary">
                <strong>目前服務</strong>
                <span>
                  {profile.serviceUrl ||
                    "尚未設定；先到偏好設定填入服務網址與通行碼。"}
                </span>
              </div>
              <p className="help-note">
                這裡不會要求把 AI
                供應商金鑰寫進應用程式。服務通行碼由服務管理者提供。
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  if (!profile.serviceUrl) {
                    setModal(null);
                    setView("settings");
                    return;
                  }
                  try {
                    validateServiceUrl(profile.serviceUrl);
                    updateProfile({ allowOnline: true });
                    setModal(null);
                    notify("已啟用連線分析；離線查詢仍優先。");
                  } catch {
                    notify("服務網址格式不正確。");
                  }
                }}
              >
                {profile.serviceUrl ? "了解並啟用" : "前往設定"}
                <ArrowRight size={15} />
              </button>
            </>
          )}
          {modal === "review" && (
            <>
              {reviewItem ? (
                <>
                  <div className="page-kicker">A LITTLE REMINDER.</div>
                  <span className="soft-tag">還有 {due.length} 個收藏</span>
                  <h2 className="review-question">{reviewItem.query}</h2>
                  {reviewReveal ? (
                    <div className="review-meaning">{reviewItem.meaning}</div>
                  ) : (
                    <p>這個內容，你還記得多少？先想一下，再翻開答案。</p>
                  )}
                  {!reviewReveal ? (
                    <button
                      className="primary-button"
                      onClick={() => setReviewReveal(true)}
                    >
                      看看意思
                      <ArrowDown size={15} />
                    </button>
                  ) : (
                    <div className="review-buttons">
                      <button
                        className="outline-button"
                        onClick={() => review(false)}
                      >
                        <RotateCcw size={15} />
                        還想再練
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => review(true)}
                      >
                        <Check size={16} />
                        我記得了
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <PixelAvatar kind={profile.avatar} size={68} />
                  <h2>今天先到這裡，剛剛好。</h2>
                  <p>
                    已經看完目前到期的收藏。記得的內容會晚一點再出現，需要再練的會提早回來。
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => setModal(null)}
                  >
                    回到小書房
                    <Leaf size={15} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </dialog>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
          <button aria-label="關閉提示" onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
function MessageIcon() {
  return <Languages size={24} />;
}
createRoot(document.getElementById("root")!).render(<App />);
