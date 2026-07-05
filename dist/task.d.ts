import { type Reporter } from "./reporter.js";
export interface TaskReport {
    readonly title: string;
    readonly detail?: string;
    readonly run: () => Promise<void> | void;
}
export declare function runTask(reporter: Reporter, task: TaskReport): Promise<void>;
//# sourceMappingURL=task.d.ts.map