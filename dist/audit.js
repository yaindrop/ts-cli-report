import { performance } from "node:perf_hooks";
import { formatDuration } from "./reporter.js";
import { icons } from "./style.js";
export async function runAudit(reporter, audit) {
    reporter.section(audit.title, "audit");
    const startedAt = performance.now();
    const issues = [];
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
    auditTitle;
    issues;
    constructor(auditTitle, issues) {
        super(`${auditTitle} failed with ${issues.length} issue(s)`);
        this.auditTitle = auditTitle;
        this.issues = issues;
        this.name = "AuditFailure";
    }
}
//# sourceMappingURL=audit.js.map