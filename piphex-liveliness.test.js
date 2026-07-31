import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./server.js", import.meta.url), "utf8");
const knowledge = await readFile(new URL("./knowledge.md", import.meta.url), "utf8");
const widget = await readFile(new URL("./public/widget.js", import.meta.url), "utf8");
const orbSource = await readFile(new URL("./piphex-orb/src/app/index.tsx", import.meta.url), "utf8");

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
  assert.match(orbSource, /infernal embrace\|gizmolife\|gizmo\|piphex\|lore\|canon/);
  assert.doesNotMatch(orbSource, /if \(message\.includes\('\?'\)\) next\.loreQuestions/);
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

test("the orb has different character movement for each speaking state", () => {
  assert.match(orbSource, /const driftX = useRef\(new Animated\.Value\(0\)\)/);
  assert.match(orbSource, /const tilt = useRef\(new Animated\.Value\(0\)\)/);
  assert.match(orbSource, /idle: \[/);
  assert.match(orbSource, /listening: \[/);
  assert.match(orbSource, /thinking: \[/);
  assert.match(orbSource, /speaking: \[/);
  assert.match(orbSource, /rotate: tilt\.interpolate/);
  assert.match(orbSource, /const voiceSweep = useRef\(new Animated\.Value\(0\)\)/);
  assert.match(orbSource, /orbState !== 'speaking'/);
  assert.match(orbSource, /styles\.voiceLights/);
});

test("settings stay behind a corner gear instead of crowding the orb", () => {
  assert.match(orbSource, /accessibilityLabel="Open settings"/);
  assert.match(orbSource, /style=\{styles\.settingsGear\}/);
  assert.match(orbSource, /visible=\{settingsOpen\}/);
  assert.match(orbSource, /PIPHEX SETTINGS/);
  assert.doesNotMatch(orbSource, /<Text style=\{styles\.controlText\}>\{soundOn \? 'VOICE ON'/);
});

test("personal memory can be reviewed, corrected, and selectively forgotten", () => {
  assert.match(orbSource, /WHAT PIPHEX REMEMBERS/);
  assert.match(orbSource, /Review, correct, or remove saved details/);
  assert.match(orbSource, /FORGET THIS/);
  assert.match(orbSource, /saveMemoryLedger/);
  assert.match(orbSource, /These details stay privately on this phone/);
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
  assert.match(source, /gpt-realtime-2\.1/);
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
