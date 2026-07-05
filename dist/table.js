function printable(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
}
function visibleLength(value) {
    return value.replace(/\u001b\[[0-9;]*m/g, "").length;
}
function padRight(value, width) {
    return `${value}${" ".repeat(Math.max(0, width - visibleLength(value)))}`;
}
export function table(rows, options = {}) {
    if (rows.length === 0) {
        return options.emptyText ?? "(no rows)";
    }
    const columns = options.columns ??
        [...new Set(rows.flatMap((row) => Object.keys(row)))].sort((a, b) => a.localeCompare(b));
    const widths = columns.map((column) => Math.max(column.length, ...rows.map((row) => visibleLength(printable(row[column])))));
    const renderRow = (values) => values.map((value, index) => padRight(value, widths[index] ?? 0)).join("  ");
    return [
        renderRow(columns),
        renderRow(widths.map((width) => "-".repeat(width))),
        ...rows.map((row) => renderRow(columns.map((column) => printable(row[column])))),
    ].join("\n");
}
//# sourceMappingURL=table.js.map