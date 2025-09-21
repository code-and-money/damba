import { Client } from "pg"
import type { CreateConfig, DatabaseCredentials, DropConfig } from "./types.ts"

const dambaErrors: Record<string, { name: string; code: string; message: string }> = {
  // deno-fmt-ignore
  "42P04": { name: "PDG_ERR::DuplicateDatabase", code: "42P04", message: "Database already exist." },
  // deno-fmt-ignore
  "3D000": { name: "PDG_ERR::InvalidCatalogName", code: "3D000", message: "Database does not exist." },
  // deno-fmt-ignore
  "23505": { name: "PDG_ERR::UniqueViolation", code: "23505", message: "Attempt to create multiple databases concurrently." },
  // deno-fmt-ignore
  "55006": { name: "PDG_ERR::DropDatabaseInUse", code: "55006", message: "Cannot delete a database that is being accessed by other users." },
}

export class DambaError extends Error {
  constructor(
    readonly code: string,
    override readonly name: string,
    override readonly message: string,
    override readonly stack?: string,
  ) {
    super()
  }

  public static fromDambaError( dambaError: Error & { code?: string } ): DambaError {
    return new DambaError(
      dambaError.code ? dambaErrors[dambaError.code]?.name : "PDG_ERR::UnexpectedError",
      dambaError.code ? dambaErrors[dambaError.code]?.message : dambaError.message,
      dambaError.code || "unknown",
      dambaError.stack,
    )
  }

  public static dbExists(): DambaError {
    const code = "42P04"
    return new DambaError(
      dambaErrors[code]?.name,
      dambaErrors[code]?.message,
      code,
      Error().stack,
    )
  }

  public static dbDoesNotExist(): DambaError {
    const code = "3D000"
    return new DambaError(
      dambaErrors[code]?.name,
      dambaErrors[code]?.message,
      code,
      Error().stack,
    )
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
 * Creates a new PostgreSQL database using the given configuration and credentials.
 *
 * - Connects to the PostgreSQL server.
 * - Checks if the database already exists.
 * - Depending on {@link CreateConfig.existsError}, either throws an error, returns silently, or creates the database.
 * - Always closes the client connection at the end.
 *
 * @param params - The parameters object.
 * @param params.config - The configuration for database creation. {@link CreateConfig }
 * @param params.credentials - Optional connection credentials that override {@link defaultCredentials}.
 *
 * @throws {DambaError} If the database already exists and `config.existsError` is `true`.
 * @throws {Error} If the query result is invalid, or another unknown error occurs.
 *
 * @example
 * ```ts
 * await create({
 *   config: { database: "mydb", existsError: true },
 *   credentials: { user: "postgres", password: "secret" }
 * });
 * ```
 */
export async function create(
  { config, credentials }: { config: CreateConfig; credentials?: Partial<DatabaseCredentials> },
) {
  const client = new Client( { ...defaultCredentials, ...credentials } )

  try {
    await client.connect()

    const result = await client.query( `
      select
        datname
      from
        pg_catalog.pg_database
      where
        lower(datname) = lower('${config.database}');
    ` )

    const tableExists = Boolean( result?.rowCount )

    if ( tableExists && config.existsError ) {
      throw DambaError.dbExists()
    }

    if ( tableExists && !config.existsError ) {
      return
    }

    await client.query( `create database "${config.database}";` )
  } catch ( error ) {
    if ( error instanceof DambaError ) {
      throw DambaError.fromDambaError( error )
    }

    if ( error instanceof Error ) {
      throw error
    }

    throw new Error( `unknown error: ${JSON.stringify( error, null, 2 )}` )
  } finally {
    await client.end()
  }
}

/**
 * Drops a PostgreSQL database according to the provided configuration.
 *
 * - Connects to the PostgreSQL server using the given credentials (or defaults).
 * - Checks whether the target database exists.
 *   - If it does not exist:
 *     - Throws a {@link DambaError.dbDoesNotExist} if `config.notExistsError` is `true`.
 *     - Returns silently if `config.notExistsError` is `false` or unset.
 * - If the database exists and `config.dropConnections` is not `false`,
 *   calls {@link dropConnections} to forcibly disconnect all clients.
 * - Executes a `DROP DATABASE` statement to remove the database.
 * - Always closes the client connection in the `finally` block.
 *
 * @note ⚠️ Notes:
 * - You cannot drop the database you are currently connected to.
 *   Connect to another database (e.g. `postgres`) first.
 * - If `dropConnections` is `false` and the database has active connections,
 *   the drop will fail.
 *
 * @param params - The parameters object.
 * @param params.config - The drop configuration (see {@link DropConfig}).
 * @param params.credentials - Optional connection credentials that override {@link defaultCredentials}.
 *
 * @throws {DambaError} If the database does not exist (and `notExistsError` is `true`).
 * @throws {DambaError} If wrapped from another `DambaError`.
 * @throws {Error} For query errors, invalid results, or unexpected issues.
 *
 * @example
 * ```ts
 * await drop({
 *   config: { database: "mydb", notExistsError: true, dropConnections: true },
 *   credentials: { user: "postgres", password: "secret" }
 * });
 * ```
 */
export async function drop(
  { config, credentials }: { config: DropConfig; credentials?: Partial<DatabaseCredentials> },
) {
  const client = new Client( { ...defaultCredentials, ...credentials } )

  try {
    await client.connect()

    const result = await client.query( `
      select
        datname
      from
        pg_catalog.pg_database
      where
        lower(datname) = lower('${config.database}');
    ` )

    const tableDoesntExists = result.rowCount === 0

    if ( tableDoesntExists && config.notExistsError ) {
      throw DambaError.dbExists()
    }

    if ( tableDoesntExists && !config.notExistsError ) {
      return
    }

    if ( config.dropConnections === true ) {
      await dropConnections( client, config.database )
    }

    await client.query( `drop database "${config.database}";` )
  } catch ( error ) {
    if ( error instanceof DambaError ) {
      throw DambaError.fromDambaError( error )
    }

    if ( error instanceof Error ) {
      throw error
    }

    throw new Error( `unknown error: ${JSON.stringify( error, null, 2 )}` )
  } finally {
    await client.end()
  }
}

/**
 * Drops all active connections to the specified PostgreSQL database.
 *
 * - Revokes new connections from `PUBLIC` on the given database.
 * - Terminates all currently active sessions connected to that database,
 *   except for the current session.
 *
 * @note ⚠️ You must call this from another database (e.g., `postgres`), because you
 * cannot terminate your own active connection to the target database.
 *
 * @param client - An active PostgreSQL {@link Client} connected to the server.
 * @param {string} database - The name of the database whose connections should be dropped.
 *
 * @returns A promise resolving to the result of the `client.query` execution.
 *
 * @example
 * ```ts
 * const client = new Client({ user: "postgres", password: "secret" });
 * await client.connect();
 *
 * await dropConnections(client, "mydb");
 *
 * await client.end();
 * ```
 */
function dropConnections( client: Client, database: string, schema = "public" ) {
  return client.query( `
    revoke connect on database "${database}" from "${schema}";

    select
      pg_terminate_backend(pg_stat_activity.pid)
    from
      pg_stat_activity
    where
      pg_stat_activity.datname = '${database}'
      and pid <> pg_backend_pid();
  ` )
}

export function merge<T extends object, U extends object>( target: T, source: U ): T & U {
  const result = Object.assign( {}, target )

  if ( !source || typeof source !== "object" ) {
    throw new Error( "Source must be a valid object" )
  }

  const valid: Record<string, unknown> = {}

  for ( const [ key, value ] of Object.entries( source ) ) {
    if ( value === undefined ) {
      continue
    }

    Object.assign( valid, { [key]: value } )
  }

  Object.assign( result, valid )

  // deno-lint-ignore no-explicit-any
  return result as any
}

type ParsedPostgresConfig = {
  scheme: string
  user: string
  password: string
  host: string
  port: string
  database: string
}

export function parsePostgresUrl( str: string ): ParsedPostgresConfig {
  const url = URL.parse( str )
  if ( !url ) {
    throw new Error( "Url can not be parsed" )
  }

  const params = url.pathname.split( "/" )
  if ( params.length > 2 ) {
    throw new Error( "Invalid database url string was provided" )
  }

  return {
    scheme: url.protocol,
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: url.port,
    database: params[0],
  }
}
