export type ColorName = "blue" | "cyan" | "gray" | "green" | "magenta" | "red" | "yellow";
export interface StyleOptions {
    readonly color?: boolean;
    readonly forceColor?: boolean;
    readonly isTty?: boolean;
}
export declare class Style {
    readonly enabled: boolean;
    constructor(options?: StyleOptions);
    bold(value: string): string;
    dim(value: string): string;
    color(name: ColorName, value: string): string;
    private wrap;
}
export declare const icons: {
    readonly audit: "🛡️";
    readonly cleanup: "🧹";
    readonly clock: "⏱️";
    readonly failure: "❌";
    readonly info: "ℹ";
    readonly output: "📁";
    readonly package: "📦";
    readonly running: "▶";
    readonly success: "✅";
    readonly task: "⚙️";
    readonly verify: "✔";
    readonly warning: "⚠️";
};
export type IconName = keyof typeof icons;
//# sourceMappingURL=style.d.ts.map