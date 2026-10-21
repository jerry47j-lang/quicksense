# Optional translation service

This service is **not deployed or connected by default**. Offline dictionary lookups and the curated expression pack work without it. Arbitrary sentence translation, generated grammar notes and reply suggestions require this service and an OpenAI account with available API billing. No paid resources are provisioned by installing the app.

## Deploy with Cloudflare

1. Install dependencies with `npm ci`, then authenticate your own Cloudflare account with `npx wrangler login`.
2. Run `npx wrangler d1 create quicksense-budget`. Put the returned database ID into `service/wrangler.jsonc`, replacing the placeholder.
3. Run `npx wrangler d1 migrations apply quicksense-budget --remote --config service/wrangler.jsonc`.
4. Set provider and app access secrets separately:

   ```sh
   npx wrangler secret put OPENAI_API_KEY --config service/wrangler.jsonc
   npx wrangler secret put SERVICE_ACCESS_KEY --config service/wrangler.jsonc
   ```

   Use a long random access key and share it only with trusted users of this private service. This preview uses a shared deployment key, not individual user accounts. Never commit `.dev.vars` or provider credentials.
5. Keep the pinned default model for the included cost calculations. Review `MONTHLY_AI_TWD`, `DAILY_REQUEST_LIMIT` and the conservative budget exchange rate in the config. Changing the model requires updating and verifying both input/output rates in `worker.ts`.
6. Deploy with `npx wrangler deploy --config service/wrangler.jsonc`. Visit `/health`; `ready: true` confirms that bindings and secrets exist, not that an actual paid model request succeeded.
7. In QuickSense preferences, enter the HTTPS Worker URL and the **service access key**, save it, and enable online analysis explicitly. Choose the desired target language and look up a sentence.

The desktop service key is stored in the OS credential store. Browser-preview keys live in memory for the current page session; allow the exact preview origin through `BROWSER_ORIGIN`. Never enter the provider API key into the desktop app. Local HTTP is supported only on localhost for development.

## Data and limits

An enabled online lookup sends only the submitted text, source hint and target language to your configured service and OpenAI. The Worker requests `store: false`; provider abuse-monitoring retention may still apply under your account's terms. The service does not log/store query text. The D1 table stores daily request counts and monthly spent/reserved micro-NTD. Saved words and learning progress remain local to the app.

Before each paid request, the service atomically reserves a conservative upper cost estimate. The default monthly AI cap is NT$600 and daily deployment cap is 100 requests. These are deployment-wide, not per-user. Unknown upstream/network outcomes retain their reservation to prevent automatic retries from overspending. Reconcile reservations manually only after checking the provider's actual usage. Cloudflare costs and currency fluctuations are separate from this AI accounting cap.

The model can make mistakes. Regional notes and grammar are learning assistance; check important communications with a qualified speaker. This preview has no automatic global slang crawler or cross-device account sync.

## Local checks

Copy `service/.dev.vars.example` to `service/.dev.vars` and fill in your own test credentials only when intending to make paid requests. Use local migrations with `--local` before `npm run service:dev`. Never paste real credentials into an issue or screenshot. Automated tests mock the provider and do not spend API credits.
