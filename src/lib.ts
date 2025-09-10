import { Client } from "pg"
import type { CraeteConfig, DatabaseCredentials, DropConfig } from "./types.js"

const pgErrors: Record<string, { name: string; code: string; message: string }> = {
  "42P04": { name: "PDG_ERR::DuplicateDatabase", code: "42P04", message: "Database already exist." },
  "3D000": { name: "PDG_ERR::InvalidCatalogName", code: "3D000", message: "Database does not exist." },
  "23505": { name: "PDG_ERR::UniqueViolation", code: "23505", message: "Attempt to create multiple databases concurrently." },
  "55006": { name: "PDG_ERR::DropDatabaseInUse", code: "55006", message: "Cannot delete a database that is being accessed by other users." },
}

export class PgToolsError implements Error {
  constructor(
    readonly name: string,
    readonly message: string,
    readonly code: string,
    readonly stack?: string,
  ) {}

  public static fromPgToolsError(pgToolsError: Error & { code?: string }): PgToolsError {
    return new PgToolsError(
      pgToolsError.code ? pgErrors[pgToolsError.code]?.name : "PDG_ERR::UnexpectedError",
      pgToolsError.code ? pgErrors[pgToolsError.code]?.message : pgToolsError.message,
      pgToolsError.code || "unknown",
      pgToolsError.stack,
    )
  }

  public static dbExists(): PgToolsError {
    const code = "42P04"
    return new PgToolsError(pgErrors[code]?.name, pgErrors[code]?.message, code, Error().stack)
  }

  public static dbDoesNotExist(): PgToolsError {
    const code = "3D000"
    return new PgToolsError(pgErrors[code]?.name, pgErrors[code]?.message, code, Error().stack)
  }
}

const defaultCredentials: DatabaseCredentials = {
  user: "postgres",
  database: "postgres",
  password: "postgres",
  port: 5432,
  host: "localhost",
}

/**
 * @param config Requires a `database` you are trying to create. `existsError` is default to false. When `existsError` is `true`,
 * it will throw error when database already exist before executing creation.
 * @param credentials Default to localhost:5432 `postgres` database and `postgres` user with empty password.
 * @throws `PgDbGodError` More details at `pgErrors`.
 *
 * @example create({ database: 'bank-development' })
 */
export async function create({ config, credentials }: { config: CraeteConfig; credentials?: Partial<DatabaseCredentials> }) {
  const client = new Client({ ...defaultCredentials, ...credentials })

  try {
    await client.connect()

    const db = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${config.database}');
    `)

    if (!db?.rowCount) {
      throw new Error("Error getting query result")
    }

    if (db?.rowCount > 0 && config.existsError) {
      throw PgToolsError.dbExists()
    }

    if (db?.rowCount > 0 && !config.existsError) {
      return
    }

    await client.query(`CREATE DATABASE "${config.database}";`)
  } catch (error) {
    if (error instanceof PgToolsError) {
      throw PgToolsError.fromPgToolsError(error)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error(`unknown error: ${JSON.stringify(error, null, 2)}`)
  } finally {
    await client.end()
  }
}

/**
 * @param config.database Requires a `database` you are trying to drop.
 * @param config.notExistsError is default to false. When `notExistsError` is `true`, it will throw error when database doesn't exist before executing drop.
 * @param config.dropConnections is default to true. When `dropConnections` is `true`, it will automatically drop all current connections to the database.
 * @param credentials Default to localhost:5432 `postgres` database and `postgres` user with empty password.
 * @throws `PgDbGodError` More details at `pgErrors`.
 *
 * @example drop({ database: 'bank-development' })
 */
export async function drop({ config, credentials }: { config: DropConfig; credentials?: Partial<DatabaseCredentials> }) {
  const client = new Client({ ...defaultCredentials, ...credentials })

  try {
    await client.connect()

    const db = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${config.database}');
    `)

    if (db.rowCount === 0 && config.notExistsError) {
      throw PgToolsError.dbDoesNotExist()
    }

    if (db.rowCount === 0 && !config.notExistsError) {
      return
    }
    if (config.dropConnections !== false) {
      await dropConnections(client, config.database)
    }

    await client.query(`DROP DATABASE "${config.database}";`)
  } catch (error) {
    if (error instanceof PgToolsError) {
      throw PgToolsError.fromPgToolsError(error)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error(`unknown error: ${JSON.stringify(error, null, 2)}`)
  } finally {
    await client.end()
  }
}

async function dropConnections(client: Client, dbName: string) {
  return client.query(`
		REVOKE CONNECT ON DATABASE '${dbName}' FROM PUBLIC;

    SELECT
      pg_terminate_backend(pg_stat_activity.pid)
    FROM
      pg_stat_activity
    WHERE
      pg_stat_activity.datname = '${dbName}'
      AND pid <> pg_backend_pid();
  `)
}

/**
 * Shallow merge objects without overriding fields with `undefined`.
 * TODO: return better types
 */
// export function merge(target: object, ...sources: object[]) {
// 	return Object.assign(
// 		{},
// 		target,
// 		...sources.map((x) =>
// 			Object.entries(x)
// 				.filter(([_, value]) => value !== undefined)
// 				.reduce(
// 					(obj, [key, value]) => ((obj[key] = value), obj),
// 					{} as Record<string, undefined>,
// 				),
// 		),
// 	);
// }

// export function merge(target: object, ...sources: object[]) {
//   const cleanedSources: Record<string, unknown>[] = [];

//   for (const source of sources) {
//     const cleaned: Record<string, unknown> = {};

//     for (const [key, value] of Object.entries(source)) {
//       if (value !== undefined) {
//         cleaned[key] = value;
//       }
//     }

//     cleanedSources.push(cleaned);
//   }

//   return Object.assign({}, target, ...cleanedSources);
// }
export function merge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = Object.assign({}, target)

  if (!source || typeof source !== "object") {
    throw new Error("Source must be a valid object")
  }

  const valid: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) {
      continue
    }

    Object.assign(valid, { [key]: value })
  }

  Object.assign(result, valid)

  return result as any
}

export function parsePostgresUrl(url: string) {
  const urlQuery = URL.parse(url)
  if (!urlQuery) {
    throw new Error("Url cant be pased")
  }

  const params = urlQuery.pathname.split("/")
  if (params.length > 2) {
    throw new Error("Invalid DB url string was provided")
  }

  return {
    scheme: urlQuery.protocol,
    user: urlQuery.username,
    password: urlQuery.password,
    host: urlQuery.hostname,
    port: urlQuery.port,
    database: params[0],
  }
}
