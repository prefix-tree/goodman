import type { CaseRisk } from "../entities/case.js";
import type { PlaybookDefinition } from "../playbooks/types.js";

/**
 * Evaluate risk rules from the playbook against current facts.
 * Pure function — completely deterministic.
 */
export function evaluateRisks(
  facts: Record<string, unknown>,
  playbook: PlaybookDefinition,
): CaseRisk[] {
  const now = new Date();

  return playbook.riskRules
    .filter((rule) => rule.condition(facts))
    .map((rule) => ({
      id: rule.id,
      label: rule.label,
      severity: rule.severity,
      triggerFacts: Object.keys(facts),
      detectedAt: now,
    }));
}
