export interface DatabaseCredentials {
  user: string
  database: string
  port: number
  host: string
  password: string
}

export interface DropConfig {
  database: string
  notExistsError?: boolean
  dropConnections?: boolean
}

export interface CraeteConfig {
  database: string
  existsError?: boolean
}
