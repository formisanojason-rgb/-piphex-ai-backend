import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./server.js", import.meta.url), "utf8");

test("realtime rate limits use the authenticated account instead of a shared IP", () => {
  assert.match(source, /authenticatedUser\(req\)/);
  assert.match(source, /accountId \? `user:\$\{accountId\}` : undefined/);
  assert.match(source, /REALTIME_RATE_LIMIT_PER_MINUTE/);
  assert.match(source, /REALTIME_GUEST_RATE_LIMIT_PER_MINUTE/);
});

test("realtime rate limiting tells the app how long to wait", () => {
  assert.match(source, /"Retry-After": String\(limit\.retryAfterSeconds\)/);
  assert.match(source, /retryAfterSeconds: limit\.retryAfterSeconds/);
  assert.match(source, /"RateLimit-Remaining": String\(limit\.remaining\)/);
});

test("invalid rate-limit environment values fall back safely", () => {
  assert.match(source, /function positiveIntegerSetting/);
  assert.match(source, /Number\.isFinite\(parsed\)/);
  assert.match(source, /PIPHEX_REALTIME_RATE_LIMIT_PER_MINUTE, 30, 6/);
  assert.match(source, /PIPHEX_REALTIME_GUEST_RATE_LIMIT_PER_MINUTE, 12, 6/);
});
