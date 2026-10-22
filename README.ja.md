# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**すぐ理解して、毎日少しずつ学ぶ。**

[無料アプリを開く](https://jerry47j-lang.github.io/quicksense/) · [デスクトップ開発プレビュー](https://github.com/jerry47j-lang/quicksense/releases) · [検証記録](docs/VALIDATION.md)

Windows・macOSのブラウザで、インストール・アカウント・APIキー・有料バックエンド不要です。現在のUIと学習解説は繁体字中国語です。4言語のREADMEはUI全体の翻訳完了を意味しません。

![実際の公開アプリ](docs/images/free-web-app.png)

## 最初の1分

1. **先試一次：deadline**で中国語の意味を表示します。名前は後から設定できます。
2. **查詢文字**に単語や文を貼り付け、**快懂一下**を押します。中国語入力は英語、その他は繁体字中国語が既定の翻訳先で、手動変更も可能です。
3. 任意の文は**在 Google 翻譯開啟**で、入力と選択言語を渡した公式Google翻訳を新しいタブで開きます。原文は残ります。内蔵無料AIや非公式APIではなく外部サイトへの明示的なリンクです。クリック時だけGoogleに送信するため、未許可の機密は送らないでください。
4. 語義を保存するか、**把確認過的翻譯存回來**で確認済みの訳を貼り戻します。**我的單字庫**で復習、**學習小徑**で学習できます。

貼り付け権限が使えなければCtrl+V / Cmd+Vで直接入力します。読み込み失敗でも入力を残し、再試行と外部翻訳を案内します。支払いは要求しません。

## 無料機能と制限

- ECDICT英中辞典 **140,390見出し語／177,494検索形、19.2 MiB**。WordNet 2025英語辞典 **127,311見出し語、32.9 MiB**。頭文字単位で取得し、**偏好設定**から全オフライン資料（非圧縮約 **52.1 MiB**）を保存できます。初回接続／ダウンロードはオンラインが必要で、ブラウザがキャッシュを削除する場合があります。ネイティブ版は辞典を同梱します。
- 複数の国の地域表現 **62件**、語調・独自例文・参照先つき。歴史的辞典と入門資料であり、世界の最新流行語を網羅するリアルタイム一覧ではありません。
- A1–B1職場英語8段階、ローカル保存・間隔復習・JSONバックアップ／読み込み、名前とピクセルキャラクター。アカウント同期はありません。端末／URL変更やデータ消去前に保存してください。
- 対応ブラウザのPWAインストール。ネイティブのトレイ／グローバルショートカットは含みません。

翻訳先は外部翻訳に適用され、既存の中国語メモは変わりません。自由文の文法修正とAI返信生成は無料オフラインエンジンに含みません。公開版はサービスのパスワードを集めず有料サービスも呼び出しません。上級ネイティブ利用者は[任意のAIサービス](docs/TRANSLATION_SERVICE.md)を配置できますが、キーと費用が必要になる場合があります。

## デスクトップの状態

Windows x64、Mac Apple Silicon、Mac Intelは開発プレビューです。CIと実機のショートカット・トレイ・認証情報ストアの検証は別で、後者は未完了です。Windows正式署名、Apple公証は未完了で拒否される場合があります。OS保護を維持し、無料Web版を使ってください。

## 開発と配置

Node.js 22.12+、ネイティブにはRust 1.90+と[Tauri環境](https://v2.tauri.app/start/prerequisites/)が必要です。

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

PagesのソースをGitHub Actionsに設定し、'.github/workflows/pages.yml'で配置します。別のリポジトリ名では'vite.config.ts'のbaseを変更します。辞典は同梱済みで、再生成は'npm run dictionary:build'と'npm run dictionary:bilingual'です。無料公開Pagesにも[利用量上限](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)があり、外部Googleの稼働は本プロジェクトで制御できません。

## 全工程でCodexを使用

Jerryが方向を定め成果を確認し、Codexと調査・操作設計・開発・テスト・文書作成を進めています。[BUILD_LOG](docs/BUILD_LOG.md)と[VALIDATION](docs/VALIDATION.md)に根拠と残る検証を記録します。未実施の初心者／実機テストを完了と表示しません。

## サポートとライセンス

[トラブル対応](docs/GETTING_STARTED.md) · [FAQとプライバシー](docs/FAQ_PRIVACY.md) · [不具合報告](https://github.com/jerry47j-lang/quicksense/issues/new/choose)。ブラウザ・バージョン・再現手順を記載し、機密は除いてください。地域表現の投稿には地域・語調・出典・日付つき独自例文が必要です。

コードMIT、ECDICT MIT、WordNet CC BY 4.0とPrinceton条項。[権利表記](THIRD_PARTY_NOTICES.md)を確認してください。個人の検索はコミットしません。
