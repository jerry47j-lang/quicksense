# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**すぐに意味がわかり、毎日少しずつ学べる。Windows と macOS の小さな語学書斎です。**

[デスクトッププレビューをダウンロード](https://github.com/jerry47j-lang/quicksense/releases) · [検証記録](docs/VALIDATION.md)

[はじめて使う方へ](docs/GETTING_STARTED.md#日本語)

![QuickSense の画面、現在は繁体字中国語](docs/images/desktop-preview.png)

文字をコピーし、Windows は **Ctrl+Shift+Space**、Mac は **Cmd+Shift+Space** を押すと小さな検索ウィンドウが開きます。自分の名前とピクセルキャラクターを設定し、実際に出会った表現を集めて学べます。

## 機能

- Open English WordNet 2025 に基づくオフライン英語辞典。127,311 見出し語、182,055 の保持語義、約 32.9 MiB。英語の語義説明であり、オフライン多言語翻訳モデルではありません。
- 複数地域の職場表現、略語、日常語、ネット用語の入門パック。繁体字中国語の説明、地域、語調、独自に書いた例文、参考リンクを掲載。
- 意味・語調、文法メモ、返信例のタブ。部分的な表現の説明と全文翻訳を区別します。
- 名前と 3 種類のピクセルキャラクター、保存、間隔反復、JSON バックアップとマージ読み込み、A1–B1 の職場英語レッスン 8 課。
- トレイ／メニューバーとクイック検索。ショートカットや貼り付けボタンを操作したときだけクリップボードを読みます。
- 任意のセルフホスト AI サービス。全文翻訳、文法、返信提案、認証と月額予算の事前確保制限を提供。

## 現在の制限

メイン UI とオフライン教材は現在、繁体字中国語です。オンラインサービスは原文・翻訳先の 12 言語に対応します。用語集は世界の最新流行語を網羅するものではなく、辞典は 2025 版に固定しています。

オンライン分析には別途サービス設定が必要で、API キーはアプリに含めません。Windows と Mac は GitHub Actions で個別にビルドします。ビルド成功は実機 UI 検証を意味しません。Mac アプリはアドホック署名のみで Apple の公証は未取得です。OS の安全警告を回避しないでください。

## 開発と配布

Node.js 22.12 以上が必要です。ネイティブビルドには Rust 1.90 以上と [Tauri の事前準備](https://v2.tauri.app/start/prerequisites/)も必要です。

```sh
npm ci
npm run check
npm run dev
npm run desktop
npm run desktop:build
```

`dev` はブラウザープレビュー、`desktop` は実際のデスクトップシェルです。辞典は同梱しています。`npm run dictionary:build` で公式データから再生成でき、元ファイルの SHA-256 を manifest に記録します。

[サービス設定手順](docs/TRANSLATION_SERVICE.md)に従い、D1 予算 DB とサーバーの秘密値 `OPENAI_API_KEY`、`SERVICE_ACCESS_KEY` を設定してください。アプリの設定でサービス URL とアクセスキーを入力し、データ送信の説明を確認して有効化します。デスクトップのキーは OS 資格情報ストア、ブラウザープレビューは現在のセッション内だけに保存します。

## Codex による制作と貢献

Jerry が方向性を定めて成果をレビューし、調査、設計、実装、テスト、文書の全工程で Codex を活用しています。[開発記録](docs/BUILD_LOG.md)と[検証状況](docs/VALIDATION.md)をご覧ください。

用語の追加には言語・地域、語調、参考資料、独自の例文、整理日を添えてください。[問題報告](https://github.com/jerry47j-lang/quicksense/issues/new/choose)。コードは MIT、辞典は CC BY 4.0 と元の Princeton WordNet 条項に従います。[第三者の表示とライセンス](THIRD_PARTY_NOTICES.md)。個人の学習データはコミットしません。
