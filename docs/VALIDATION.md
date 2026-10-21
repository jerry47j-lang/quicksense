# Validation record

Status: working preview, 2026-10-21. Live AI and native visual verification remain outstanding.

## Automated

- **29 tests pass**, with TypeScript checks. Coverage includes phrase boundaries, Unicode normalization, source-language filters, English dictionary fallback, unsafe dictionary property names, review intervals, backup import/export, ordered lessons and translation input/output contracts. Partial phrase matches are saved as phrase cards; curated full examples retain their complete translations.
- Seven service integration cases run against an actual in-memory SQLite table: authentication, invalid input, zero budget, concurrent reservations, daily-cap rollback, successful usage settlement, unknown network outcomes and browser-origin rejection. Some cases cover more than one check. Provider responses are mocked; no paid requests were made.
- `npm run build` passes and generates the production frontend. `npm audit` reports zero known vulnerabilities for the installed lockfile.
- The Cloudflare Worker dry-run bundle passes. This is not a deployment or a real model response.
- GitHub Actions independently builds Windows x64, macOS Apple Silicon and macOS Intel installers. See the repository Actions page for current outcomes.
- All three final native builds passed for application commit `56a9ed0`: [CI run 39609371893](https://github.com/jerry47j-lang/quicksense/actions/runs/39609371893). Later commits only add documentation. Installers are distributed as the `v0.1.0-preview.1` developer prerelease.

## Browser interaction

Observed in the shared browser UI:

- A real dictionary lookup of `serendipity` returns the packaged WordNet definition.
- Saving a result creates a visible collection row. Revealing a review and selecting remembered finishes that session and changes its due state.
- Naming the study, answering both first-lesson questions, unlocking lesson two, and reloading preserve the local learning state.
- Filtering world expressions to Japanese returns seven entries. Japanese and English quick-window lookups show the appropriate contextual notes.
- A partial `circle back` match is labeled as a phrase explanation rather than a complete sentence translation. An unknown sentence shows a service-configuration prompt, without an invented result.
- Ctrl+Enter lookup, returning from meeting mode, and normal/compact layouts work. At the 440-pixel quick-window width, measured content width stays within the viewport.
- Browser backup download contains the collected word and completed lesson, excludes the service URL/key, and disables online analysis in the exported profile.

The browser preview does not verify OS keyring, native global shortcuts, native save dialogs or tray behavior. Screenshots use a local test profile and show actual app state:

![Study and lookup](images/desktop-preview.png)

![Meeting lookup](images/meeting-lookup.png)

## Not yet verified

- Native visual and shortcut/clipboard/tray tests on both physical operating systems.
- Signed Windows release and notarized macOS distribution.
- Live paid translation response, deployed Worker and real budget exhaustion under provider traffic.
- Native-speaker review of every regional expression and multilingual usability tests.
- Five novice user sessions, accessibility audit, cross-device sync and a demo video.

The main interface is currently Traditional Chinese. Four README languages do not imply four fully localized interfaces. The curated regional phrase starter pack does not guarantee comprehensive or current slang coverage.
