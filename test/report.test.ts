import assert from "node:assert/strict";
import { Writable } from "node:stream";
import test from "node:test";

import {
  AuditFailure,
  createReporter,
  runAudit,
  runPipeline,
  runTask,
  table,
} from "../src/index.js";

class MemoryStream extends Writable {
  chunks: string[] = [];
  readonly isTTY = false;

  override _write(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.chunks.push(chunk.toString());
    callback();
  }

  text(): string {
    return this.chunks.join("");
  }
}

function memoryReporter() {
  const stdout = new MemoryStream();
  const stderr = new MemoryStream();
  return {
    reporter: createReporter({ color: false, stderr, stdout }),
    stderr,
    stdout,
  };
}

test("table renders stable columns", () => {
  assert.equal(
    table(
      [
        { name: "app.dmg", size: "142 MB" },
        { name: "app.zip", size: "140 MB" },
      ],
      { columns: ["name", "size"] },
    ),
    ["name     size  ", "-------  ------", "app.dmg  142 MB", "app.zip  140 MB"].join(
      "\n",
    ),
  );
});

test("table ignores ANSI escape codes when measuring columns", () => {
  assert.equal(
    table([{ status: "\u001b[32mok\u001b[39m", next: "value" }], {
      columns: ["status", "next"],
    }),
    ["status  next ", "------  -----", "\u001b[32mok\u001b[39m      value"].join("\n"),
  );
});

test("runAudit throws AuditFailure with issues", async () => {
  const { reporter, stderr, stdout } = memoryReporter();
  await assert.rejects(
    runAudit(reporter, {
      title: "Audit",
      checks: [{ title: "required file", run: () => ({ status: "failed", issues: ["missing"] }) }],
    }),
    AuditFailure,
  );
  assert.match(stdout.text(), /required file/);
  assert.match(stderr.text(), /Audit failed/);
});

test("runTask reports completion", async () => {
  const { reporter, stdout } = memoryReporter();
  await runTask(reporter, {
    title: "Compile",
    run: () => undefined,
  });
  assert.match(stdout.text(), /Compile completed/);
});

test("runPipeline supports buffered command output and highlights", async () => {
  const { reporter, stdout } = memoryReporter();
  await runPipeline(reporter, {
    title: "Pipeline",
    steps: [
      {
        title: "Echo",
        command: {
          command: process.execPath,
          args: ["-e", "console.log('important: done')"],
        },
        highlights: [/important/],
        output: "buffered",
      },
    ],
  });
  assert.match(stdout.text(), /important: done/);
  assert.match(stdout.text(), /Timing summary/);
});
