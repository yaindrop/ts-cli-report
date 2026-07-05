import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { formatDuration } from "./reporter.js";
import { icons } from "./style.js";
import { table } from "./table.js";
const maxBufferedLogBytes = 2_000_000;
const failureTailLines = 120;
const livePreviewColumns = 96;
function commandArgs(command) {
    return command.args ?? [];
}
function formatCommand(command) {
    return command.display ?? [command.command, ...commandArgs(command)].join(" ");
}
function stepCommands(step) {
    if (step.commands !== undefined && step.commands.length > 0) {
        return step.commands;
    }
    if (step.command !== undefined) {
        return [step.command];
    }
    return [];
}
function appendBufferedOutput(current, chunk) {
    const next = current + chunk.toString();
    if (next.length <= maxBufferedLogBytes) {
        return next;
    }
    return next.slice(next.length - maxBufferedLogBytes);
}
function cleanLines(output) {
    return output
        .replace(/\r/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}
function selectHighlightLines(step, lines) {
    const highlights = step.highlights ?? [];
    if (highlights.length === 0) {
        return [];
    }
    const seen = new Set();
    const selected = [];
    for (const line of lines) {
        if (!highlights.some((pattern) => pattern.test(line)) || seen.has(line)) {
            continue;
        }
        seen.add(line);
        selected.push(line);
    }
    return selected;
}
function truncate(value, columns) {
    if (value.length <= columns) {
        return value;
    }
    return `${value.slice(0, Math.max(1, columns - 1))}…`;
}
function clearLine(reporter) {
    if (!reporter.isTty || !("clearLine" in reporter.stdout)) {
        return;
    }
    const stdout = reporter.stdout;
    stdout.clearLine(0);
    stdout.cursorTo(0);
}
class LiveStatus {
    reporter;
    command;
    commandCount;
    latestLine = "starting";
    startedAt = performance.now();
    timer;
    constructor(reporter, command, commandCount) {
        this.reporter = reporter;
        this.command = command;
        this.commandCount = commandCount;
        this.timer = reporter.isTty
            ? setInterval(() => {
                this.render();
            }, 1000)
            : null;
        this.timer?.unref();
        this.render();
    }
    update(chunk) {
        const latest = cleanLines(chunk.toString()).at(-1);
        if (latest === undefined) {
            return;
        }
        this.latestLine = latest;
        this.render();
    }
    stop() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
        clearLine(this.reporter);
    }
    render() {
        if (!this.reporter.isTty) {
            return;
        }
        const style = this.reporter.style;
        const commandLabel = this.commandCount > 1
            ? `${style.color("blue", formatCommand(this.command))} ${style.color("gray", "·")} `
            : "";
        const timer = style.bold(style.color("cyan", `[${icons.clock} ${formatDuration(performance.now() - this.startedAt)}]`));
        const line = `  ${timer} ${style.color("yellow", icons.running)} ${commandLabel}${style.color("gray", truncate(this.latestLine, livePreviewColumns))}`;
        clearLine(this.reporter);
        this.reporter.stdout.write(line);
    }
}
function requireArtifact(artifact, stepTitle) {
    if (!existsSync(artifact.path)) {
        throw new Error(`${stepTitle} did not produce ${artifact.label}: ${artifact.path}`);
    }
    const stat = statSync(artifact.path);
    if (artifact.kind === "directory" && !stat.isDirectory()) {
        throw new Error(`${stepTitle} produced ${artifact.label}, but it is not a directory: ${artifact.path}`);
    }
    if ((artifact.kind ?? "file") === "file" && !stat.isFile()) {
        throw new Error(`${stepTitle} produced ${artifact.label}, but it is not a file: ${artifact.path}`);
    }
}
async function runCommand(reporter, command, step, buffered, commandCount) {
    return await new Promise((resolve, reject) => {
        let output = "";
        const liveStatus = buffered ? new LiveStatus(reporter, command, commandCount) : null;
        const child = spawn(command.command, commandArgs(command), {
            cwd: command.cwd,
            env: command.env ?? process.env,
            shell: false,
            stdio: buffered ? ["inherit", "pipe", "pipe"] : "inherit",
        });
        const capture = (chunk) => {
            output = appendBufferedOutput(output, chunk);
            liveStatus?.update(chunk);
        };
        if (buffered) {
            child.stdout?.on("data", capture);
            child.stderr?.on("data", capture);
        }
        child.on("error", (error) => {
            liveStatus?.stop();
            printFailureTail(reporter, step, output);
            reject(error);
        });
        child.on("exit", (code, signal) => {
            liveStatus?.stop();
            if (signal !== null) {
                printFailureTail(reporter, step, output);
                reject(new Error(`${step.title} command "${formatCommand(command)}" exited with signal ${signal}`));
                return;
            }
            if (code === 0) {
                resolve(output);
                return;
            }
            printFailureTail(reporter, step, output);
            reject(new Error(`${step.title} command "${formatCommand(command)}" exited with code ${code ?? "null"}`));
        });
    });
}
function printBufferedSummary(reporter, step, output) {
    const lines = cleanLines(output);
    const selected = selectHighlightLines(step, lines).slice(0, 10);
    const summary = selected.length === 0 ? lines.slice(-3) : selected;
    reporter.detail("output", reporter.style.color("yellow", `summarized ${lines.length} captured log line${lines.length === 1 ? "" : "s"}`));
    for (const line of summary) {
        reporter.write(`  ${reporter.style.color("gray", "↳")} ${line}`);
    }
}
function printFailureTail(reporter, step, output) {
    const lines = cleanLines(output);
    const tail = lines.slice(-failureTailLines);
    if (tail.length === 0) {
        return;
    }
    reporter.error(`${step.title} captured output tail (${tail.length}/${lines.length} lines)`);
    for (const line of tail) {
        reporter.stderr.write(`  ${reporter.style.color("gray", "│")} ${line}\n`);
    }
}
async function runStep(reporter, step, index, total, verbose) {
    reporter.write(`\n${reporter.style.bold(reporter.style.color("cyan", `${icons.running} [${index}/${total}] ${step.title}`))}`);
    if (step.purpose !== undefined) {
        reporter.detail("purpose", step.purpose);
    }
    const commands = stepCommands(step);
    if (commands.length === 1 && commands[0] !== undefined) {
        reporter.detail("command", reporter.style.bold(formatCommand(commands[0])));
    }
    else if (commands.length > 1) {
        reporter.detail("commands", String(commands.length));
    }
    for (const artifact of step.expectedArtifacts ?? []) {
        reporter.write(`  ${reporter.style.color("gray", `expects ${artifact.kind ?? "file"}:`)} ${artifact.label} ${reporter.style.color("gray", "->")} ${reporter.style.color("cyan", artifact.path)}`);
    }
    const startedAt = performance.now();
    const buffered = step.output === "buffered" && !verbose;
    try {
        if (step.run !== undefined) {
            await step.run();
        }
        let combinedOutput = "";
        for (const [commandIndex, command] of commands.entries()) {
            if (commands.length > 1) {
                reporter.detail(`command ${commandIndex + 1}/${commands.length}`, reporter.style.bold(formatCommand(command)));
            }
            combinedOutput += await runCommand(reporter, command, step, buffered, commands.length);
        }
        if (buffered) {
            printBufferedSummary(reporter, step, combinedOutput);
        }
        for (const artifact of step.expectedArtifacts ?? []) {
            requireArtifact(artifact, step.title);
            reporter.write(`  ${reporter.style.color("green", icons.verify)} ${reporter.style.color("gray", "verified:")} ${artifact.label}`);
        }
    }
    catch (error) {
        const elapsedMs = performance.now() - startedAt;
        reporter.error(`[${index}/${total}] ${step.title} failed after ${formatDuration(elapsedMs)}`);
        return { title: step.title, elapsedMs, status: "failed" };
    }
    const elapsedMs = performance.now() - startedAt;
    reporter.success(`[${index}/${total}] ${step.title} completed in ${formatDuration(elapsedMs)}`);
    return { title: step.title, elapsedMs, status: "completed" };
}
export async function runPipeline(reporter, pipeline) {
    reporter.section(pipeline.title, "package");
    const startedAt = performance.now();
    const timings = [];
    for (const [index, step] of pipeline.steps.entries()) {
        const timing = await runStep(reporter, step, index + 1, pipeline.steps.length, pipeline.verbose === true);
        timings.push(timing);
        if (timing.status === "failed") {
            printTimingSummary(reporter, timings, performance.now() - startedAt);
            throw new Error(`${step.title} failed`);
        }
    }
    printTimingSummary(reporter, timings, performance.now() - startedAt);
}
export function printTimingSummary(reporter, timings, totalElapsedMs) {
    reporter.section("Timing summary", "clock");
    reporter.detail("wall clock", reporter.style.bold(formatDuration(totalElapsedMs)));
    const rows = timings.map((timing) => ({
        Step: timing.title,
        Status: timing.status,
        Duration: formatDuration(timing.elapsedMs),
    }));
    reporter.write(table(rows, { columns: ["Step", "Status", "Duration"] }));
}
//# sourceMappingURL=pipeline.js.map