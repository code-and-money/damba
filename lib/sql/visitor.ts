import type { Column, RefColumn, Table } from "./validation";
import type { VisitedTable } from "./types";

function visitColumn(
  parent: Table,
  visitedTables: VisitedTable[],
  visitedTable: VisitedTable,
  columnName: string,
  column: Column,
  path: string[] = [],
  schemaPath: string[] = [],
  oneToMany = false,
) {
  if ("$ref" in column) {
    visitedTable.unresolvedReferences.push({ name: columnName, reference: column.$ref, schemaPath, oneToMany });
  }

  const parentPrimaryKeyRef: Record<string, RefColumn> = parent["x-primary-key"]
    ? { [[...path, parent["x-primary-key"]].join("_")]: { $ref: ["#", ...path, parent["x-primary-key"]].join("/") } }
    : { [[...path, "id"].join("_")]: { $ref: ["#", ...path, "id"].join("/") } };

  if ("type" in column) {
    if (column.type === "object") {
      visitTable(visitedTables, columnName, { ...column, properties: { ...column.properties, ...parentPrimaryKeyRef } }, path, schemaPath);
      return;
    }

    if (column.type === "array") {
      if ("type" in column.items) {
        if (column.items.type === "object") {
          visitTable(
            visitedTables,
            columnName,
            { ...column.items, properties: { ...column.items.properties, ...parentPrimaryKeyRef } },
            path,
            schemaPath,
            true,
          );
        } else {
          visitTable(visitedTables, columnName, { type: "object", properties: { value: column.items, ...parentPrimaryKeyRef } }, path, schemaPath, true);
        }
      }

      return;
    }
  }

  if ("format" in column && column.format) {
    visitedTable.visitedColumns.push({ name: columnName, ...column, type: column.format });
  } else {
    // FIX: fixme, maybe...
    // @ts-expect-error : dunno...
    visitedTable.visitedColumns.push({ name: columnName, ...column });
  }
}

export function visitTable(
  visitedTables: VisitedTable[],
  tableName: string,
  table: Table,
  path: string[] = [],
  schemaPath: string[] = [],
  fromArray: boolean = false,
) {
  const visitedTable: VisitedTable = {
    name: [...path, tableName].join("_"),
    required: table.required,
    primaryKey: table["x-primary-key"],
    visitedColumns: [],
    unresolvedReferences: [],
  };

  for (const [columnName, column] of Object.entries(table.properties)) {
    visitColumn(
      table,
      visitedTables,
      visitedTable,
      columnName,
      column,
      [...path, tableName],
      [...schemaPath, tableName, ...(fromArray ? ["items"] : []), "properties"],
      fromArray,
    );
  }

  visitedTables.push(visitedTable);
}
