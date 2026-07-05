import { type Reporter } from "./reporter.cjs";
export interface CommandSpec {
    readonly command: string;
    readonly args?: readonly string[];
    readonly cwd?: string;
    readonly display?: string;
    readonly env?: NodeJS.ProcessEnv;
}
export interface ExpectedArtifact {
    readonly label: string;
    readonly path: string;
    readonly kind?: "directory" | "file";
}
export interface PipelineStep {
    readonly title: string;
    readonly purpose?: string;
    readonly command?: CommandSpec;
    readonly commands?: readonly CommandSpec[];
    readonly expectedArtifacts?: readonly ExpectedArtifact[];
    readonly highlights?: readonly RegExp[];
    readonly output?: "buffered" | "inherit";
    readonly run?: () => Promise<void> | void;
}
export interface PipelineReport {
    readonly title: string;
    readonly steps: readonly PipelineStep[];
    readonly verbose?: boolean;
}
interface StepTiming {
    readonly elapsedMs: number;
    readonly status: "completed" | "failed";
    readonly title: string;
}
export declare function runPipeline(reporter: Reporter, pipeline: PipelineReport): Promise<void>;
export declare function printTimingSummary(reporter: Reporter, timings: readonly StepTiming[], totalElapsedMs: number): void;
export {};
//# sourceMappingURL=pipeline.d.ts.map