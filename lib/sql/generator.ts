import knex from "knex";
import type { ResolvedTable } from "./types";

export function generateSql(resolvedTables: ResolvedTable[], dialect: "pg" | "mysql" = "pg"): { up: string[]; down: string[] } {
  const db = knex({ client: dialect });

  const up: string[] = [];
  const down: string[] = [];

  for (const resolvedTable of resolvedTables) {
    down.push(db.raw(`drop table if exists "${resolvedTable.name}" cascade;`).toSQL().sql);

    const builder = db.schema.createTable(resolvedTable.name, (table) => {
      for (const visitedColumn of resolvedTable.visitedColumns) {
        const { type, name } = visitedColumn;

        let col;

        switch (type) {
          case "uuid":
            col = table.uuid(name);
            break;

          case "email":
            col = table.text(name);
            break;

          case "json":
            col = table.json(name);
            break;

          case "jsonb":
            col = table.jsonb(name);
            break;

          case "string":
            col = table.text(name);
            break;

          case "boolean":
            col = table.boolean(name);
            break;

          case "date":
            col = table.date(name);
            break;

          case "datetime":
            col = table.datetime(name);
            break;

          case "date-time":
            col = table.datetime(name);
            break;

          case "number":
            col = table.float(name);
            break;

          case "integer":
            col = table.integer(name);
            break;
        }

        if (visitedColumn.enum) {
          const enumName = `${resolvedTable.name}_${name}_enum`;

          col = table.enum(name, visitedColumn.enum, {
            enumName,
            useNative: true,
          });

          down.push(db.raw(`drop type "${enumName}";`).toSQL().sql);
        }

        if (visitedColumn.metadata) {
          if (visitedColumn.metadata.index) {
            col.index();
          }

          if (visitedColumn.metadata.unique) {
            col.unique();
          }

          if (visitedColumn.metadata.default) {
            col.defaultTo(db.raw(visitedColumn.metadata.default));
          }
        }

        if (resolvedTable.required?.includes(name)) {
          col.notNullable();
        }

        if (visitedColumn.default) {
          col.defaultTo(visitedColumn.default);
        }

        if (typeof visitedColumn?.metadata?.comment === "string" && visitedColumn.metadata.comment) {
          col.comment(visitedColumn?.metadata.comment);
        } else if (visitedColumn.title && visitedColumn.description) {
          col.comment(`${visitedColumn.title}: ${visitedColumn.description}`);
        } else if (visitedColumn.title) {
          col.comment(visitedColumn.title);
        } else if (visitedColumn.description) {
          col.comment(visitedColumn.description);
        }
      }

      if (resolvedTable.primaryKey) {
        table.primary([resolvedTable.primaryKey]);
      } else if (resolvedTable.visitedColumns.find((c) => c.name === "id")) {
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

  return { down, up };
}
