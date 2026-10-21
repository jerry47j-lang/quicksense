# Validation record

Status: preview under verification, 2026-10-21.

## Automated

- TypeScript checks and unit tests cover phrase boundaries, Unicode normalization, source-language filters, English dictionary fallback, unsafe dictionary property names, review intervals, backup import/export, ordered lessons and translation input/output contracts.
- `npm run build` generates the production frontend.
- GitHub Actions independently builds Windows x64, macOS Apple Silicon and macOS Intel installers. See the repository Actions page for current outcomes.

## Browser interaction

Browser checks and screenshots are recorded here as they are completed. The browser preview exercises the shared interface, dictionary and local learning flows; it does not verify OS keyring, native global shortcuts or tray behavior.

## Not yet verified

- Native visual and shortcut/clipboard/tray tests on both physical operating systems.
- Signed Windows release and notarized macOS distribution.
- Live paid translation response, deployed Worker and real budget exhaustion under provider traffic.
- Native-speaker review of every regional expression and multilingual usability tests.
- Five novice user sessions, accessibility audit, cross-device sync and a demo video.

The main interface is currently Traditional Chinese. Four README languages do not imply four fully localized interfaces. The curated regional phrase starter pack does not guarantee comprehensive or current slang coverage.
