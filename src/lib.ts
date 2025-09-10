import { Client } from "pg";

const errorProtocol: Record<
	string,
	{ name: string; code: string; message: string }
> = {
	"42P04": {
		name: "PDG_ERR::DuplicateDatabase",
		code: "42P04",
		message: "Database already exist.",
	},
	"3D000": {
		name: "PDG_ERR::InvalidCatalogName",
		code: "3D000",
		message: "Database does not exist.",
	},
	"23505": {
		name: "PDG_ERR::UniqueViolation",
		code: "23505",
		message: "Attempt to create multiple databases concurrently.",
	},
	"55006": {
		name: "PDG_ERR::DropDatabaseInUse",
		code: "55006",
		message: "Cannot delete a database that is being accessed by other users.",
	},
};

export class PgError implements Error {
	constructor(
		readonly name: string,
		readonly message: string,
		readonly code: string,
		readonly stack?: string,
	) {}

	public static fromPgError(pgError: Error & { code?: string }): PgError {
		return new PgError(
			pgError.code
				? errorProtocol[pgError.code].name
				: "PDG_ERR::UnexpectedError",
			pgError.code ? errorProtocol[pgError.code]?.message : pgError.message,
			pgError.code || "unknown",
			pgError.stack,
		);
	}

	public static dbAlreadyExist(): PgError {
		const code = "42P04";
		return new PgError(
			errorProtocol[code].name,
			errorProtocol[code].message,
			code,
			Error().stack,
		);
	}

	public static dbDoesNotExist(): PgError {
		const code = "3D000";
		return new PgError(
			errorProtocol[code].name,
			errorProtocol[code].message,
			code,
			Error().stack,
		);
	}
}

export type DbCredential = {
	user: string;
	database: string;
	port: number;
	host: string;
	password: string;
};

const defaultDbCred: DbCredential = {
	user: "postgres",
	database: "postgres",
	password: "",
	port: 5432,
	host: "localhost",
};

export type NewDbConfig = {
	database: string;
	existsError?: boolean;
};

/**
 * @param newDbConfig Requires a `database` you are trying to create. `existsError` is default to false. When `existsError` is `true`,
 * it will throw error when database already exist before executing creation.
 * @param dbCredential Default to localhost:5432 `postgres` database and `postgres` user with empty password.
 * @throws `PgDbGodError` More details at `errorProtocol`.
 *
 * @example createDb({ database: 'bank-development' })
 */
export async function createDb(
	newDbConfig: NewDbConfig,
	dbCredential: Partial<DbCredential> = defaultDbCred,
) {
	const client = new Client({ ...defaultDbCred, ...dbCredential });
	try {
		await client.connect();
		const existingDb = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${newDbConfig.database}');
    `);

		if (!existingDb?.rowCount) {
			throw new Error("Error getting query result");
		}

		if (existingDb?.rowCount > 0 && newDbConfig.existsError)
			throw PgError.dbAlreadyExist();
		if (existingDb?.rowCount > 0 && !newDbConfig.existsError) return;

		await client.query(`CREATE DATABASE "${newDbConfig.database}";`);
	} catch (error) {
		if (error instanceof PgError) {
			throw PgError.fromPgError(error);
		}

		if (error instanceof Error) {
			throw error;
		}

		throw new Error(`unknown error: ${error}`);
	} finally {
		await client.end();
	}
}

export type DropDbConfig = {
	database: string;
	notExistsError?: boolean;
	dropConnections?: boolean;
};
/**
 * @param dropDbConfig.database Requires a `database` you are trying to drop.
 * @param dropDbConfig.notExistsError is default to false. When `notExistsError` is `true`, it will throw error when database doesn't exist before executing drop.
 * @param dropDbConfig.dropConnections is default to true. When `dropConnections` is `true`, it will automatically drop all current connections to the database.
 * @param dbCredential Default to localhost:5432 `postgres` database and `postgres` user with empty password.
 * @throws `PgDbGodError` More details at `errorProtocol`.
 *
 * @example dropDb({ database: 'bank-development' })
 */
export async function dropDb(
	dropDbConfig: DropDbConfig,
	dbCredential: Partial<DbCredential> = defaultDbCred,
) {
	const client = new Client({ ...defaultDbCred, ...dbCredential });
	try {
		await client.connect();
		const existingDb = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${dropDbConfig.database}');
    `);

		if (existingDb.rowCount === 0 && dropDbConfig.notExistsError)
			throw PgError.dbDoesNotExist();
		if (existingDb.rowCount === 0 && !dropDbConfig.notExistsError) return;

		if (dropDbConfig.dropConnections !== false)
			await dropDbOtherUserConnections(client, dropDbConfig.database);

		await client.query(`DROP DATABASE "${dropDbConfig.database}";`);
	} catch (error) {
		if (error instanceof PgError) {
			throw PgError.fromPgError(error);
		}

		if (error instanceof Error) {
			throw error;
		}

		throw new Error(`unknown error: ${error}`);
	} finally {
		await client.end();
	}
}

async function dropDbOtherUserConnections(client: Client, dbName: string) {
	return client.query(`
    SELECT
      pg_terminate_backend(pg_stat_activity.pid)
    FROM
      pg_stat_activity
    WHERE
      pg_stat_activity.datname = '${dbName}'
      AND pid <> pg_backend_pid();
  `);
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
export function merge(target: object, ...sources: object[]): object {
	const result = Object.assign({}, target);

	for (const source of sources) {
		if (!source || typeof source !== "object") {
			continue;
		}

		const valid: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(source)) {
			if (value === undefined) {
				continue;
			}

			Object.assign(valid, { [key]: value });
		}

		Object.assign(result, valid);
	}

	return result;
}

export function parsePostgresUrl(dbUrl: string) {
	const urlQuery = URL.parse(dbUrl);
	if (!urlQuery) {
		throw new Error("Url cant be pased");
	}

	const params = urlQuery.pathname.split("/");
	if (params.length > 2) {
		throw new Error("Invalid DB url string was provided");
	}

	return {
		scheme: urlQuery.protocol,
		username: urlQuery.username,
		password: urlQuery.password,
		host: urlQuery.hostname,
		port: urlQuery.port,
		database: params[0],
	};
}
