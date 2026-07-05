import { performance } from "node:perf_hooks";

import { formatDuration, type Reporter } from "./reporter.js";
import { icons } from "./style.js";

export type AuditResult =
  | { readonly status: "passed"; readonly detail?: string }
  | { readonly status: "failed"; readonly issues: readonly string[] };

export interface AuditCheck {
  readonly title: string;
  readonly run: () => AuditResult | Promise<AuditResult>;
}

export interface AuditReport {
  readonly title: string;
  readonly checks: readonly AuditCheck[];
}

export async function runAudit(
  reporter: Reporter,
  audit: AuditReport,
): Promise<void> {
  reporter.section(audit.title, "audit");
  const startedAt = performance.now();
  const issues: string[] = [];
  for (const check of audit.checks) {
    const result = await check.run();
    if (result.status === "passed") {
      const suffix = result.detail === undefined ? "" : ` ${reporter.style.color("gray", result.detail)}`;
      reporter.write(`  ${reporter.style.color("green", icons.verify)} ${check.title}${suffix}`);
      continue;
    }
    reporter.write(`  ${reporter.style.color("red", icons.failure)} ${check.title}`);
    for (const issue of result.issues) {
      issues.push(`${check.title}: ${issue}`);
      reporter.write(`    ${reporter.style.color("red", "-")} ${issue}`);
    }
  }
  if (issues.length > 0) {
    reporter.error(`${audit.title} failed with ${issues.length} issue(s)`);
    throw new AuditFailure(audit.title, issues);
  }
  reporter.success(`${audit.title} passed in ${formatDuration(performance.now() - startedAt)}`);
}

export class AuditFailure extends Error {
  constructor(
    readonly auditTitle: string,
    readonly issues: readonly string[],
  ) {
    super(`${auditTitle} failed with ${issues.length} issue(s)`);
    this.name = "AuditFailure";
  }
}
