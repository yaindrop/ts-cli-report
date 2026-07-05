const colorCodes = {
    blue: ["\u001b[34m", "\u001b[39m"],
    cyan: ["\u001b[36m", "\u001b[39m"],
    gray: ["\u001b[90m", "\u001b[39m"],
    green: ["\u001b[32m", "\u001b[39m"],
    magenta: ["\u001b[35m", "\u001b[39m"],
    red: ["\u001b[31m", "\u001b[39m"],
    yellow: ["\u001b[33m", "\u001b[39m"],
};
export class Style {
    enabled;
    constructor(options = {}) {
        this.enabled =
            options.color ??
                (process.env.NO_COLOR === undefined &&
                    process.env.FORCE_COLOR !== "0" &&
                    (options.forceColor === true ||
                        process.env.FORCE_COLOR !== undefined ||
                        options.isTty === true));
    }
    bold(value) {
        return this.wrap("\u001b[1m", "\u001b[22m", value);
    }
    dim(value) {
        return this.wrap("\u001b[2m", "\u001b[22m", value);
    }
    color(name, value) {
        const [open, close] = colorCodes[name];
        return this.wrap(open, close, value);
    }
    wrap(open, close, value) {
        return this.enabled ? `${open}${value}${close}` : value;
    }
}
export const icons = {
    audit: "🛡️",
    cleanup: "🧹",
    clock: "⏱️",
    failure: "❌",
    info: "ℹ",
    output: "📁",
    package: "📦",
    running: "▶",
    success: "✅",
    task: "⚙️",
    verify: "✔",
    warning: "⚠️",
};
//# sourceMappingURL=style.js.map