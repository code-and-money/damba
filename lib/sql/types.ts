type VisitedColumn = {
  name: string;
  type: "uuid" | "string" | "date" | "datetime" | "boolean" | "number" | "integer" | "date-time" | "email" | "json" | "jsonb";
  default?: string | number | boolean;
  enum?: (string | number | boolean)[];
  description?: string;
  title?: string;
  metadata?: Record<string, any>;
};

type Reference = {
  table: string;
  column: string;
};

export type UnresolvedReference = {
  name: string;
  reference: string;
  schemaPath: string[];
  oneToMany: boolean;
};

export type ResolvedReference = {
  name: string;
  type: "string" | "boolean" | "integer" | "uuid" | "email" | "json" | "jsonb";
  reference: Reference;
  oneToMany: boolean;
};

export type VisitedTable = {
  name: string;
  required?: string[];
  primaryKey?: string;
  visitedColumns: VisitedColumn[];
  unresolvedReferences: UnresolvedReference[];
};

export type ResolvedTable = VisitedTable & {
  resolvedReferences: ResolvedReference[];
};

export type ValidationError = {
  path: string[];
  message: string;
};
