"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditFailure = void 0;
exports.runAudit = runAudit;
const node_perf_hooks_1 = require("node:perf_hooks");
const reporter_js_1 = require("./reporter.cjs");
const style_js_1 = require("./style.cjs");
async function runAudit(reporter, audit) {
    reporter.section(audit.title, "audit");
    const startedAt = node_perf_hooks_1.performance.now();
    const issues = [];
    for (const check of audit.checks) {
        const result = await check.run();
        if (result.status === "passed") {
            const suffix = result.detail === undefined ? "" : ` ${reporter.style.color("gray", result.detail)}`;
            reporter.write(`  ${reporter.style.color("green", style_js_1.icons.verify)} ${check.title}${suffix}`);
            continue;
        }
        reporter.write(`  ${reporter.style.color("red", style_js_1.icons.failure)} ${check.title}`);
        for (const issue of result.issues) {
            issues.push(`${check.title}: ${issue}`);
            reporter.write(`    ${reporter.style.color("red", "-")} ${issue}`);
        }
    }
    if (issues.length > 0) {
        reporter.error(`${audit.title} failed with ${issues.length} issue(s)`);
        throw new AuditFailure(audit.title, issues);
    }
    reporter.success(`${audit.title} passed in ${(0, reporter_js_1.formatDuration)(node_perf_hooks_1.performance.now() - startedAt)}`);
}
class AuditFailure extends Error {
    auditTitle;
    issues;
    constructor(auditTitle, issues) {
        super(`${auditTitle} failed with ${issues.length} issue(s)`);
        this.auditTitle = auditTitle;
        this.issues = issues;
        this.name = "AuditFailure";
    }
}
exports.AuditFailure = AuditFailure;
//# sourceMappingURL=audit.cjs.map