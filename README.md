# `jrnl`

A simple CLI for managing the markdown files that make up my personal journal

## Setup instructions

```text
$ git clone https://github.com/matt-hoiland/jrnl.git
$ cd jrnl
$ npm link
$ jrnl --version
```

## Documentation

- [Entry Format](docs/Entries.md)

## Features

### General `--help` option

```text
jrnl [command]

Commands:
  jrnl create <title> [-p]  Create a new journal entry

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]

```

### The `create` command

```text
jrnl create <title> [-p]

Create a new journal entry

Positionals:
  title  Title of the entry to be made                       [string] [required]

Options:
  --version   Show version number                                      [boolean]
  --help      Show help                                                [boolean]
  -p, --path  The directory path to the entry location   [string] [default: "."]
```
