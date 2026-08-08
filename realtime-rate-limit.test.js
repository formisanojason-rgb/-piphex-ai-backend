import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { boundedIntegerSetting, consumeRateLimit } from "./rate-limit.js";

test("the 31st authenticated account session is blocked for the default window", () => {
  const buckets = new Map();
  const request = { subject: "user:one", kind: "realtime-account", maximum: 30, now: 1_000 };
  for (let index = 0; index < 30; index += 1) {
    assert.equal(consumeRateLimit(buckets, request).allowed, true);
  }
  const blocked = consumeRateLimit(buckets, { ...request, now: 2_000 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 59);
});

test("the 13th guest session is blocked", () => {
  const buckets = new Map();
  const request = { subject: "ip:guest", kind: "realtime-guest", maximum: 12, now: 5_000 };
  for (let index = 0; index < 12; index += 1) consumeRateLimit(buckets, request);
  assert.equal(consumeRateLimit(buckets, request).allowed, false);
});

test("authenticated accounts also share a secondary IP ceiling", () => {
  const buckets = new Map();
  const request = { subject: "ip:shared", kind: "realtime-authenticated-ip", maximum: 60, now: 10_000 };
  for (let index = 0; index < 60; index += 1) consumeRateLimit(buckets, request);
  assert.equal(consumeRateLimit(buckets, request).allowed, false);
});

test("a blocked bucket becomes available when its rolling window expires", () => {
  const buckets = new Map();
  const request = { subject: "user:window", kind: "realtime-account", maximum: 1, now: 0 };
  assert.equal(consumeRateLimit(buckets, request).allowed, true);
  assert.equal(consumeRateLimit(buckets, { ...request, now: 59_999 }).allowed, false);
  assert.equal(consumeRateLimit(buckets, { ...request, now: 60_000 }).allowed, true);
});

test("rate-limit settings reject invalid values and enforce upper bounds", () => {
  assert.equal(boundedIntegerSetting("not-a-number", 30, { minimum: 6, maximum: 120 }), 30);
  assert.equal(boundedIntegerSetting(-5, 30, { minimum: 6, maximum: 120 }), 6);
  assert.equal(boundedIntegerSetting(999_999, 30, { minimum: 6, maximum: 120 }), 120);
});

test("the realtime endpoint consumes both authenticated account and IP limits", async () => {
  const source = await readFile(new URL("./server.js", import.meta.url), "utf8");
  assert.match(source, /"realtime-account"/);
  assert.match(source, /"realtime-authenticated-ip"/);
  assert.match(source, /PIPHEX_REALTIME_AUTHENTICATED_IP_RATE_LIMIT_PER_MINUTE/);
  assert.match(source, /"Retry-After": String\(limit\.retryAfterSeconds\)/);
});
