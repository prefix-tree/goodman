import type { PlaybookDefinition } from "../playbooks/types.js";

/**
 * Deterministic question engine.
 * Walks the playbook's questionOrder and returns the first required fact
 * that hasn't been collected yet.
 */
export function getNextQuestion(
  facts: Record<string, unknown>,
  playbook: PlaybookDefinition,
): { key: string; question: string } | null {
  for (const key of playbook.questionOrder) {
    if (key in facts) continue;

    const factDef = playbook.requiredFacts.find((f) => f.key === key);
    if (!factDef) continue;
    if (!factDef.required) continue;

    return { key: factDef.key, question: factDef.question };
  }

  return null;
}
