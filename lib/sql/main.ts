import { generateSql } from "./generator";
import { resolveReferences } from "./reference";
import type { ValidationError, VisitedTable } from "./types";
import { visitTable } from "./visitor";
import * as v from "valibot";
import { DatabaseSchema } from "./validation.v";
import { colorize } from "json-colorizer";
import { configure, getConsoleSink } from "@logtape/logtape";
import { getLogger } from "@logtape/logtape";
import { styleText } from "node:util";
import Ajv from "ajv";
import type { JSONSchema7 } from "json-schema";

const LIB_LOGGER = "@codeandmoney/damba::sql";

await configure({
  sinks: {
    console: getConsoleSink({
      formatter: (some) => `${styleText("green", some.message[0] as string)}${colorize(JSON.parse(JSON.stringify(some.message[1], null, 2)))}`,
    }),
  },
  loggers: [
    { category: ["logtape", "meta"], lowestLevel: "fatal", sinks: ["console"] },
    { category: LIB_LOGGER, lowestLevel: "fatal", sinks: ["console"] },
  ],
});

function ajvValidate(schema: unknown) {
  try {
    return new Ajv().validateSchema(schema as JSONSchema7, true);
  } catch {
    return;
  }
}

export function jsonSchemaToSql(
  schema: unknown,
  dialect: "pg" | "mysql" = "pg",
): { queries: { up: string[]; down: string[] }; errors: null } | { queries: null; errors: ValidationError[] } {
  const logger = getLogger(LIB_LOGGER);

  const isAjvValid = ajvValidate(schema);
  if (!isAjvValid) {
    console.warn("ajv: Invalid JSON Schema syntax");
    return {
      queries: null,
      errors: [{ path: ["#"], message: "Invalid JSON Schema syntax" }],
    };
  }

  logger.debug("Schema: {schema}.", { schema });

  const parsed = v.safeParse(DatabaseSchema, schema);

  logger.debug("Parsed: {parsed}.", { parsed });

  if (!parsed.success) {
    return {
      queries: null,
      errors: [{ message: v.summarize(parsed.issues), path: [""] }],
    };
  }

  const visitedTables: VisitedTable[] = [];
  for (const [tableName, table] of Object.entries<any>(parsed.output.properties)) {
    visitTable(visitedTables, tableName, table, [], ["properties"]);
  }

  const resolutionResult = resolveReferences(visitedTables);
  if (!resolutionResult.success) {
    return {
      queries: null,
      errors: resolutionResult.errors,
    };
  }

  const queries = generateSql(resolutionResult.resolvedTables, dialect);

  return { queries, errors: null };
}
