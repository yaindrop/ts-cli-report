import { type IconName, Style, type StyleOptions } from "./style.js";
export interface ReporterOptions extends StyleOptions {
    readonly stderr?: NodeJS.WritableStream;
    readonly stdout?: NodeJS.WritableStream;
}
export interface Reporter {
    readonly stderr: NodeJS.WritableStream;
    readonly stdout: NodeJS.WritableStream;
    readonly style: Style;
    readonly isTty: boolean;
    blank(): void;
    detail(label: string, value: string): void;
    error(message: string): void;
    section(title: string, icon?: IconName): void;
    success(message: string): void;
    warn(message: string): void;
    write(message: string): void;
}
export declare function createReporter(options?: ReporterOptions): Reporter;
export declare function formatDuration(milliseconds: number): string;
//# sourceMappingURL=reporter.d.ts.map