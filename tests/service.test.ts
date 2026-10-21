import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { reserve, type ServiceEnv } from "../service/worker";

const databases: DatabaseSync[] = [];
function environment(overrides: Partial<ServiceEnv> = {}): ServiceEnv {
  const db = new DatabaseSync(":memory:");
  databases.push(db);
  db.exec(
    readFileSync(
      new URL("../service/migrations/0001_limits.sql", import.meta.url),
      "utf8",
    ),
  );
  return {
    DB: {
      prepare(sql) {
        const statement = db.prepare(sql);
        let values: (string | number | null)[] = [];
        return {
          bind(...v: unknown[]) {
            values = v as typeof values;
            return this;
          },
          async run() {
            return statement.run(...values);
          },
          async first<T>() {
            return (statement.get(...values) ?? null) as T | null;
          },
        };
      },
    },
    OPENAI_API_KEY: "test-provider-key-not-real",
    SERVICE_ACCESS_KEY: "test-app-key-not-real",
    ...overrides,
  };
}
const request = (
  body: unknown = { text: "Could you check this?", source: "en", target: "ja" },
  key = "test-app-key-not-real",
) =>
  new Request("https://service.example/analyze", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
afterEach(() => {
  vi.unstubAllGlobals();
  databases.splice(0).forEach((db) => db.close());
});

describe("service requests with a real SQLite budget table", () => {
  it("rejects unauthenticated and invalid requests before any provider call", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const env = environment();
    expect((await worker.fetch(request(undefined, "wrong"), env)).status).toBe(
      401,
    );
    expect(
      (
        await worker.fetch(
          request({ text: "", source: "en", target: "ja" }),
          env,
        )
      ).status,
    ).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("blocks a zero monthly budget without a paid request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const response = await worker.fetch(
      request(),
      environment({ MONTHLY_AI_TWD: "0" }),
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "budget_exhausted" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("atomically reserves only the available amount under concurrent requests", async () => {
    const env = environment({
      MONTHLY_AI_TWD: "1",
      DAILY_REQUEST_LIMIT: "100",
    });
    const outcomes = await Promise.all(
      Array.from({ length: 10 }, () =>
        reserve(env, 300000, "month:test", "day:test"),
      ),
    );
    expect(outcomes.filter(Boolean)).toHaveLength(3);
    const row = await env.DB.prepare(
      "SELECT reserved FROM limits WHERE period=?",
    )
      .bind("month:test")
      .first<{ reserved: number }>();
    expect(row?.reserved).toBe(900000);
  });
  it("releases the monthly reservation when the daily cap rejects a request", async () => {
    const env = environment({ DAILY_REQUEST_LIMIT: "1" });
    expect(await reserve(env, 10000, "month:test", "day:test")).toBe(true);
    expect(await reserve(env, 10000, "month:test", "day:test")).toBe(false);
    const row = await env.DB.prepare(
      "SELECT reserved FROM limits WHERE period=?",
    )
      .bind("month:test")
      .first<{ reserved: number }>();
    expect(row?.reserved).toBe(10000);
  });
  it("checks structured output and settles measured provider usage", async () => {
    const analysis = {
      meaning: "確認を依頼する表現",
      tone: "丁寧",
      language: "en",
      translation: "これを確認していただけますか？",
      grammar: [],
      alternatives: [],
      terms: [],
      uncertainty: null,
    };
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.store).toBe(false);
      expect(body.text.format.strict).toBe(true);
      expect(body.input).toContain("Could you check this?");
      return Response.json({
        status: "completed",
        output: [
          {
            content: [{ type: "output_text", text: JSON.stringify(analysis) }],
          },
        ],
        usage: { input_tokens: 100, output_tokens: 200 },
      });
    });
    vi.stubGlobal("fetch", fetch);
    const env = environment(),
      response = await worker.fetch(request(), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ analysis });
    const row = await env.DB.prepare(
      "SELECT spent,reserved FROM limits WHERE period LIKE 'month:%'",
    ).first<{ spent: number; reserved: number }>();
    expect(row).toMatchObject({ spent: 39000, reserved: 0 });
  });
  it("keeps the reservation on an unknown network outcome", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw Error("connection lost");
      }),
    );
    const env = environment();
    expect((await worker.fetch(request(), env)).status).toBe(502);
    const row = await env.DB.prepare(
      "SELECT reserved FROM limits WHERE period LIKE 'month:%'",
    ).first<{ reserved: number }>();
    expect(row?.reserved).toBeGreaterThan(0);
  });
  it("does not accept an unauthorized browser origin", async () => {
    const req = request();
    req.headers.set("Origin", "https://untrusted.example");
    expect((await worker.fetch(req, environment())).status).toBe(403);
  });
});
