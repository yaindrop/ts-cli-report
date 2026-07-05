"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReporter = createReporter;
exports.formatDuration = formatDuration;
const style_js_1 = require("./style.cjs");
function createReporter(options = {}) {
    const stdout = options.stdout ?? process.stdout;
    const stderr = options.stderr ?? process.stderr;
    const isTty = options.isTty ?? Boolean("isTTY" in stdout && stdout.isTTY === true);
    const style = new style_js_1.Style({ ...options, isTty });
    const writeLine = (stream, message = "") => {
        stream.write(`${message}\n`);
    };
    return {
        stderr,
        stdout,
        style,
        isTty,
        blank: () => {
            writeLine(stdout);
        },
        detail: (label, value) => {
            writeLine(stdout, `  ${style.color("gray", `${label}:`)} ${value}`);
        },
        error: (message) => {
            writeLine(stderr, style.bold(style.color("red", `${style_js_1.icons.failure} ${message}`)));
        },
        section: (title, icon = "info") => {
            writeLine(stdout);
            writeLine(stdout, style.bold(style.color("blue", `${style_js_1.icons[icon]} ${title}`)));
        },
        success: (message) => {
            writeLine(stdout, style.bold(style.color("green", `${style_js_1.icons.success} ${message}`)));
        },
        warn: (message) => {
            writeLine(stderr, style.bold(style.color("yellow", `${style_js_1.icons.warning} ${message}`)));
        },
        write: (message) => {
            writeLine(stdout, message);
        },
    };
}
function formatDuration(milliseconds) {
    if (milliseconds < 1000) {
        return `${Math.round(milliseconds)}ms`;
    }
    if (milliseconds < 60_000) {
        const seconds = milliseconds / 1000;
        return `${seconds.toFixed(seconds < 10 ? 2 : 1)}s`;
    }
    const minutes = Math.floor(milliseconds / 60_000);
    const seconds = (milliseconds - minutes * 60_000) / 1000;
    return `${minutes}m ${seconds.toFixed(1)}s`;
}
//# sourceMappingURL=reporter.cjs.map