# @codeandmoney/damba

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)

<!-- tocstop -->

# Usage

<!-- usage -->

```sh
deno add jsr:@codeandmoney/damba

damba COMMAND
# running command...

damba (--version)

damba --help [COMMAND]
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`damba create`](#damba-create)
- [`damba drop`](#damba-drop)

## `damba create`

Create an empty database

### USAGE

```sh
damba create [-h] [-e] [-i <value>] [-n <value> | -l <value>] [-u <value> | ]
             [-p <value> | ] [-o <value> | ] [-w <value> | ]
```

```sh
### FLAGS
  -e, --existsError              [default: false] whether throw error if DB already exists
  -h, --help                     Show CLI help.
  -i, --initialDatabase=<value>  [default: postgres] Initial DB name
  -l, --url=<value>              DB URL, e.g. postgres://user:password@localhost:5432/my_db
  -n, --database=<value>         new DB name
  -o, --host=<value>             [default: localhost] new DB host
  -p, --port=<value>             [default: 5432] DB port, default `5432`
  -u, --user=<value>             [default: postgres] DB user name
  -w, --password=<value>         [default: empty] DB password
```

### Examples

```sh
damba create --database=dbname
```

```sh
DB_NAME=dbname damba create
```

```sh
damba create --url postgresql://localhost:5432/dbname
```

```sh
damba create --database=dbname --existsError
```

```sh
damba create --database=dbname --password=123 --port=5433 --host=a.example.com --user=beer
```

## `damba drop`

Drop a database

### USAGE

```sh
damba drop [-h] [-e] [-d] [-i <value>] [-n <value> | -l <value>] [-u <value> | ] 
           [-p <value> | ] [-o <value> | ] [-w <value> | ]
```

```sh
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
```

### EXAMPLES

```sh
damba drop --database=dbname
```

```sh
DB_NAME=dbname damba drop
```

```sh
damba drop --url postgresql://localhost:5432/dbname
```

```sh
damba drop --database=dbname --not-exists-error --no-dropConnections
```

```sh
damba drop --database=dbname --password=123 --port=5433 --host=a.example.com --user=beer
```

<!-- commandsstop -->
