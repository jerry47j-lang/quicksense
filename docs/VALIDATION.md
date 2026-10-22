# Validation record — 0.2.1 inline translation

Verified 2026-10-22. Public app: https://jerry47j-lang.github.io/quicksense/?v=0.2.1

## Current build and distribution

- Application source: `7d8e289b7492d03d110fe8a501b7026c4e196cf9`. [Native run 39739464520](https://github.com/jerry47j-lang/quicksense/actions/runs/39739464520): Windows x64, Mac Apple Silicon and Mac Intel all pass. Four packages and SHA256SUMS.txt are published in [v0.2.1-preview.1](https://github.com/jerry47j-lang/quicksense/releases/tag/v0.2.1-preview.1); uploaded SHA-256 digests match the downloaded CI artifacts.
- [Public Pages run 39741725516](https://github.com/jerry47j-lang/quicksense/actions/runs/39741725516) passes security gate, TypeScript/59 tests, build, distribution-path checks, generated-worker tests, artifact transfer and deployment. Its later source commit `37526a0` changes only the Pages workflow relative to application commit `7d8e289`.
- Two earlier Linux Pages attempts failed in npm audit: the client fell back to the retired Quick endpoint and received an invalid-package-tree error. Security checks were not removed. The final workflow builds and audits the lockfile on the already verified Windows environment, then transfers that checked artifact to Ubuntu solely for Pages publishing. Both final stages pass.
- Four-language README, instructions and privacy now describe actual opt-in inline translation rather than treating an external Google link as completion.

## Public HTTPS browser checks

Invented, non-confidential sentences were typed into the actual deployed app:

1. Before consent, typing automatically runs local lookup but sends no inline translation. The result offers a clearly labeled enable button and the first-use notice names MyMemory, idle sending, quota and potential long-term retention.
2. After opt-in, `我想把會議改到明天下午。` displays **I'd like to reschedule the meeting for tomorrow afternoon.** directly in QuickSense.
3. Typing `Please send me the meeting notes tomorrow.` and pressing no button automatically displays **請明天將會議紀錄寄給我。** after the idle delay/provider response. Source and target labels match.
4. With automatic mode unchecked, typing `我今天下午會在辦公室。` and pressing **翻譯／查字** displays **I'll be at the office this afternoon.** in the same page.
5. Re-enabling automatic mode and repeating a sentence uses the session cache. Saving it increases the visible collection count and retains the full sentence with its actual translation source.
6. Meeting mode preserves the query/result and keeps the complete input, output and automatic checkbox visible at the observed 1280×720 viewport.

Local shared-UI checks additionally confirmed Chinese→Japanese refresh after changing the target and service revocation in Preferences. No physical native runtime acceptance is inferred from these browser interactions.

![Real public inline translation in meeting mode](images/inline-translation.png)

## Automated safeguards

**59 tests pass.** New cases cover language-script guessing, true UTF-8 segment limits with Unicode preservation, selected language pair, no email/key/cookies, entity-safe text output, exact session-cache hits, no request while offline/already cancelled, quota before sending, provider quota/error rejection, no partial sentence on later failure, pending-request cancellation, timeout, and consent excluded from backup/import.

The existing dictionary, lessons, collection, phrase-boundary, backup and optional-service contract tests remain green. Generated service-worker tests confirm that external translation requests are never cached by the app shell worker. The free engine does not perform grammar correction or generate AI reply analysis. No paid model request, backend deployment, hosting upgrade, signing or notarization was purchased.

Remaining: physical Windows/Mac tray/shortcut/keyring acceptance, formal signing/notarization, multi-device offline acceptance, native-speaker review and five novice user sessions. Automatic language guessing may be wrong for short/mixed input. MyMemory availability and its anonymous 5,000-character/day IP quota are external constraints; clear failure/retry/fallback is supplied. The current UI remains Traditional Chinese; four translated guides are not four fully localized UIs.

---
# Historical 0.2.0 validation

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

