import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./server.js", import.meta.url), "utf8");

test("Piphex follows the new concise old-imp personality", () => {
  assert.match(source, /old, clever, mischievous/);
  assert.match(source, /15-45 words/);
  assert.match(source, /Do not mention Hell in every response/);
  assert.match(source, /older male infernal imp/);
  assert.match(source, /conciseReply\(enforceLocationPrivacy/);
});

test("visitor memory is consent based and never IP based", () => {
  const memoryFunction = source.match(/function visitorMemoryContext\(memory\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(memoryFunction, /memory\.enabled !== true/);
  assert.match(memoryFunction, /VISITOR-APPROVED MEMORY/);
  assert.match(memoryFunction, /Preferred name/);
  assert.doesNotMatch(memoryFunction, /clientIp|x-forwarded-for/);
});

test("realtime voice uses the current model and supports interruption", () => {
  assert.match(source, /gpt-realtime-2\.1/);
  assert.match(source, /interrupt_response: true/);
  assert.match(source, /server_vad/);
});
