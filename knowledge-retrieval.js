const STOP_WORDS = new Set([
  "about", "after", "again", "also", "another", "because", "before", "being", "could", "does", "from", "have", "into", "just", "like", "more", "most", "only", "other", "should", "tell", "than", "that", "their", "them", "then", "there", "these", "they", "this", "those", "through", "want", "what", "when", "where", "which", "while", "with", "would", "your"
]);

function terms(value) {
  return [...new Set(String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((term) => term.replace(/^'+|'+$/g, ""))
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)))];
}

export function createKnowledgeIndex(markdown) {
  return String(markdown || "")
    .split(/(?=^#{2,3}\s+)/gm)
    .map((content) => {
      const title = content.match(/^#{2,3}\s+(.+)$/m)?.[1]?.trim() || "Overview";
      return { title, content: content.trim(), titleTerms: terms(title), searchable: content.toLowerCase().normalize("NFKD") };
    })
    .filter((section) => section.content && section.title !== "Overview");
}

export function knowledgeContext(index, question, maximumCharacters = 14_000) {
  const queryTerms = terms(question);
  if (!queryTerms.length) return "";

  const ranked = index
    .map((section) => {
      let score = 0;
      for (const term of queryTerms) {
        if (section.titleTerms.includes(term)) score += 12;
        const matches = section.searchable.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"));
        score += Math.min(matches?.length || 0, 5);
      }
      return { ...section, score };
    })
    .filter((section) => section.score > 0)
    .sort((a, b) => b.score - a.score || a.content.length - b.content.length);

  const selected = [];
  let length = 0;
  for (const section of ranked) {
    if (selected.length >= 5) break;
    if (length && length + section.content.length > maximumCharacters) continue;
    selected.push(section.content);
    length += section.content.length;
  }
  if (!selected.length) return "";
  return `APPROVED SPOILER-FREE REFERENCE FOR THIS QUESTION:\n${selected.join("\n\n")}`;
}
