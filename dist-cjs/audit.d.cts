import { type Reporter } from "./reporter.cjs";
export type AuditResult = {
    readonly status: "passed";
    readonly detail?: string;
} | {
    readonly status: "failed";
    readonly issues: readonly string[];
};
export interface AuditCheck {
    readonly title: string;
    readonly run: () => AuditResult | Promise<AuditResult>;
}
export interface AuditReport {
    readonly title: string;
    readonly checks: readonly AuditCheck[];
}
export declare function runAudit(reporter: Reporter, audit: AuditReport): Promise<void>;
export declare class AuditFailure extends Error {
    readonly auditTitle: string;
    readonly issues: readonly string[];
    constructor(auditTitle: string, issues: readonly string[]);
}
//# sourceMappingURL=audit.d.ts.map