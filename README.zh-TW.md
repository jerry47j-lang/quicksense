# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**快快看懂，慢慢學會。**

[直接免費使用](https://jerry47j-lang.github.io/quicksense/) · [桌面開發預覽版](https://github.com/jerry47j-lang/quicksense/releases) · [驗證紀錄](docs/VALIDATION.md)

Windows、macOS 都能先用網頁版，不用安裝、帳號、API 金鑰或付費後端。現階段介面與學習筆記為繁體中文；四語 README 不代表介面已完整四語化。

![實際公開版](docs/images/inline-translation.png)

## 一分鐘開始

1. 按「先試一次：deadline」，直接看中文意思，名字稍後再取。
2. 在「查詢文字」貼入單字或句子，按「翻譯／查字」。中文自動轉英文，其他來源預設轉繁中，也能手動選擇。
3. 首次按「啟用免費整句翻譯」，閱讀 MyMemory 資料與額度說明並同意後，整句譯文直接顯示在快懂。勾選「停筆 1 秒自動翻譯／查字」，打完後不用按按鈕；取消勾選則按「翻譯／查字」手動處理。自動模式切換來源或目標也會更新。Google 翻譯保留為明確標示的外部備用入口。
4. 收藏字義，或按「把確認過的翻譯存回來」貼回核對過的結果，到「我的單字庫」複習、「學習小徑」學習。

貼上權限失敗時直接 Ctrl+V／Cmd+V。辭庫載入失敗會保留文字，提供重試與外部翻譯，不要求付款。

## 免費功能與限制

- ECDICT 英漢辭庫 **140,390 詞條／177,494 查詢形式，19.2 MiB**；WordNet 2025 **127,311 英文詞條，32.9 MiB**。依字首載入；「偏好設定」可下載完整離線包，未壓縮約 **52.1 MiB**。首次使用／下載需連線，瀏覽器可能回收快取；原生桌面包已包含資料。
- **62 則各國用語筆記**，附語氣、原創例句及參考來源。歷史辭典與入門包不保證涵蓋所有最新全球流行語。
- 八段 A1–B1 職場課程、收藏、間隔複習、JSON 備份／匯入、名字及像素夥伴。無帳號同步，切換裝置／網址或清除資料前先備份。
- 支援 PWA 的瀏覽器可加入桌面；不含原生常駐選單及全域快捷鍵。

翻譯目標控制外部翻譯，不會重寫繁中筆記。免費離線引擎不包含任意句子的文法校正及 AI 回覆生成。公開網頁版不收服務通行碼，也不呼叫選用付費服務。進階桌面使用者可自架[選用 AI 服務](docs/TRANSLATION_SERVICE.md)，需要密鑰且可能產生費用。

畫面內翻譯使用官方 MyMemory API，匿名上限為服務按網路 IP 計算的**每日 5,000 字元**，程式也限制本機請求量；辦公室可能共用額度。達限不自動付費。**首次同意後**才將文字與語言交給 MyMemory；啟用自動模式時停筆後送出。服務可能長期保留查詢，勿輸入機密；可在偏好設定停用。譯文僅工作階段快取，備份不轉移同意設定。短句／混合語言可能誤判，請手選來源。見[額度](https://mymemory.translated.net/doc/usagelimits.php)及[資料條款](https://mymemory.translated.net/terms-and-conditions)。

## 桌面版狀態

Windows x64、Mac Apple Silicon、Mac Intel 仍為開發預覽版。CI 建置成功與實機快捷鍵／常駐選單／憑證庫驗收分開記錄；後者待完成。Windows 尚未正式簽章、Mac 尚未 Apple 公證，遭系統阻擋時先用免費網頁版，保留系統安全保護。

## 開發與部署

需要 Node.js 22.12+；原生建置另需 Rust 1.90+ 與 [Tauri 環境](https://v2.tauri.app/start/prerequisites/)。

```sh
npm ci
npm run check
npm run dev
npm run build
node scripts/verify-dist.mjs
node scripts/verify-offline.mjs
npm run desktop
npm run desktop:build
```

Pages 來源選 GitHub Actions，使用 '.github/workflows/pages.yml'。不同儲存庫名稱須修改 'vite.config.ts' 的 base。辭庫已內附，重建命令為 'npm run dictionary:build' 及 'npm run dictionary:bilingual'。免費公開 Pages 仍有 [GitHub 使用量上限](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)，外部 Google 的可用性不由本專案控制。

## 全程使用 Codex 製作

由 Jerry 定義產品方向與審核成果，全程使用 Codex 協作完成需求研究、互動設計、程式開發、測試與文件。[BUILD_LOG](docs/BUILD_LOG.md) 與 [VALIDATION](docs/VALIDATION.md) 記錄證據及待完成事項，不編造新手測試或實機驗收結果。

## 協助與授權

[四語疑難排解](docs/GETTING_STARTED.md) · [常見問題與隱私](docs/FAQ_PRIVACY.md) · [回報問題](https://github.com/jerry47j-lang/quicksense/issues/new/choose)。請附瀏覽器／版本與重現步驟，勿附機密內容。用語投稿需地區、語氣、來源及帶日期的原創例句。

程式 MIT、ECDICT MIT、WordNet CC BY 4.0 並保留 Princeton 條款，見[第三方聲明](THIRD_PARTY_NOTICES.md)。不提交個人查詢。
