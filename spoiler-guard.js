export const PROTECTED_STORY_REPLY = "That question touches protected story information, so I won’t confirm or deny it. I can give you the spoiler-free description of the character, place, object, or idea instead.";

export function asksProtectedStoryQuestion(message) {
  const text = String(message || "").toLowerCase();
  return /\bconfirm\s+or\s+deny\b/.test(text)
    || /\b(?:my|this|that|reader|fan)\s+theory\b/.test(text)
    || /\b(?:is|are|was|were)\b.{0,100}\breally\b/.test(text)
    || /\b(?:does|do|did)\b.{0,100}\bturn(?:s|ed)?\s+out\b/.test(text)
    || /\bend\s+up\s+together\b/.test(text)
    || /\bwho\s+wins\b/.test(text)
    || /\bwhat\s+happens\s+next\b/.test(text)
    || /\bhow\s+(?:does|did)\b.{0,80}\bend\b/.test(text)
    || /\b(?:does|do|did|will)\b.{0,80}\b(?:die|dies|survive|survives|betray|betrays|escape|escapes)\b/.test(text);
}
