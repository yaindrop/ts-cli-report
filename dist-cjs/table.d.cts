export type TableCell = boolean | number | string | null | undefined;
export type TableRow = Record<string, TableCell>;
export interface TableOptions {
    readonly columns?: readonly string[];
    readonly emptyText?: string;
}
export declare function table(rows: readonly TableRow[], options?: TableOptions): string;
//# sourceMappingURL=table.d.ts.map