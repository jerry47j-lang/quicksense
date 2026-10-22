import { ExternalLink, ClipboardPaste, BookMarked } from "lucide-react";
import { freeTranslationUrl } from "../lib/free-translation";
import type { Language } from "../types";
export function FreeTranslation({
  text,
  source,
  target,
  onCopy,
  onSave,
}: {
  text: string;
  source: Language | "auto";
  target: Language;
  onCopy: () => void;
  onSave: () => void;
}) {
  let href = "";
  try {
    href = freeTranslationUrl(text, source, target);
  } catch {}
  return (
    <div className="free-translation">
      <span className="soft-tag">免費 · 不用帳號或 API 金鑰</span>
      <h3>整句翻譯，接著這樣做。</h3>
      <p>
        開啟 Google
        翻譯，會帶上這段文字與你選的語言。翻譯在新分頁進行，快懂會保留目前內容。
      </p>
      {href ? (
        <a
          className="primary-button"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          在 Google 翻譯開啟
          <ExternalLink size={15} />
        </a>
      ) : (
        <p className="partial-note">
          一次最多帶入 5,000 字，請將內容分段。你也可以先複製文字。
        </p>
      )}
      <div className="free-actions">
        <button className="text-button" onClick={onCopy}>
          <ClipboardPaste size={14} />
          複製原文
        </button>
        <button className="text-button" onClick={onSave}>
          <BookMarked size={14} />
          把確認過的翻譯存回來
        </button>
      </div>
      <small>
        只有按下外部翻譯連結才會把文字交給
        Google。需要網路；離線英漢查字與小課不需要翻譯服務。
      </small>
    </div>
  );
}
