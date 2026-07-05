export type TableCell = boolean | number | string | null | undefined;
export type TableRow = Record<string, TableCell>;

export interface TableOptions {
  readonly columns?: readonly string[];
  readonly emptyText?: string;
}

function printable(value: TableCell): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function padRight(value: string, width: number): string {
  return value.padEnd(width, " ");
}

export function table(rows: readonly TableRow[], options: TableOptions = {}): string {
  if (rows.length === 0) {
    return options.emptyText ?? "(no rows)";
  }
  const columns =
    options.columns ??
    [...new Set(rows.flatMap((row) => Object.keys(row)))].sort((a, b) =>
      a.localeCompare(b),
    );
  const widths = columns.map((column) =>
    Math.max(column.length, ...rows.map((row) => printable(row[column]).length)),
  );
  const renderRow = (values: readonly string[]): string =>
    values.map((value, index) => padRight(value, widths[index] ?? 0)).join("  ");
  return [
    renderRow(columns),
    renderRow(widths.map((width) => "-".repeat(width))),
    ...rows.map((row) => renderRow(columns.map((column) => printable(row[column])))),
  ].join("\n");
}
