export interface DatabaseCredentials {
  /**
   * @property  {string} user - database user
   * @default "postgres"
   */
  user: string

  /**
   * @property {string} database - database name
   * @default "postgres"
   */
  database: string

  /**
   * @property {number} port - database port
   * @default 5432
   */
  port: number

  /**
   * @property {string} host - database host
   * @default "localhost"
   */
  host: string

  /**
   * @property {string} password - database port
   * @default "postgres"
   */
  password: string
}

export interface DropConfig {
  /**
   * @property {string} database - database name
   * @default "postgres"
   */
  database: string

  /**
   * @property {boolean} notExistsError - Should error when database does not exist
   * @default false
   */
  notExistsError?: boolean

  /**
   * @property {boolean} dropConnections - Should drop all the other active connections
   * @default false
   */
  dropConnections?: boolean
}

export interface CreateConfig {
  /**
   * @property {string} database - database name
   * @default "postgres"
   */
  database: string

  /**
   * @property {boolean} existsError - Should error when database already exists
   * @default false
   */
  existsError?: boolean
}
