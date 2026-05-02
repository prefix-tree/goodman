import type { PlaybookDefinition } from "../playbooks/types.js";

/**
 * Keyword-based fact extraction.
 * Runs each playbook fact's patterns against the text and returns matched facts
 * as a key-value record. Fast enough to run on every transcript chunk (<1ms).
 */
export function extractFacts(
  text: string,
  playbook: PlaybookDefinition,
): Record<string, string> {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return {};

  const results: Record<string, string> = {};

  for (const factDef of playbook.requiredFacts) {
    for (const pattern of factDef.patterns) {
      const regex = new RegExp(pattern, "i");
      const match = regex.exec(normalized);
      if (match) {
        const value = (match[1] ?? match[0]).trim();
        if (value) {
          results[factDef.key] = value;
          break; // one match per fact key is enough
        }
      }
    }
  }

  return results;
}
