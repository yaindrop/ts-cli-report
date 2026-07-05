import { performance } from "node:perf_hooks";

import { formatDuration, type Reporter } from "./reporter.js";
import { icons } from "./style.js";

export interface TaskReport {
  readonly title: string;
  readonly detail?: string;
  readonly run: () => Promise<void> | void;
}

export async function runTask(reporter: Reporter, task: TaskReport): Promise<void> {
  reporter.section(task.title, "task");
  if (task.detail !== undefined) {
    reporter.detail("detail", task.detail);
  }
  const startedAt = performance.now();
  reporter.write(`  ${reporter.style.color("yellow", icons.running)} running`);
  try {
    await task.run();
  } catch (error) {
    reporter.error(`${task.title} failed after ${formatDuration(performance.now() - startedAt)}`);
    throw error;
  }
  reporter.success(`${task.title} completed in ${formatDuration(performance.now() - startedAt)}`);
}
