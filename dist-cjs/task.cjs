"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTask = runTask;
const node_perf_hooks_1 = require("node:perf_hooks");
const reporter_js_1 = require("./reporter.cjs");
const style_js_1 = require("./style.cjs");
async function runTask(reporter, task) {
    reporter.section(task.title, "task");
    if (task.detail !== undefined) {
        reporter.detail("detail", task.detail);
    }
    const startedAt = node_perf_hooks_1.performance.now();
    reporter.write(`  ${reporter.style.color("yellow", style_js_1.icons.running)} running`);
    try {
        await task.run();
    }
    catch (error) {
        reporter.error(`${task.title} failed after ${(0, reporter_js_1.formatDuration)(node_perf_hooks_1.performance.now() - startedAt)}`);
        throw error;
    }
    reporter.success(`${task.title} completed in ${(0, reporter_js_1.formatDuration)(node_perf_hooks_1.performance.now() - startedAt)}`);
}
//# sourceMappingURL=task.cjs.map