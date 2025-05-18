# tscribe

[![npm](https://img.shields.io/npm/v/tscribe?style=flat-square)](https://www.npmjs.com/package/tscribe)
[![CI](https://github.com/champ8644/tscribe/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/champ8644/tscribe/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/champ8644/tscribe/branch/master/graph/badge.svg)](https://codecov.io/gh/champ8644/tscribe)
[![License](https://img.shields.io/github/license/champ8644/tscribe?style=flat-square)](https://github.com/champ8644/tscribe/blob/master/LICENSE)

> Concatenate TypeScript‑family files into a LLM‑ready dump or a zip archive.

---

## Quick Start

### Out of the box

```bash
npx tscribe > out.txt
```

This scans the current directory (`.`), collects `*.ts` and `*.tsx`, prepends Markdown headings, and writes to **stdout**.

### Common variants

```bash
npx tscribe --src src           # choose a folder explicitly
npx tscribe --out dump.txt      # write straight to a file
npx tscribe --zip dump.zip      # zip with output.txt inside
```

---

## Examples

| Goal                           | Command                              |
| ------------------------------ | ------------------------------------ |
| Dump all source under `src/`   | `tscribe --src src`                  |
| Plain‑text headings            | `tscribe --format plain`             |
| Alphabetical sort, ignore dist | `tscribe --sort alpha --ignore dist` |
| List matched files only        | `tscribe --list`                     |
| Watch and rebuild              | `tscribe --watch`                    |

---

## Features

- Concatenate `.ts`, `.tsx`, or any extension list
- Markdown or plain‑text headings (`--format`)
- Sort by `alpha`, `path`, or `mtime`
- Ignore patterns with safe defaults (`node_modules`,`dist`,`.git`)
- Output to **stdout**, **file** (`--out`) or **zip** (`--zip`)
- Watch mode with live rebuilds
- Quiet / verbose logging flags

---

## Installation

```bash
npm add -D tscribe   # or npm install --save-dev tscribe
```

You can always use `npx tscribe …` without installing globally.

---

## CLI Usage

```bash
tscribe [options]
```

| Flag                          | Description                             | Default                  |
| ----------------------------- | --------------------------------------- | ------------------------ |
| `-s, --src <dir>`             | Root folder to scan                     | `.`                      |
| `-e, --ext <list>`            | Comma‑separated extensions              | `ts,tsx`                 |
| `--ignore <patterns>`         | Glob ignore patterns                    | `node_modules,dist,.git` |
| `--heading <template>`        | Heading template (`{file}` placeholder) | auto                     |
| `--format <md\|plain>`        | Heading style                           | `md`                     |
| `--sort <alpha\|path\|mtime>` | Sort mode                               | `path`                   |
| `--zip <file>`                | Zip archive path                        | –                        |
| `-o, --out <file>`            | Write plain‑text output file            | –                        |
| `--list`                      | Print file list only                    | –                        |
| `--watch`                     | Watch for changes                       | –                        |
| `--verbose`                   | Debug output                            | –                        |
| `--quiet`                     | Suppress logs                           | –                        |

## Heading Templates

When you run tscribe, it prints each file’s contents prefixed by a heading showing the file’s relative path. This helps distinguish which content comes from which file.

Below is a simulated output when tscribe processes two files:

```md
### src/utils/math.ts

import fs from 'fs'
import path from 'path'

export function add(a: number, b: number): number {
return a + b
}

### components/Button.tsx

import React from 'react'

export const Button = () => <button>Click me</button>
```

### Built‑in Formats

#### 1. Markdown (default)

Prefix each path with `### `:

```bash
tscribe --format md
```

```md
### src/utils/math.ts

### components/Button.tsx
```

#### 2. Plain Text

Wrap the path in a code comment with `--`:

```bash
tscribe --format plain
```

```ts
// --- src/utils/math.ts ---
// --- components/Button.tsx ---
```

### Custom Heading Templates

Use `--heading` to supply any template, inserting `{file}` where the path should go. This overrides `--format`.

```bash
tscribe --heading "/* === {file} === */"
```

```ts
/* === src/utils/math.ts === */
/* === components/Button.tsx === */
```

You can include emojis, metadata, or block comments:

```bash
tscribe --heading "// 🚀 File: {file} 🚀"
```

```ts
// 🚀 File: src/utils/math.ts 🚀
// 🚀 File: components/Button.tsx 🚀
```

---

## Config file

`tscribe.(c)js` or `.json` files are merged with CLI flags (CLI wins).

```js
// tscribe.config.js
export default {
  src: "packages",
  ext: "ts,tsx",
  format: "md",
  sort: "alpha",
  ignore: "node_modules,dist,coverage",
};
```

---

## Library API

Use the same power as the CLI from code. Call **`tscribe(opts)`** and await the Promise.

### Full example

```ts
import { tscribe } from "tscribe";

await tscribe({
  src: "src", // folder to scan
  ext: "ts,tsx", // file extensions
  ignore: "dist,.git", // optional ignore patterns
  format: "md", // "md" or "plain"
  sort: "alpha", // "alpha", "path", or "mtime"
  out: "dump.txt", // write to this file (else stdout)
  // zip: "code.zip",      // optional alternative output
  verbose: true, // show debug logs
});
```

You may omit most fields. If neither `out` nor `zip` is provided, output is sent to stdout.

---

### Options reference

| Property  | Type                           | Default                    | Description                                                                          |
| --------- | ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------ |
| `src`     | `string`                       | `"."`                      | Root directory to scan. Relative or absolute.                                        |
| `ext`     | `string`                       | `"ts,tsx"`                 | Comma‑separated extension list.                                                      |
| `ignore`  | `string`                       | `"node_modules,dist,.git"` | Glob patterns to exclude (comma‑sep).                                                |
| `heading` | `string`                       | _(auto)_                   | Custom heading template; `{file}` replaced by relative path.                         |
| `format`  | `'md' \| 'plain'`              | `'md'`                     | Heading style.                                                                       |
| `sort`    | `'alpha' \| 'path' \| 'mtime'` | `'path'`                   | File ordering.                                                                       |
| `zip`     | `string`                       | –                          | Path to write a zip archive (`output.txt` inside). Mutually exclusive with `out`.    |
| `out`     | `string`                       | –                          | Plain‑text output file. If neither `out` nor `zip`, output is written to **stdout**. |
| `list`    | `boolean`                      | `false`                    | Print file list only (no concatenation).                                             |
| `watch`   | `boolean`                      | `false`                    | Watch mode—re‑run on changes.                                                        |
| `quiet`   | `boolean`                      | `false`                    | Suppress normal logs.                                                                |
| `verbose` | `boolean`                      | `false`                    | Extra debug logs.                                                                    |

### Return value

`tscribe()` returns **`Promise<void>`**. It either completes the side‑effect (write, zip, stdout) or throws an error you can catch.

## Helper Utilities

These low-level functions are exported for programmatic or test-specific use.

### `applySort`

```ts
applySort(files: string[], mode: "alpha" | "path" | "mtime"): Promise<string[]>
```

Sorts file paths based on the selected strategy:

- `alpha`: alphabetical (locale-aware)
- `path`: original input order
- `mtime`: by file modification time (ascending)

### `findFilesDirectly`

```ts
findFilesDirectly(dir: string, extList: string[]): Promise<string[]>
```

Scans a directory using synchronous filesystem APIs. Does not recurse or match globs—useful in test environments or for deterministic input discovery.

---

## License

MIT © Soluble Labs Co., Ltd.
