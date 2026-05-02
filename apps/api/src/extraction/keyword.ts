import type { CaseFact } from "../entities/case.js";
import type { PlaybookDefinition } from "../playbooks/types.js";

/**
 * Keyword-based fact extraction.
 * Runs each playbook fact's patterns against the text and returns matched facts.
 * Fast enough to run on every transcript chunk (<1ms).
 */
export function extractFacts(
  text: string,
  playbook: PlaybookDefinition,
): CaseFact[] {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return [];

  const results: CaseFact[] = [];

  for (const factDef of playbook.requiredFacts) {
    for (const pattern of factDef.patterns) {
      const regex = new RegExp(pattern, "i");
      const match = regex.exec(normalized);
      if (match) {
        // Use the first capture group if it exists, otherwise the full match
        const value = (match[1] ?? match[0]).trim();
        if (value) {
          results.push({
            key: factDef.key,
            value,
            source: "transcript",
            confidence: "medium",
            extractedAt: new Date(),
          });
          break; // one match per fact key is enough
        }
      }
    }
  }

  return results;
}
