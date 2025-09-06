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
@alexvyber/pg-tools/0.0.0 darwin-arm64 node-v24.7.0
$ pg-tools --help [COMMAND]
USAGE
  $ pg-tools COMMAND
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pg-tools help [COMMAND]`](#pg-tools-help-command)
* [`pg-tools plugins`](#pg-tools-plugins)
* [`pg-tools plugins add PLUGIN`](#pg-tools-plugins-add-plugin)
* [`pg-tools plugins:inspect PLUGIN...`](#pg-tools-pluginsinspect-plugin)
* [`pg-tools plugins install PLUGIN`](#pg-tools-plugins-install-plugin)
* [`pg-tools plugins link PATH`](#pg-tools-plugins-link-path)
* [`pg-tools plugins remove [PLUGIN]`](#pg-tools-plugins-remove-plugin)
* [`pg-tools plugins reset`](#pg-tools-plugins-reset)
* [`pg-tools plugins uninstall [PLUGIN]`](#pg-tools-plugins-uninstall-plugin)
* [`pg-tools plugins unlink [PLUGIN]`](#pg-tools-plugins-unlink-plugin)
* [`pg-tools plugins update`](#pg-tools-plugins-update)

## `pg-tools help [COMMAND]`

Display help for pg-tools.

```
USAGE
  $ pg-tools help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for pg-tools.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `pg-tools plugins`

List installed plugins.

```
USAGE
  $ pg-tools plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ pg-tools plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/index.ts)_

## `pg-tools plugins add PLUGIN`

Installs a plugin into pg-tools.

```
USAGE
  $ pg-tools plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into pg-tools.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the PG_TOOLS_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the PG_TOOLS_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ pg-tools plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ pg-tools plugins add myplugin

  Install a plugin from a github url.

    $ pg-tools plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ pg-tools plugins add someuser/someplugin
```

## `pg-tools plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ pg-tools plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ pg-tools plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/inspect.ts)_

## `pg-tools plugins install PLUGIN`

Installs a plugin into pg-tools.

```
USAGE
  $ pg-tools plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into pg-tools.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the PG_TOOLS_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the PG_TOOLS_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ pg-tools plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ pg-tools plugins install myplugin

  Install a plugin from a github url.

    $ pg-tools plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ pg-tools plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/install.ts)_

## `pg-tools plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ pg-tools plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ pg-tools plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/link.ts)_

## `pg-tools plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ pg-tools plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ pg-tools plugins unlink
  $ pg-tools plugins remove

EXAMPLES
  $ pg-tools plugins remove myplugin
```

## `pg-tools plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ pg-tools plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/reset.ts)_

## `pg-tools plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ pg-tools plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ pg-tools plugins unlink
  $ pg-tools plugins remove

EXAMPLES
  $ pg-tools plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/uninstall.ts)_

## `pg-tools plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ pg-tools plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ pg-tools plugins unlink
  $ pg-tools plugins remove

EXAMPLES
  $ pg-tools plugins unlink myplugin
```

## `pg-tools plugins update`

Update installed plugins.

```
USAGE
  $ pg-tools plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/update.ts)_
<!-- commandsstop -->
