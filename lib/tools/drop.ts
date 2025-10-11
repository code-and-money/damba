import { Command, Flags } from "@oclif/core";
import { drop, merge, parsePostgresUrl } from "./lib";
import assert from "node:assert";

export default class Drop extends Command {
  static override description = "drop a database";

  static override examples = [
    `$ damba drop --database=dbname`,
    `$ DB_NAME=dbname damba drop`,
    `$ damba drop --url postgresql://localhost:5432/dbname`,
    `$ damba drop --database=dbname --not-exists-error --no-dropConnections`,
    `$ damba drop --database=dbname --password=123 --port=5433 --host=a.example.com --user=beer`,
  ];

  static override flags = {
    help: Flags.help({ char: "h" }),
    notExistsError: Flags.boolean({
      char: "e",
      name: "not-exists-error",
      aliases: ["not-exists-error"],
      default: false,
      description: "[default: false] whether throw error if DB doesn't exist",
      env: "DB_ERROR_IF_NON_EXIST",
    }),
    dropConnections: Flags.boolean({
      char: "d",
      name: "drop-connections",
      default: true,
      allowNo: true,
      description: "[default: true] whether automatically drop DB connections",
      env: "DROP_CONNECTIONS",
    }),
    initialDatabase: Flags.string({
      char: "i",
      name: "init-db",
      default: "postgres",
      description: "Initial DB name",
      env: "DB_INITIAL",
    }),
    database: Flags.string({
      char: "n",
      description: "name of DB that will be dropped",
      env: "DB_NAME",
      exclusive: ["url"],
    }),
    user: Flags.string({
      char: "u",
      default: "postgres",
      description: "DB user name",
      env: "DB_USERNAME",
      exclusive: ["url"],
    }),
    port: Flags.integer({
      char: "p",
      default: 5432,
      description: "DB port, default `5432`",
      env: "DB_PORT",
      exclusive: ["url"],
    }),
    host: Flags.string({
      char: "o",
      default: "localhost",
      description: "DB host",
      env: "DB_HOST",
      exclusive: ["url"],
    }),
    password: Flags.string({
      char: "w",
      default: "",
      description: "[default: empty] DB password",
      env: "DB_PASSWORD",
      exclusive: ["url"],
    }),
    url: Flags.string({
      char: "l",
      description: "URL of DB that will be dropped, e.g. postgres://user:password@localhost:5432/my_db",
      env: "DB_URL",
      exclusive: ["database", "user", "port", "host", "password"],
    }),
  };

  public async run(): Promise<void> {
    const {
      flags: { notExistsError, dropConnections, initialDatabase, url, ...rest },
    } = await this.parse(Drop);

    const params = url ? parsePostgresUrl(url) : {};

    const { database, user, port, host, password } = merge(rest, params);

    console.info(`Drop database '${database}'`);

    assert(database, 'Missing required flags/ENV - database("DB_NAME") or url("DB_URL")');

    await drop({ config: { database, notExistsError, dropConnections }, credentials: { user: user, database: initialDatabase, port, host, password } });

    console.info(`Database '${database}' dropped`);
  }
}
