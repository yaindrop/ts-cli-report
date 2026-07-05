import { icons, type IconName, Style, type StyleOptions } from "./style.js";

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

export function createReporter(options: ReporterOptions = {}): Reporter {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const isTty =
    options.isTty ?? Boolean("isTTY" in stdout && stdout.isTTY === true);
  const style = new Style({ ...options, isTty });

  const writeLine = (stream: NodeJS.WritableStream, message = ""): void => {
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
      writeLine(stderr, style.bold(style.color("red", `${icons.failure} ${message}`)));
    },
    section: (title, icon = "info") => {
      writeLine(stdout);
      writeLine(stdout, style.bold(style.color("blue", `${icons[icon]} ${title}`)));
    },
    success: (message) => {
      writeLine(stdout, style.bold(style.color("green", `${icons.success} ${message}`)));
    },
    warn: (message) => {
      writeLine(stderr, style.bold(style.color("yellow", `${icons.warning} ${message}`)));
    },
    write: (message) => {
      writeLine(stdout, message);
    },
  };
}

export function formatDuration(milliseconds: number): string {
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
