# ts-cli-report

Composable reporting primitives for modern TypeScript CLI tools.

The library is intentionally business-agnostic. It provides four report shapes
that cover most repository automation scripts:

- **Step Pipeline**: multi-step build, release, deploy, or migration flows.
- **Task Runner**: lightweight day-to-day task orchestration.
- **Audit Report**: pass/fail checks with clear issue summaries.
- **Data Summary / Table**: artifact summaries, metrics, and tabular output.

It has no runtime dependencies and respects `NO_COLOR`, `FORCE_COLOR`, and TTY
capabilities.

```ts
import {
  createReporter,
  runAudit,
  runPipeline,
  runTask,
  table,
} from "ts-cli-report";

const reporter = createReporter();

await runTask(reporter, {
  title: "Generate API client",
  run: async () => {
    // work here
  },
});

await runPipeline(reporter, {
  title: "Release package",
  steps: [
    {
      title: "Build",
      command: { command: "pnpm", args: ["build"] },
      output: "buffered",
      highlights: [/built in/i],
    },
  ],
});

await runAudit(reporter, {
  title: "Release audit",
  checks: [
    {
      title: "artifact exists",
      run: () => ({ status: "passed" }),
    },
  ],
});

reporter.section("Artifacts", "output");
reporter.write(
  table([
    { name: "app.dmg", size: "142 MB", sha256: "..." },
  ]),
);
```
