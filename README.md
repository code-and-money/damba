@alexvyber/pg-tools
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@alexvyber/pg-tools.svg)](https://npmjs.org/package/@alexvyber/pg-tools)
[![Downloads/week](https://img.shields.io/npm/dw/@alexvyber/pg-tools.svg)](https://npmjs.org/package/@alexvyber/pg-tools)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage
<!-- usage -->
```sh-session
$ npm install -g @alexvyber/pg-tools
$ pg-tools COMMAND
running command...
$ pg-tools (--version)
@alexvyber/pg-tools/0.0.0-dev.9 darwin-arm64 node-v24.7.0
$ pg-tools --help [COMMAND]
USAGE
  $ pg-tools COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pg-tools create`](#pg-tools-create)
* [`pg-tools drop`](#pg-tools-drop)

## `pg-tools create`

create an empty database

```
USAGE
  $ pg-tools create [-h] [-e] [-i <value>] [-n <value> | -l <value>] [-u <value> | ] [-p <value> | ] [-o
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
  $ pg-tools create --database=some-db

  $ DB_NAME=some-db pg-tools create

  $ pg-tools create --url postgresql://localhost:5432/some-db

  $ pg-tools create --database=some-db --existsError

  $ pg-tools create --database=some-db --password=123 --port=5433 --host=a.example.com --user=beer
```

_See code: [src/commands/create.ts](https://github.com/alexvyber/pg-tools/blob/v0.0.0-dev.9/src/commands/create.ts)_

## `pg-tools drop`

drop a database

```
USAGE
  $ pg-tools drop [-h] [-e] [-d] [-i <value>] [-n <value> | -l <value>] [-u <value> | ] [-p <value> | ]
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
  $ pg-tools drop --database=some-db

  $ DB_NAME=some-db pg-tools drop

  $ pg-tools drop --url postgresql://localhost:5432/some-db

  $ pg-tools drop --database=some-db --not-exists-error --no-dropConnections

  $ pg-tools drop --database=some-db --password=123 --port=5433 --host=a.example.com --user=beer
```

_See code: [src/commands/drop.ts](https://github.com/alexvyber/pg-tools/blob/v0.0.0-dev.9/src/commands/drop.ts)_
<!-- commandsstop -->
