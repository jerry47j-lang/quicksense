import type { Lesson } from "../types";
export const lessons: Lesson[] = [
  {
    id: "introduce",
    level: "A1",
    title: "從一句自我介紹開始",
    subtitle: "把主詞、be 動詞和身分接起來。",
    minutes: 3,
    pattern: "I am + 身分／狀態",
    explanation:
      "I 搭配 am，you 搭配 are，he / she / it 搭配 is。先說清楚「誰，現在是什麼狀態」。",
    examples: [
      { en: "I'm new to the team.", zh: "我是團隊的新成員。" },
      { en: "The report is ready.", zh: "報告準備好了。" },
    ],
    questions: [
      {
        prompt: "I ___ happy to join the team.",
        options: ["am", "is", "are"],
        answer: 0,
        why: "主詞是 I，be 動詞使用 am。",
      },
      {
        prompt: "The meeting ___ at ten.",
        options: ["am", "is", "are"],
        answer: 1,
        why: "The meeting 是單數，用 is。",
      },
    ],
  },
  {
    id: "simple-present",
    level: "A1",
    title: "說說你平常的工作",
    subtitle: "用現在簡單式，表達習慣與日常。",
    minutes: 3,
    pattern: "主詞 + 原形動詞（第三人稱單數加 -s）",
    explanation:
      "固定的習慣、工作內容與一般事實常用現在簡單式。he / she / it 的動詞通常加 -s。",
    examples: [
      { en: "I check my email every morning.", zh: "我每天早上查看郵件。" },
      { en: "She works with the design team.", zh: "她與設計團隊合作。" },
    ],
    questions: [
      {
        prompt: "He ___ the weekly report.",
        options: ["write", "writes", "writing"],
        answer: 1,
        why: "He 是第三人稱單數，write 要變成 writes。",
      },
      {
        prompt: "I ___ with customers every day.",
        options: ["speak", "speaks", "speaking"],
        answer: 0,
        why: "I 搭配原形動詞 speak。",
      },
    ],
  },
  {
    id: "polite-request",
    level: "A2",
    title: "請同事幫忙，怎麼說自然？",
    subtitle: "Could you…? 比直接下命令更客氣。",
    minutes: 3,
    pattern: "Could you + 原形動詞 + …?",
    explanation:
      "Could you 用來提出禮貌的請求。後面接動詞原形；不是在問過去發生的事。",
    examples: [
      { en: "Could you send me the file?", zh: "可以請你把檔案寄給我嗎？" },
      {
        en: "Could you give me a little more time?",
        zh: "可以再給我一點時間嗎？",
      },
    ],
    questions: [
      {
        prompt: "Could you ___ the document?",
        options: ["review", "reviewed", "reviews"],
        answer: 0,
        why: "情態動詞 could 後面接原形動詞 review。",
      },
      {
        prompt: "哪一句適合請同事幫忙？",
        options: [
          "Send the file now.",
          "Could you send me the file?",
          "You sending file?",
        ],
        answer: 1,
        why: "Could you…? 是清楚且禮貌的請求。",
      },
    ],
  },
  {
    id: "progress",
    level: "A2",
    title: "回報現在進行到哪裡",
    subtitle: "現在進行式，說明正在做的事。",
    minutes: 3,
    pattern: "am / is / are + 動詞 -ing",
    explanation:
      "描述正在進行、尚未完成的動作。搭配 currently 或 right now，能讓狀態更清楚。",
    examples: [
      { en: "I'm working on the proposal.", zh: "我正在處理提案。" },
      { en: "We're reviewing your feedback.", zh: "我們正在檢視你的回饋。" },
    ],
    questions: [
      {
        prompt: "We're ___ the results.",
        options: ["review", "reviewing", "reviewed"],
        answer: 1,
        why: "are 後接 -ing，形成現在進行式。",
      },
      {
        prompt: "I ___ preparing the slides.",
        options: ["am", "is", "be"],
        answer: 0,
        why: "主詞 I 搭配 am。",
      },
    ],
  },
  {
    id: "deadline",
    level: "A2",
    title: "說清楚截止時間",
    subtitle: "分清楚 by 和 until。",
    minutes: 3,
    pattern: "by + 截止時間 ／ until + 持續到的時間",
    explanation:
      "by 表示「最晚在某時之前完成」；until 表示「一個狀態持續到某時」。",
    examples: [
      { en: "I'll send it by Friday.", zh: "我最晚會在星期五寄出。" },
      { en: "I'll be in the office until five.", zh: "我會在辦公室待到五點。" },
    ],
    questions: [
      {
        prompt: "Please submit the report ___ noon.",
        options: ["by", "until", "during"],
        answer: 0,
        why: "繳交報告是要在截止時間前完成，用 by。",
      },
      {
        prompt: "I'll stay here ___ 6 p.m.",
        options: ["by", "until", "for"],
        answer: 1,
        why: "stay 是持續的狀態，用 until 表示持續到六點。",
      },
    ],
  },
  {
    id: "clarify",
    level: "B1",
    title: "聽不懂時，從容地確認",
    subtitle: "用間接問句把意思問清楚。",
    minutes: 3,
    pattern: "Could you clarify + what / how + 主詞 + 動詞?",
    explanation:
      "間接問句的內部使用直述語序。例如 what you mean，不是 what do you mean。",
    examples: [
      {
        en: "Could you clarify what you mean?",
        zh: "可以請你說明一下你的意思嗎？",
      },
      {
        en: "Could you explain how this works?",
        zh: "可以請你解釋這個怎麼運作嗎？",
      },
    ],
    questions: [
      {
        prompt: "Could you explain ___?",
        options: ["how does it work", "how it works", "how work it"],
        answer: 1,
        why: "間接問句用主詞 it 在動詞 works 前的直述語序。",
      },
      {
        prompt: "Could you clarify what ___?",
        options: ["do you mean", "you mean", "mean you"],
        answer: 1,
        why: "what you mean 是間接問句的正確語序。",
      },
    ],
  },
  {
    id: "condition",
    level: "B1",
    title: "安排下一步與備案",
    subtitle: "第一類條件句，說可能發生的事。",
    minutes: 3,
    pattern: "If + 現在簡單式, will + 原形動詞",
    explanation:
      "談未來可能的條件與結果時，if 子句通常用現在式；結果子句可用 will。",
    examples: [
      {
        en: "If we finish early, we'll review it today.",
        zh: "如果提早完成，我們今天就檢視。",
      },
      {
        en: "If you need help, I'll be available.",
        zh: "如果你需要幫忙，我會在。",
      },
    ],
    questions: [
      {
        prompt: "If it ___, we will meet online.",
        options: ["rains", "will rain", "raining"],
        answer: 0,
        why: "第一類條件句的 if 子句通常使用現在簡單式。",
      },
      {
        prompt: "If you send the file, I ___ it.",
        options: ["will review", "reviewing", "reviewed"],
        answer: 0,
        why: "結果子句用 will + 原形動詞表達未來行動。",
      },
    ],
  },
  {
    id: "followup",
    level: "B1",
    title: "禮貌追蹤，不讓對方有壓力",
    subtitle: "用過去式與間接語氣提出請求。",
    minutes: 3,
    pattern: "I was wondering if + 主詞 + could + 原形動詞",
    explanation:
      "I was wondering if… 常用來柔化請求。這裡的過去式讓語氣更婉轉，不一定指過去的事情。",
    examples: [
      {
        en: "I was wondering if you could share an update.",
        zh: "想請問你是否方便提供最新進度。",
      },
      {
        en: "I just wanted to follow up on my previous email.",
        zh: "想再追蹤一下先前那封郵件。",
      },
    ],
    questions: [
      {
        prompt: "I was wondering if you could ___ an update.",
        options: ["share", "shared", "shares"],
        answer: 0,
        why: "could 後面使用動詞原形 share。",
      },
      {
        prompt: "哪一句比較婉轉？",
        options: [
          "Why no reply?",
          "I was wondering if you could share an update.",
          "Reply immediately.",
        ],
        answer: 1,
        why: "婉轉的開場搭配 could，適合職場追蹤。",
      },
    ],
  },
];
