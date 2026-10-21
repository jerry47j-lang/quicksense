# QuickSense 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**快快看懂，慢慢學會。你的 Windows／macOS 語言小書房。**

複製看不懂的外文，按 Windows 的 **Ctrl+Shift+Space** 或 macOS 的 **Cmd+Shift+Space**，就能在小窗查詢。設定自己的名字與像素夥伴，從每天真正遇到的內容開始學習。

## 這一版提供什麼

- 127,311 個英文詞條、182,055 個保留詞義，約 32.9 MiB。資料採 Open English WordNet 2025，按字首載入；這是英文辭義，不是離線多國翻譯模型。
- 多國用語起步庫：包含職場縮寫、日常口語與網路用語，附地區、語氣、繁中說明、原創例句與參考連結。
- 意思與語氣、文法筆記、參考回覆；只辨識到片語時會清楚標示，不假裝完成整句翻譯。
- 個人名字、三個像素夥伴、收藏、間隔複習、JSON 備份合併，以及八段 A1 到 B1 的職場英語課程。
- 系統匣／選單列常駐與快查小窗；只在你操作快捷鍵或貼上按鈕時讀剪貼簿。
- 可選的自架 AI 翻譯服務：支援任意句子、文法與回覆建議，包含身分驗證和每月用量預留機制。

## 狀態與限制

主介面與離線教材目前是繁體中文，連線服務提供十二種來源／目標語言選項。用語庫不是完整的全球流行語排名，也沒有自動追蹤所有新詞。英文辭典固定為 2025 版。

連線分析需先設定服務；應用程式不含 AI 供應商金鑰。Windows 與 Mac 分別在 GitHub Actions 打包，打包通過不等於實機介面驗證。Mac 建置使用臨時簽署，尚未取得 Apple 公證；請勿略過系統安全警告。

## 開發與建置

安裝 Node.js 22.12 以上。桌面建置另需 Rust 1.90 以上與 [Tauri 系統需求](https://v2.tauri.app/start/prerequisites/)。

```sh
npm ci
npm run check
npm run dev
npm run desktop
npm run desktop:build
```

`npm run dev` 是瀏覽器預覽；`npm run desktop` 才會啟動原生桌面外殼。辭典已內建；`npm run dictionary:build` 可從官方來源重新下載並轉換，來源 SHA-256 記錄在 manifest。

## 設定翻譯服務

依 [部署說明](docs/TRANSLATION_SERVICE.md) 建立 D1 資料庫、設定服務端 `OPENAI_API_KEY` 與 `SERVICE_ACCESS_KEY`，再部署 Worker。在偏好設定填服務網址與通行碼，閱讀資料傳送說明後啟用。桌面通行碼存在系統憑證庫；瀏覽器預覽僅保留在目前工作階段。

## 全程使用 Codex

Jerry 定義方向並審核成果，Codex 協作完成需求研究、互動設計、程式、測試與文件。實際紀錄見 [開發紀錄](docs/BUILD_LOG.md) 與 [驗證狀態](docs/VALIDATION.md)，不虛構使用者成效。

## 貢獻與授權

新增用語請附語言／地區、場合、參考來源、原創例句及整理日期。[回報問題](https://github.com/jerry47j-lang/quicksense/issues/new/choose)。程式採 MIT；辭典採 CC BY 4.0 與原始 Princeton WordNet 條款，詳見 [第三方聲明](THIRD_PARTY_NOTICES.md)。個人查詢與學習紀錄不會提交到儲存庫。
