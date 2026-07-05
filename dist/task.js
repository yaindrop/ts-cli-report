import { performance } from "node:perf_hooks";
import { formatDuration } from "./reporter.js";
import { icons } from "./style.js";
export async function runTask(reporter, task) {
    reporter.section(task.title, "task");
    if (task.detail !== undefined) {
        reporter.detail("detail", task.detail);
    }
    const startedAt = performance.now();
    reporter.write(`  ${reporter.style.color("yellow", icons.running)} running`);
    try {
        await task.run();
    }
    catch (error) {
        reporter.error(`${task.title} failed after ${formatDuration(performance.now() - startedAt)}`);
        throw error;
    }
    reporter.success(`${task.title} completed in ${formatDuration(performance.now() - startedAt)}`);
}
//# sourceMappingURL=task.js.map