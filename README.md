# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**Understand quickly. Learn a little every day.**

A quiet desktop language companion for Windows and macOS. Copy an unfamiliar expression, press **Ctrl+Shift+Space** (Windows) or **Cmd+Shift+Space** (macOS), and look it up in a small window. Your own pixel study, name and character make the learning space yours.

## What works in this version

- Offline English dictionary: **127,311 headwords**, 182,055 retained senses, **32.9 MiB** of letter-indexed JSON from Open English WordNet 2025. English definitions; this is not an offline bilingual translation model.
- A starter collection of regional expressions, workplace phrases and abbreviations across multiple languages. Independently written Traditional Chinese notes explain register and context; examples are original.
- Three lookup tabs: meaning/register, grammar notes, and example replies. Phrase matches are explicitly distinguished from complete sentence translations.
- Personal name, three pixel companions, saved words, spaced review, JSON backup/import, and eight ordered A1–B1 workplace lessons.
- Desktop tray/menu-bar entry, a quick lookup window and user-triggered clipboard access. No background clipboard monitoring.
- Optional self-hosted AI translation service for arbitrary sentences, grammar and suggested replies, with authentication and a monthly spending reservation gate.

## Current boundaries

The main interface and offline learning explanations are in Traditional Chinese. The online service accepts 12 source/target language choices. This is a starter regional-expression pack, **not an exhaustive or automatically current global slang archive**. The dictionary source is the pinned 2025 edition.

Online analysis requires a configured service. No provider API key is shipped in the app. Windows/macOS installers are built independently in GitHub Actions; build success does not imply native visual or signed-release verification. macOS bundles are ad-hoc signed, not notarized. Do not bypass OS security warnings.

## Develop

Node.js 22.12+ is required. Native builds additionally require Rust 1.90+ and the [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run check
npm run dev           # browser UI preview, port 5186
npm run desktop       # real desktop shell
npm run desktop:build # native installer for the host platform
```

The dictionary is already included. To rebuild it from the official release:

```sh
npm run dictionary:build
```

This downloads the 2025 archive from `en-word.net`, records its SHA-256 in the manifest and converts it into letter-indexed files. It retains up to 12 senses and two examples per sense. It does not copy Wiktionary page content into the expression pack.

## Optional translation service

See [the deployment guide](docs/TRANSLATION_SERVICE.md). Configure `OPENAI_API_KEY` and `SERVICE_ACCESS_KEY` as server secrets, create/apply the D1 budget database, and deploy the Worker. Enter the service URL and service access key in app preferences and explicitly enable online analysis. Desktop service access keys use the Windows/macOS credential store; browser previews keep them only in the current session.

## Built throughout with Codex

Jerry sets the product direction and reviews the results. Codex is used throughout research, interaction design, implementation, tests and documentation. Third-party frameworks and dictionary data remain credited. See [BUILD_LOG](docs/BUILD_LOG.md) and [VALIDATION](docs/VALIDATION.md) for concrete evidence and outstanding checks.

## Contribute and license

Regional usage varies. Contributions should include a reference, locale, register, original example and a dated note. Report incorrect explanations through the [issue form](https://github.com/jerry47j-lang/quicksense/issues/new/choose).

Application code: MIT. Open English WordNet: CC BY 4.0 plus underlying Princeton WordNet terms; see [notices](THIRD_PARTY_NOTICES.md). No user queries or personal study data are committed to this repository.
