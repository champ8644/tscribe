# tscribe

[![npm](https://img.shields.io/npm/v/tscribe?style=flat-square)](https://www.npmjs.com/package/tscribe)
[![CI](https://github.com/champ8644/tscribe/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/champ8644/tscribe/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/champ8644/tscribe/branch/master/graph/badge.svg)](https://codecov.io/gh/champ8644/tscribe)
[![License](https://img.shields.io/github/license/champ8644/tscribe)](https://github.com/champ8644/tscribe/blob/master/LICENSE)

> Concatenate TypeScript‑family files into a LLM‑ready dump.

---

## What is tscribe for?

`tscribe` is a developer CLI tool that extracts `.ts` and `.tsx` source files from your project, transforms them into a readable Markdown structure, and outputs the result as either a plain text file or a zipped archive.  
It is especially useful for:

- Static code analysis or documentation generation
- Developer tooling and AI workflow integration

Supports mono-repos, source indexing, and zip bundling for efficient context window management in LLMs.

---

## Quick Start

### Basic usage

```bash
npx tscribe > out.txt
```

By default, this command recursively scans the current working directory (`.`), collects `*.ts` and `*.tsx` files, prepends Markdown-style section headers, and writes the result to **stdout**.

You can redirect this output to a file (e.g., `out.txt`) as shown above.

### Optional flags

```bash
npx tscribe --src src           # choose a folder explicitly
npx tscribe --out dump.txt      # write straight to a file
```

These flags allow explicit control over the input source and output format, whether writing to a file or creating a bundled archive.

---

## Examples

| Goal                           | Command                              |
| ------------------------------ | ------------------------------------ |
| Dump all source under `src/`   | `tscribe --src src`                  |
| Use custom file extensions     | `tscribe --ext ts,mts,tsx`           |
| Plain‑text headings            | `tscribe --format plain`             |
| Alphabetical sort, ignore dist | `tscribe --sort alpha --ignore dist` |
| List matched files only        | `tscribe --list`                     |
| Watch and rebuild              | `tscribe --watch`                    |

---

## Features

- Concatenate `.ts`, `.tsx`, or any extension list
- Set `--ext *` to match **all files** regardless of extension.
- Markdown or plain‑text headings (`--format`)
- Sort by `alpha`, `path`, or `mtime`
- Ignore patterns with safe defaults (`node_modules`,`dist`,`.git`), use **POSIX-style globs** relative to the working directory
- Output to **stdout**, **file** (`--out`)
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
  verbose: true, // show debug logs
});
```

You may omit most fields. If neither `out` nor `zip` is provided, output is sent to stdout.

---

### Options reference

| Property  | Type                           | Default                    | Description                                                                          |
| --------- | ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------ |
| `src`     | `string`                       | `"."`                      | Root directory to scan. Relative or absolute.                                        |
| `ext`     | `string`                       | `"ts,tsx"`                 | Comma‑separated extension, or `*` for all files.                                     |
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

- `alpha`: alphabetical (Natural sort order)
- `path`: original input order
- `mtime`: by file modification time (ascending)

---

## License

MIT © Soluble Labs Co., Ltd.
