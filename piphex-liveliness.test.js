import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./server.js", import.meta.url), "utf8");
const knowledge = await readFile(new URL("./knowledge.md", import.meta.url), "utf8");
const widget = await readFile(new URL("./public/widget.js", import.meta.url), "utf8");

test("Piphex follows the new concise old-imp personality", () => {
  assert.match(source, /old, clever, mischievous/);
  assert.match(source, /15-45 words/);
  assert.match(source, /Do not mention Hell in every response/);
  assert.match(source, /older male infernal imp/);
  assert.match(source, /conciseReply\(enforceLocationPrivacy/);
});

test("Piphex follows random conversation instead of forcing lore", () => {
  assert.match(source, /well-rounded conversational character/);
  assert.match(source, /Follow the visitor's current subject/);
  assert.match(source, /do not end every reply with one/);
});

test("Piphex has cinematic presence without pretending to be conscious", () => {
  assert.match(source, /Create a sense of presence/);
  assert.match(source, /information, advice, companionship, and play/);
  assert.match(source, /consistent harmless tastes and opinions/);
  assert.match(source, /Use emotional restraint/);
  assert.match(source, /never claim certainty about hidden feelings/);
  assert.match(source, /Do not claim to be human or conscious/);
  assert.match(source, /brief natural pauses/);
});

test("the deployed health endpoint identifies the cinematic memory release", () => {
  assert.match(source, /release: "cinematic-memory-v1"/);
});

test("visitor memory is consent based and never IP based", () => {
  const memoryFunction = source.match(/function visitorMemoryContext\(memory\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(memoryFunction, /memory\.enabled !== true/);
  assert.match(memoryFunction, /VISITOR-APPROVED MEMORY/);
  assert.match(memoryFunction, /Preferred name/);
  assert.match(memoryFunction, /Favorite topics/);
  assert.match(memoryFunction, /Conversation style/);
  assert.match(memoryFunction, /Familiarity count/);
  assert.doesNotMatch(memoryFunction, /clientIp|x-forwarded-for/);
});

test("Piphex retains Munchy's food knowledge and only approved meatball humor", () => {
  assert.match(knowledge, /Munchy's Pizza & Wings Knowledge/i);
  assert.match(knowledge, /not homemade/i);
  assert.match(knowledge, /comedic opinion/i);
  assert.match(knowledge, /false rumor/i);
  assert.match(source, /Munchy's location privacy is absolute/);
});

test("realtime voice uses the current model and supports interruption", () => {
  assert.match(source, /gpt-realtime/);
  assert.match(source, /Content-Type: application\/sdp/);
  assert.match(source, /Content-Type: application\/json/);
  assert.doesNotMatch(source, /readText\(req, 200_000\)\)\.trim\(\)/);
  assert.match(source, /interrupt_response: true/);
  assert.match(source, /server_vad/);
});

test("native Piphex Orb audio is transcribed only by the secure backend", () => {
  assert.match(source, /gpt-4o-mini-transcribe/);
  assert.match(source, /\/v1\/audio\/transcriptions/);
  assert.match(source, /url\.pathname === "\/api\/transcribe"/);
  assert.match(source, /readBuffer\(req, maximum = 10_000_000\)/);
});

test("website voice records and transcribes across modern browsers", () => {
  assert.match(widget, /new MediaRecorder/);
  assert.match(widget, /transcribeRecording/);
  assert.match(widget, /Understanding what you said/);
  assert.match(widget, /setTimeout\(beginVoiceTurn, 350\)/);
});
