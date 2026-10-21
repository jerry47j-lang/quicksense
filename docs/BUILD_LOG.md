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
