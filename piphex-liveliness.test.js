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

test("the deployed health endpoint identifies the protected core memory release", () => {
  assert.match(source, /release: FOUNDER_CORE_ID/);
});

test("companion personality modes preserve safety and work in chat, vision, and realtime", () => {
  assert.match(source, /ANGEL MODE/);
  assert.match(source, /CLASSIC MODE/);
  assert.match(source, /AFTER DARK MODE \(verified adults only\)/);
  assert.match(source, /hateful slurs/);
  assert.match(source, /personalityPrompt\(body\.personalityMode\)/);
  assert.match(source, /personalityPrompt\(req\.headers\["x-piphex-personality"\]\)/);
});

test("founder core memory is selected only by verified Supabase email", () => {
  assert.match(source, /const FOUNDER_CORE_ID = "piphex-founder-core"/);
  assert.match(source, /"formisanojason@icloud\.com"/);
  assert.match(source, /"cdailmomof5@hotmail\.com"/);
  assert.match(source, /\/auth\/v1\/user/);
  assert.match(source, /FOUNDER_CORE_EMAILS\.has\(email\)/);
  assert.match(source, /await coreMemoryContext\(req\)/);
  assert.doesNotMatch(source, /PIPHEX_CORE_MEMORY_CODE_HASH/);
  assert.doesNotMatch(source, /PIPHEX_CORE_MEMORY_TOKEN/);
  assert.doesNotMatch(source, /\/api\/core-memory\/restore/);
  assert.doesNotMatch(source, /\/api\/core-memory\/status/);
  assert.doesNotMatch(source, /Jason works for \*\*Doc/);
});

test("shared companion prompts never identify every customer as Jason", () => {
  const appPrompt = source.match(/const COMPANION_APP_PROMPT = `[\s\S]*?`\.trim\(\);/)?.[0] || "";
  const realtimePrompt = source.match(/const REALTIME_COMPANION_PROMPT = `[\s\S]*?`\.trim\(\);/)?.[0] || "";
  assert.doesNotMatch(appPrompt, /\bJason(?:'s)?\b/);
  assert.doesNotMatch(realtimePrompt, /\bJason(?:'s)?\b/);
  assert.match(appPrompt, /current user/);
  assert.match(realtimePrompt, /current user/);
  assert.match(source, /PIPHEX FOUNDER CORE/);
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

test("realtime voice uses the current model and never interrupts playback", () => {
  assert.match(source, /gpt-realtime/);
  assert.match(source, /Content-Type: application\/sdp/);
  assert.match(source, /Content-Type: application\/json/);
  assert.doesNotMatch(source, /readText\(req, 200_000\)\)\.trim\(\)/);
  assert.doesNotMatch(source, /x-piphex-interruptions/);
  assert.match(source, /interrupt_response: false/);
  assert.match(source, /server_vad/);
});

test("realtime voice starts in English and authenticates founder memory with Supabase", () => {
  assert.match(source, /English is the only enabled language for now/);
  assert.match(source, /language: "en"/);
  assert.match(source, /Transcribe English only/);
  assert.match(source, /authenticatedUser\(req\)/);
  assert.match(source, /Your Piphex login has expired/);
  assert.doesNotMatch(source, /hasCoreMemoryAccess/);
  assert.doesNotMatch(source, /Natural English conversation with Jason/);
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
