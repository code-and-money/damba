import { Command, Flags } from "@oclif/core"
import { create, merge, parsePostgresUrl } from "../lib.ts"

export default class Create extends Command {
  static override description = "create an empty database"
  static override examples = [
    `$ pg-tools create --database=some-db`,
    `$ DB_NAME=some-db pg-tools create`,
    `$ pg-tools create --url postgresql://localhost:5432/some-db`,
    `$ pg-tools create --database=some-db --existsError`,
    `$ pg-tools create --database=some-db --password=123 --port=5433 --host=a.example.com --user=beer`,
  ]

  static override flags = {
    help: Flags.help( { char: "h" } ),
    existsError: Flags.boolean( {
      char: "e",
      default: false,
      description: "[default: false] whether throw error if DB already exists",
      env: "DB_ERROR_IF_EXIST",
    } ),
    initialDatabase: Flags.string( {
      char: "i",
      default: "postgres",
      description: "Initial DB name",
      env: "DB_INITIAL",
    } ),
    database: Flags.string( {
      char: "n",
      description: "new DB name",
      env: "DB_NAME",
      exclusive: [ "url" ],
    } ),
    user: Flags.string( {
      char: "u",
      default: "postgres",
      description: "DB user name",
      env: "DB_USERNAME",
      exclusive: [ "url" ],
    } ),
    port: Flags.integer( {
      char: "p",
      default: 5432,
      description: "DB port, default `5432`",
      env: "DB_PORT",
      exclusive: [ "url" ],
    } ),
    host: Flags.string( {
      char: "o",
      default: "localhost",
      description: "new DB host",
      env: "DB_HOST",
      exclusive: [ "url" ],
    } ),
    password: Flags.string( {
      char: "w",
      default: "",
      description: "[default: empty] DB password",
      env: "DB_PASSWORD",
      exclusive: [ "url" ],
    } ),
    url: Flags.string( {
      char: "l",
      description: "DB URL, e.g. postgres://user:password@localhost:5432/my_db",
      env: "DB_URL",
      exclusive: [ "database", "user", "port", "host", "password" ],
    } ),
  }

  public async run() {
    const {
      flags: { existsError, initialDatabase, url, ...flags },
    } = await this.parse( Create )

    const params = url ? parsePostgresUrl( url ) : {}

    const { database, user, port, host, password } = merge( flags, params )

    console.info( `Create database '${database}'` )

    if ( !database ) {
      throw new Error(
        'Missing required flags/ENV - database("DB_NAME") or url("DB_URL")',
      )
    }

    await create( {
      config: { database, existsError },
      credentials: { user, database: initialDatabase, port, host, password },
    } )

    console.info( `Database '${database}' created` )
  }
}
