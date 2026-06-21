import { getTable, insertRow, removeRows, nowIso } from "./store";

type FilterOp = "eq" | "neq" | "in" | "gte" | "lte" | "gt" | "lt";
type Filter = { op: FilterOp; col: string; val: any };
type Order = { col: string; ascending: boolean };
type Mode = "array" | "single" | "maybeSingle";

export interface QuerySpec {
  table: string;
  opType: "select" | "insert" | "update" | "delete" | "upsert";
  columns: string;
  filters: Filter[];
  orders: Order[];
  limitN: number | null;
  mode: Mode;
  payload?: any;
  countOpts?: { count?: string; head?: boolean };
}

// Hardcoded FK relations for the embedded-select syntax this codebase actually uses
// (e.g. "*, service:services(*)"). Not a generic PostgREST embedding engine.
const RELATIONS: Record<string, Record<string, { table: string; localKey: string; foreignKey: string }>> = {
  bookings: {
    service: { table: "services", localKey: "service_id", foreignKey: "id" },
    profile: { table: "profiles", localKey: "user_id", foreignKey: "id" }
  },
  reviews: {
    profile: { table: "profiles", localKey: "user_id", foreignKey: "id" }
  }
};

function project(table: string, row: any, columns: string): any {
  if (!row) return row;
  if (!columns || columns.trim() === "*") return { ...row };

  const embedRegex = /(\w+):(\w+)\(([^)]*)\)/g;
  const embeds: { alias: string; cols: string }[] = [];
  let rest = columns;
  let m: RegExpExecArray | null;
  while ((m = embedRegex.exec(columns))) {
    embeds.push({ alias: m[1], cols: m[3].trim() });
    rest = rest.replace(m[0], "");
  }

  const plainCols = rest.split(",").map((s) => s.trim()).filter(Boolean);
  let base: any;
  if (plainCols.length === 0 || plainCols.includes("*")) base = { ...row };
  else {
    base = {};
    for (const c of plainCols) base[c] = row[c];
  }

  for (const e of embeds) {
    const relConf = RELATIONS[table]?.[e.alias];
    if (!relConf) {
      base[e.alias] = null;
      continue;
    }
    const relRows = getTable(relConf.table);
    const found = relRows.find((r: any) => r[relConf.foreignKey] === row[relConf.localKey]);
    base[e.alias] = found ? project(relConf.table, found, e.cols || "*") : null;
  }
  return base;
}

function applyFilters(rows: any[], filters: Filter[]) {
  return rows.filter((row) =>
    filters.every((f) => {
      const v = row[f.col];
      switch (f.op) {
        case "eq": return v === f.val;
        case "neq": return v !== f.val;
        case "in": return Array.isArray(f.val) && f.val.includes(v);
        case "gte": return v >= f.val;
        case "lte": return v <= f.val;
        case "gt": return v > f.val;
        case "lt": return v < f.val;
        default: return true;
      }
    })
  );
}

function applyOrders(rows: any[], orders: Order[]) {
  if (!orders.length) return rows;
  return [...rows].sort((a, b) => {
    for (const o of orders) {
      const av = a[o.col];
      const bv = b[o.col];
      if (av === bv) continue;
      if (av === undefined || av === null) return o.ascending ? -1 : 1;
      if (bv === undefined || bv === null) return o.ascending ? 1 : -1;
      return av < bv ? (o.ascending ? -1 : 1) : (o.ascending ? 1 : -1);
    }
    return 0;
  });
}

function finalize(rows: any[], mode: Mode) {
  if (mode === "single") {
    return rows[0] !== undefined
      ? { data: rows[0], error: null }
      : { data: null, error: { message: "Row not found" } };
  }
  if (mode === "maybeSingle") return { data: rows[0] ?? null, error: null };
  return { data: rows, error: null };
}

export async function runQuerySpec(spec: QuerySpec): Promise<{ data: any; error: any; count?: number }> {
  const table = getTable(spec.table);

  if (spec.opType === "select") {
    if (spec.countOpts?.head) {
      const matched = applyFilters(table, spec.filters);
      return { data: null, error: null, count: matched.length };
    }
    let rows = applyFilters(table, spec.filters);
    rows = applyOrders(rows, spec.orders);
    if (spec.limitN != null) rows = rows.slice(0, spec.limitN);
    const projected = rows.map((r) => project(spec.table, r, spec.columns));
    return finalize(projected, spec.mode);
  }

  if (spec.opType === "insert") {
    const payloads = Array.isArray(spec.payload) ? spec.payload : [spec.payload];
    const inserted = payloads.map((p) => insertRow(spec.table, p));
    const projected = inserted.map((r) => project(spec.table, r, spec.columns));
    return finalize(projected, spec.mode);
  }

  if (spec.opType === "update") {
    const matched = applyFilters(table, spec.filters);
    matched.forEach((r) => Object.assign(r, spec.payload, { updated_at: nowIso() }));
    const projected = matched.map((r) => project(spec.table, r, spec.columns));
    return finalize(projected, spec.mode);
  }

  if (spec.opType === "upsert") {
    const id = spec.payload?.id;
    const existing = id ? table.find((r: any) => r.id === id) : undefined;
    const row = existing
      ? Object.assign(existing, spec.payload, { updated_at: nowIso() })
      : insertRow(spec.table, spec.payload);
    const projected = project(spec.table, row, spec.columns);
    return finalize([projected], spec.mode === "array" ? "array" : spec.mode);
  }

  if (spec.opType === "delete") {
    const matched = applyFilters(table, spec.filters);
    removeRows(spec.table, new Set(matched.map((r: any) => r.id)));
    return finalize([], spec.mode);
  }

  return { data: null, error: { message: "unsupported_operation" } };
}

export type QueryExecutor = (spec: QuerySpec) => Promise<{ data: any; error: any; count?: number }>;

export class MockQueryBuilder implements PromiseLike<{ data: any; error: any; count?: number }> {
  private spec: QuerySpec;

  constructor(private executor: QueryExecutor, table: string) {
    this.spec = { table, opType: "select", columns: "*", filters: [], orders: [], limitN: null, mode: "array" };
  }

  select(columns: string = "*", opts?: { count?: string; head?: boolean }) {
    this.spec.columns = columns;
    if (opts) this.spec.countOpts = opts;
    return this;
  }
  eq(col: string, val: any) { this.spec.filters.push({ op: "eq", col, val }); return this; }
  neq(col: string, val: any) { this.spec.filters.push({ op: "neq", col, val }); return this; }
  in(col: string, val: any[]) { this.spec.filters.push({ op: "in", col, val }); return this; }
  gte(col: string, val: any) { this.spec.filters.push({ op: "gte", col, val }); return this; }
  lte(col: string, val: any) { this.spec.filters.push({ op: "lte", col, val }); return this; }
  gt(col: string, val: any) { this.spec.filters.push({ op: "gt", col, val }); return this; }
  lt(col: string, val: any) { this.spec.filters.push({ op: "lt", col, val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this.spec.orders.push({ col, ascending: opts?.ascending !== false });
    return this;
  }
  limit(n: number) { this.spec.limitN = n; return this; }
  single() { this.spec.mode = "single"; return this; }
  maybeSingle() { this.spec.mode = "maybeSingle"; return this; }
  insert(payload: any) { this.spec.opType = "insert"; this.spec.payload = payload; return this; }
  update(payload: any) { this.spec.opType = "update"; this.spec.payload = payload; return this; }
  upsert(payload: any) { this.spec.opType = "upsert"; this.spec.payload = payload; return this; }
  delete() { this.spec.opType = "delete"; return this; }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.executor(this.spec).then(onfulfilled as any, onrejected as any);
  }
}
