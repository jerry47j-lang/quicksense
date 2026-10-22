# Validation record

Status: free public web beta + native developer previews, 2026-10-22. Physical Windows/macOS acceptance and signing remain outstanding.

## Public distribution

- Live app: https://jerry47j-lang.github.io/quicksense/
- Source: https://github.com/jerry47j-lang/quicksense
- Packages: [v0.2.0-preview.1](https://github.com/jerry47j-lang/quicksense/releases/tag/v0.2.0-preview.1), generated from application commit `0aac9f1ca8331c022df9ce83536e99b1197e96af`.
- [Native CI run 39733405281](https://github.com/jerry47j-lang/quicksense/actions/runs/39733405281): Windows x64, Mac Apple Silicon and Mac Intel all passed. EXE, MSI and both DMGs downloaded; SHA-256 checksums accompany the public assets. Later commits update documents only.
- [Pages run 39733405252](https://github.com/jerry47j-lang/quicksense/actions/runs/39733405252): checks, build, subdirectory paths, generated-worker verification, upload and deployment passed.

## Automated checks

- TypeScript and **45 tests pass**. New cases use actual shipped ECDICT files for deadline, serendipity, meeting and went; check independent English/Chinese load failures, full-sentence miss boundaries, exact Unicode/reserved-character handoff, 5,000-character rejection without truncation, automatic/manual target resolution, and blocked-storage in-memory fallback. Existing coverage includes normalized phrase boundaries, source filters, prototype-safe dictionary properties, reviews, backup/import, ordered lessons and service contracts.
- `npm run build` passes for both root and Pages base configuration. The Pages artifact check parses all 54 dictionary chunks, resolves every entry script/style/icon path and verifies manifest scope. The generated worker is exercised in a Node VM: offline shell navigation, cached dictionary without network, and external/out-of-scope/non-GET exclusions. This simulates network failure; it is not a physical-device offline browser session.
- `npm audit --audit-level=high` reports zero known vulnerabilities for the lockfile in all final build jobs.
- Optional service integration cases use an actual in-memory SQLite budget table and mocked provider responses. They verify auth, invalid input, zero budget, reservation concurrency, cap rollback, settlement and unknown provider outcomes. No paid provider call was made and no Worker was deployed.
- CI-generated Rust lockfile matches committed package content after newline normalization.

## Observed public browser interactions

Tested at the deployed HTTPS origin, using invented non-confidential examples:

- Fresh origin opens a three-step no-account onboarding. Clicking its deadline example loads an actual Chinese dictionary meaning beside input, rather than a prefilled fake result.
- Saving deadline updates the collection count. Querying 我餓了 resolves the automatic target to English and shows a labeled Google Translate handoff. The actual external page returns “I'm hungry”. The source input remains in QuickSense.
- Manually choosing Japanese updates the handoff URL's target. A full reload preserves that preference, collections, history and the completed onboarding state. Unsaved input itself is not promised to persist through a reload.
- Pasting a confirmed translation note saves 我餓了 / I'm hungry. Both it and deadline remain visibly in the collection after reload.
- Public Preferences contains no AI service password/URL form. The real 52.1 MiB offline download completes and the app verifies all **56 files** in the versioned cache before showing success.
- Public browser testing found Settings clipped below a 720px-high viewport. The sidebar now scrolls and its decorative tip collapses; the same button is reachable and opens Preferences in the final version.
- The first lesson opens, accepts both correct answers and records completion/unlocks the next lesson. Lookup and learning do not require a translation service.
- The 1280×720 view keeps the input, first Chinese meaning and language controls visible. Pixel decoration does not cover the result. The source screenshot below is the actual deployed app and contains only invented test data.

![Deployed free app](images/free-web-app.png)

Previous preview browser checks also exercised spaced review, naming, lesson persistence, Japanese filtering, partial phrase labels, keyboard lookup, JSON backup and compact quick-window layout. Native tray/keyring/clipboard/shortcuts are not proven by browser checks.

## Not yet verified / not claimed

- Physical Windows and Mac UI, global shortcut, tray, keyring, installation/uninstallation acceptance.
- Signed Windows release and Apple notarization. OS blocking is addressed by the free browser entry, not by bypass instructions.
- Actual network-disconnected browser/PWA sessions on multiple devices. Worker failure simulation and cache-entry verification pass; browser eviction and app updates may require re-downloading packs.
- Five novice sessions, cross-browser/device usability studies, complete four-language UI, accessibility audit and native-speaker review of every note.
- Live paid AI, real provider budget exhaustion, account sync or a demo video.

The four README guides and FAQ are translated; the current UI and offline learning explanations are Traditional Chinese. Dictionaries and 62 regional notes are historical/starter data, not comprehensive or automatically current worldwide slang coverage. Arbitrary sentence translation uses an explicit external website and depends on internet/Google availability. No paid hosting, provider API, signing or notarization was purchased.
