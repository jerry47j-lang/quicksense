# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**Understand quickly. Learn a little every day.**

[Open the free app](https://jerry47j-lang.github.io/quicksense/) · [Desktop developer previews](https://github.com/jerry47j-lang/quicksense/releases) · [Validation](docs/VALIDATION.md)

Use the browser app on Windows or macOS without installation, an account, API keys or a paid backend. The current UI and learning notes are Traditional Chinese. Four README languages do not imply four fully localized interfaces.

![Actual public app](docs/images/free-web-app.png)

## First minute

1. Choose **先試一次：deadline** (try deadline) to see its Chinese meaning. Pick a name later.
2. Paste a word or sentence into **查詢文字** and click **快懂一下**. Chinese input automatically targets English; other input targets Traditional Chinese. You can select a target manually.
3. For an arbitrary sentence, click **在 Google 翻譯開啟**. The official Google Translate website opens in a new tab with your submitted text and selected language. QuickSense retains your input. This is an explicit external website handoff, not an embedded free AI API. Only clicking the link sends text to Google; avoid confidential work material.
4. Save a dictionary result, or paste a checked translation back with **把確認過的翻譯存回來**. Review under **我的單字庫**, learn under **學習小徑**.

If clipboard access fails, paste directly with Ctrl+V / Cmd+V. If dictionary loading fails, your input stays and retry/external translation remain available. No payment is requested.

## Free features and limits

- ECDICT English→Traditional Chinese: **140,390 headwords / 177,494 lookup forms**, 19.2 MiB. WordNet 2025: **127,311 English headwords**, 32.9 MiB. Files load by initial; **偏好設定** can save both complete offline packs, about **52.1 MiB** uncompressed. First visit/download needs a connection; browser storage may be evicted. Native packages include the files.
- **62 regional usage notes** across several countries/languages with register, original examples and references. Historical dictionary data and this starter pack are not a complete/current global slang feed.
- Eight ordered A1–B1 workplace lessons, local collections, spaced review, JSON backup/import, name and pixel companions. No account sync; back up before changing devices/origins or clearing browser data.
- PWA installation where supported by the browser. It does not add native tray/global shortcuts.

The target dropdown controls external translation, not the existing Chinese notes. Arbitrary grammar correction and generated AI replies are not included in the free offline engine. The public app never calls the optional paid service or asks for service passwords. Advanced native users can separately deploy the [optional AI service](docs/TRANSLATION_SERVICE.md), requiring secrets and potentially incurring costs.

## Desktop status

Windows x64, Mac Apple Silicon and Mac Intel remain **developer previews**. CI build success is separate from physical-device shortcut/tray/keyring acceptance, which is pending. Windows is unsigned; Mac is ad-hoc signed, not notarized. If installation is blocked, use the free web app and keep OS protections enabled.

## Develop and deploy

Node.js 22.12+; native builds also need Rust 1.90+ and [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

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

Enable Pages with GitHub Actions as its source; use '.github/workflows/pages.yml'. For another repository name, change 'vite.config.ts' base. Dictionaries are included; rebuild with 'npm run dictionary:build' and 'npm run dictionary:bilingual'. Public Pages is free subject to [GitHub limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits); Google availability is outside this project's control.

## Built throughout with Codex

Jerry sets the product direction and reviews results. Codex is used throughout research, interaction design, implementation, tests and documentation. [BUILD_LOG](docs/BUILD_LOG.md) and [VALIDATION](docs/VALIDATION.md) record evidence and pending checks. No completed novice studies or physical-device tests are invented.

## Help and license

[Four-language troubleshooting](docs/GETTING_STARTED.md) · [FAQ and privacy](docs/FAQ_PRIVACY.md) · [Report a problem](https://github.com/jerry47j-lang/quicksense/issues/new/choose). Include browser/version and reproduction steps; omit private content. Regional contributions need locale, register, reference and a dated original example.

Code MIT, ECDICT MIT, WordNet CC BY 4.0 plus underlying Princeton terms. See [notices](THIRD_PARTY_NOTICES.md). No personal queries are committed.
