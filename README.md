# sscg

The **S**uper **S**imple **C**ode **G**enerator.

> *This package prioritizes stability with minimal version updates. Dependencies are regularly updated and bugs are fixed, but new features are not added and existing ones are not changed. This approach results in fewer version bumps, keeping the package simple and its behavior consistent.*

## Installation

```
$ npm install --save-dev sscg
```

## Getting started

### 1. Create base directory

Default base directory is `./templates`.

```
$ mkdir templates
```

### 2. Create your first template

Now, let's create a template.

```
$ mkdir templates/sample
```

**The name of directory under the `templates` directory (here is `sample`) is treated as template name.**

You can create multiple `tpl` files in the `template` directory.

```
$ touch templates/sample/{{kebabCase[singular[t]]}}.ts.tpl
$ mkdir templates/sample/some-dir
$ touch templates/sample/some-dir/{{kebabCase[plural[t]]}}.ts.tpl
```

**`sscg` can embed string into the file name by evaluating codes in `{{}}`, and you can use `[]` instead of `()` for calling function in file names.**

Then, let's edit your `tpl` files.

templates/sample/{{kebabCase[singular[t]]}}.ts.tpl:

```ts
export type {{pascalCase(singular(t))}} = {};
```

templates/sample/some-dir/{{kebabCase[plural[t]]}}.ts.tpl:

```ts
import type { {{pascalCase(singular(t))}} } from "../{{kebabCase(singular(t))}}";

export type {{pascalCase(plural(t))}} = Array<{{pascalCase(singular(t))}}>;
```

**`sscg` can embed string into `tpl` files by evaluating codes in `{{}}`.**

### 3. Generate codes from the your template

You can generate code with the following command.

```
$ sscg sample -r sample_record -o outputs
Generate from 'templates/sample'...

outputs/sample-record.ts
outputs/some-dir/sample-records.ts

Done in 11ms
```

**The `-r` option is `replacement`, and it becomes `t` in `{{}}`.**

outputs/sample-record.ts:

```ts
export type SampleRecord = {};
```

outputs/some-dir/sample-records.ts:

```ts
import type { SampleRecord } from "../sample-record";

export type SampleRecords = Array<SampleRecord>;
```

## Supported variables

|                | kind     | desc                                    |
|----------------|----------|-----------------------------------------|
| `t`            | value    | A string from the `-r` option           |
| `plural`       | function | Pluralize a string                      |
| `singular`     | function | Singularize a string                    |
| `camelCase`    | function | Transform a string like `sampleRecord`  |
| `constantCase` | function | Transform a string like `SAMPLE_RECORD` |
| `kebabCase`    | function | Transform a string like `sample-record` |
| `pascalCase`   | function | Transform a string like `SampleRecord`  |
| `snakeCase`    | function | Transform a string like `sample_record` |

## Usage

```
The super simple code generator

Usage:
  $ sscg <name> [options]

Options:
  -r, --replacement <text>  The string that replaces tokens in templates
  -o, --out <dir>           The output directory where generated codes are located
  -d, --dir <dir>           The directory where templates are located (default: ./templates)

Example:
  $ sscg model -r user -o ./models
```
