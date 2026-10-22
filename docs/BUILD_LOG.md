# Build log

## 2026-10-21 — first working preview

Jerry defined the direction: a quick, approachable desktop language companion that fits working hours, with global regional expressions, progressive English practice, a personal pixel study, and Windows/macOS support.

Codex carried out source research, interface design, TypeScript/React implementation, the Tauri desktop shell, dictionary conversion, the optional translation service, tests and these documents. This log describes actual work; it is not a claim of independent native-speaker review, user research results or verified production usage.

Concrete design decisions:

- A small shortcut-driven lookup window keeps a full study dashboard out of the way during work. Clipboard access happens only on explicit user actions.
- A 32.9 MiB English dictionary is shipped locally. A large multilingual translation model is not bundled; arbitrary translation uses an optional authenticated service.
- Regional phrases carry country/context/register notes. Partial phrase matches never present themselves as full sentence translations.
- Pixel artwork is drawn in SVG. Body text stays readable; pixel styling is reserved for the room, icon and accents.
- Name, companion, saved words and eight lesson stages persist locally. Progress comes from answered questions rather than decorative fake statistics.
- AI output is checked against a structured contract, and a database reservation gate limits requests before spending.
- Separate Windows, Apple Silicon and Intel macOS builds are required. Native build success, native visual testing and code signing are recorded separately.
- The verified CI-generated Rust lockfile is retained with the source, and runtime JavaScript licenses are included in desktop assets. Four README entries link to actual interface screenshots and shared validation records.

See [VALIDATION](VALIDATION.md) for the checks actually completed and outstanding work. No external design/test participants, demo video, public-user counts or Codex application acceptance are claimed.

## 2026-10-22 — free first-use path

Jerry asked whether GitHub visitors could use the app immediately, and requested a free way to prevent first-use frustration. Codex found three barriers: English-only definitions, installer signing friction, and service setup required for arbitrary translation.

- Published the same app through free public GitHub Pages: no account, installation, key or paid backend. Public browser mode never calls the optional paid service, even with old stored service preferences.
- Added a pinned MIT ECDICT companion, converted with OpenCC: 140,390 Traditional Chinese headwords / 177,494 lookup forms. WordNet remains separately credited.
- Put the first meaning beside the input, kept the pixel room compact, and added a three-step example without forced naming. Public browser testing caught a clipped Settings entry on 720px-high displays; the tip now collapses and the sidebar scrolls.
- Added explicit Google Translate handoff, Chinese→English/other→Traditional Chinese defaults, manual language choice, clipboard fallback and user-confirmed translation notes. No unofficial API or invented full-sentence result.
- Added worker shell/dictionary caching and cancellable full-pack download. Success requires verifying all 56 cached entries. External/non-GET requests are excluded. Storage failures keep the current session usable and prompt backup.
- Updated four equivalent README guides, troubleshooting and privacy. Native packages remain developer previews; no paid hosting, provider call, signing or notarization was purchased.

See VALIDATION for actual evidence. Developer QA is not claimed as a five-person novice study or physical-device acceptance.
