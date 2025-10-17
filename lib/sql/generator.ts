import knex from "knex";
import type { ResolvedTable, VisitedColumn } from "./types";

export function generateSql(resolvedTables: ResolvedTable[], dialect: "pg" | "mysql" = "pg"): { up: string[]; down: string[] } {
  const db = knex({ client: dialect });

  const up: string[] = [];
  const down: string[] = [];

  for (const resolvedTable of resolvedTables) {
    down.push(db.raw(`drop table if exists "${resolvedTable.name}" cascade;`).toSQL().sql);

    const builder = db.schema.createTable(resolvedTable.name, (table) => {
      for (const visitedColumn of resolvedTable.visitedColumns) {
        let column = getColumn({ visitedColumn, table });

        if (visitedColumn.enum) {
          const enumName = `${resolvedTable.name}_${visitedColumn.name}_enum`;

          column = table.enum(visitedColumn.name, visitedColumn.enum, { enumName, useNative: true });

          down.push(db.raw(`drop type "${enumName}";`).toSQL().sql);
        }

        if (visitedColumn.metadata) {
          if (visitedColumn.metadata.index) {
            column.index();
          }

          if (visitedColumn.metadata.unique) {
            column.unique();
          }

          if (visitedColumn.metadata.default) {
            column.defaultTo(db.raw(visitedColumn.metadata.default));
          }
        }

        if (resolvedTable.required?.includes(visitedColumn.name) || visitedColumn.metadata?.notNull) {
          column.notNullable();
        }

        if (visitedColumn.default) {
          column.defaultTo(visitedColumn.default);
        }

        if (typeof visitedColumn?.metadata?.comment === "string" && visitedColumn.metadata.comment) {
          column.comment(visitedColumn?.metadata.comment);
        } else if (visitedColumn.title && visitedColumn.description) {
          column.comment(`${visitedColumn.title}: ${visitedColumn.description}`);
        } else if (visitedColumn.title) {
          column.comment(visitedColumn.title);
        } else if (visitedColumn.description) {
          column.comment(visitedColumn.description);
        }

        if (visitedColumn.type === "integer") {
          if ("minimum" in visitedColumn && typeof visitedColumn.minimum === "number") {
            table.check(` "${resolvedTable.name}"."${visitedColumn.name}" >= ${visitedColumn.minimum} `);
          }

          if ("maximum" in visitedColumn && typeof visitedColumn.maximum === "number") {
            table.check(` "${resolvedTable.name}"."${visitedColumn.name}" <= ${visitedColumn.maximum} `);
          }
        }
      }

      if (resolvedTable.primaryKey) {
        table.primary([resolvedTable.primaryKey]);
      } else if (resolvedTable.visitedColumns.find((column) => column.name === "id")) {
        table.primary(["id"]);
      }
    });

    up.push(...builder.toSQL().map((q) => `${q.sql};`));
  }

  for (const resolvedTable of resolvedTables) {
    const builder = db.schema.alterTable(resolvedTable.name, (table) => {
      for (const resolvedReference of resolvedTable.resolvedReferences) {
        const { type, name, reference, oneToMany } = resolvedReference;

        switch (type) {
          case "uuid":
            table.uuid(name).references(reference.column).inTable(reference.table);
            break;

          case "string":
            table.text(name).references(reference.column).inTable(reference.table);
            break;

          case "boolean":
            table.boolean(name).references(reference.column).inTable(reference.table);
            break;

          case "integer":
            table.integer(name).references(reference.column).inTable(reference.table);
            break;
        }

        if (!oneToMany) {
          table.unique(name);
        }
      }
    });

    up.push(...builder.toSQL().map((q) => `${q.sql};`));
  }

  return { up, down };
}

function getColumn({ visitedColumn, table }: { visitedColumn: VisitedColumn; table: knex.Knex.CreateTableBuilder }): knex.Knex.ColumnBuilder {
  switch (visitedColumn.type) {
    case "uuid":
      return table.uuid(visitedColumn.name);

    case "email":
      return table.text(visitedColumn.name);

    case "json":
      return table.json(visitedColumn.name);

    case "jsonb":
      return table.jsonb(visitedColumn.name);

    case "string":
      return table.text(visitedColumn.name);

    case "boolean":
      return table.boolean(visitedColumn.name);

    case "date":
      return table.date(visitedColumn.name);

    case "datetime":
      return table.datetime(visitedColumn.name);

    case "date-time":
      return table.datetime(visitedColumn.name);

    case "number":
      return table.float(visitedColumn.name);

    case "integer":
      return table.integer(visitedColumn.name);

    default:
      // console.warn("Shoud never run! visitedColumn:", visitedColumn);
  }
}
