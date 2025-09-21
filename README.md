# @codeandmoney/damba

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)

<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @codeandmoney/damba
$ damba COMMAND
running command...
$ damba (--version)
@codeandmoney/damba/0.0.0-dev.11 darwin-arm64 node-v24.7.0
$ damba --help [COMMAND]
USAGE
  $ damba COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`damba create`](#damba-create)
- [`damba drop`](#damba-drop)

## `damba create`

create an empty database

```
USAGE
  $ damba create [-h] [-e] [-i <value>] [-n <value> | -l <value>] [-u <value> | ] [-p <value> | ] [-o
    <value> | ] [-w <value> | ]

FLAGS
  -e, --existsError              [default: false] whether throw error if DB already exists
  -h, --help                     Show CLI help.
  -i, --initialDatabase=<value>  [default: postgres] Initial DB name
  -l, --url=<value>              DB URL, e.g. postgres://user:password@localhost:5432/my_db
  -n, --database=<value>         new DB name
  -o, --host=<value>             [default: localhost] new DB host
  -p, --port=<value>             [default: 5432] DB port, default `5432`
  -u, --user=<value>             [default: postgres] DB user name
  -w, --password=<value>         [default: empty] DB password

DESCRIPTION
  create an empty database

EXAMPLES
  $ damba create --database=some-db

  $ DB_NAME=some-db damba create

  $ damba create --url postgresql://localhost:5432/some-db

  $ damba create --database=some-db --existsError

  $ damba create --database=some-db --password=123 --port=5433 --host=a.example.com --user=beer
```

## `damba drop`

drop a database

```
USAGE
  $ damba drop [-h] [-e] [-d] [-i <value>] [-n <value> | -l <value>] [-u <value> | ] [-p <value> | ]
    [-o <value> | ] [-w <value> | ]

FLAGS
  -d, --[no-]dropConnections     [default: true] whether automatically drop DB connections
  -e, --notExistsError           [default: false] whether throw error if DB doesn't exist
  -h, --help                     Show CLI help.
  -i, --initialDatabase=<value>  [default: postgres] Initial DB name
  -l, --url=<value>              URL of DB that will be dropped, e.g. postgres://user:password@localhost:5432/my_db
  -n, --database=<value>         name of DB that will be dropped
  -o, --host=<value>             [default: localhost] DB host
  -p, --port=<value>             [default: 5432] DB port, default `5432`
  -u, --user=<value>             [default: postgres] DB user name
  -w, --password=<value>         [default: empty] DB password

DESCRIPTION
  drop a database

EXAMPLES
  $ damba drop --database=some-db

  $ DB_NAME=some-db damba drop

  $ damba drop --url postgresql://localhost:5432/some-db

  $ damba drop --database=some-db --not-exists-error --no-dropConnections

  $ damba drop --database=some-db --password=123 --port=5433 --host=a.example.com --user=beer
```

<!-- commandsstop -->
