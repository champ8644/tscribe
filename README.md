# tscribe

<p>
  <a href="https://www.npmjs.com/package/tscribe">
    <img src="https://img.shields.io/npm/v/tscribe.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://github.com/champ8644/tscribe/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/champ8644/tscribe/ci.yml?branch=main&style=flat-square" alt="CI status" />
  </a>
  <a href="https://codecov.io/gh/champ8644/tscribe">
    <img src="https://img.shields.io/codecov/c/gh/champ8644/tscribe?style=flat-square" alt="Coverage" />
  </a>
  <a href="https://github.com/champ8644/tscribe/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/champ8644/tscribe?style=flat-square" alt="License" />
  </a>
</p>

Concatenate TypeScript-family source files into a single, ChatGPT-friendly text or a zip archive.
tscribe walks a directory tree, selects files by extension, adds a heading for each file, and prints or archives the result. It can also watch for changes or list files only.

---

## Features

- Concatenate `.ts`, `.tsx`, or any custom extension list
- Markdown or plain-text headings
- Alphabetical, path, or modification-time sort
- Ignore patterns with sensible defaults (`node_modules`, `dist`, `.git`)
- Optional zip output (`output.txt` inside the archive)
- Watch mode with automatic rebuilds
- Quiet and verbose flags for controlled logging
- 100 % test coverage

---

## Installation

```bash
npm install --save-dev tscribe
# or
pnpm add -D tscribe
```

Use `npx tscribe` to run without installing globally.

---

## CLI Usage

```bash
tscribe [options]
```

| Flag                   | Description                                   | Default                  |           |        |
| ---------------------- | --------------------------------------------- | ------------------------ | --------- | ------ |
| `-s, --src <dir>`      | Root folder to scan                           | `.`                      |           |        |
| `--zip <file>`         | Write `output.txt` to a zip archive           | _(disabled)_             |           |        |
| `-e, --ext <list>`     | Comma-separated extensions                    | `ts,tsx`                 |           |        |
| `--ignore <patterns>`  | Comma-separated glob ignore patterns          | `node_modules,dist,.git` |           |        |
| `--heading <template>` | Heading template, use `{file}` as placeholder | _(autoselect)_           |           |        |
| \`--format \<md        | plain>\`                                      | Heading style            | `md`      |        |
| \`--sort \<alpha       | path                                          | mtime>\`                 | Sort mode | `path` |
| `--list`               | Print matched file list only                  |                          |           |        |
| `--watch`              | Watch for changes and rerun                   |                          |           |        |
| `--verbose`            | Print debug messages                          |                          |           |        |
| `--quiet`              | Suppress normal logs                          |                          |           |        |

### Heading Templates

- **Markdown** (default): `### {file}`
- **Plain text**: `// --- {file} ---`

Custom templates can be supplied with `--heading`. The literal `{file}` will be replaced with the relative path.

---

## Examples

Concatenate all `.ts` and `.tsx` files under `src` and print to stdout:

```bash
tscribe --src src --ext ts,tsx
```

Create a zip archive:

```bash
tscribe --src packages/api --zip build/api-code.zip
```

List files only:

```bash
tscribe --src lib --list
```

Watch for changes:

```bash
tscribe --watch
```

---

## Configuration File

tscribe looks for one of the following files in the working directory, merged with CLI flags (CLI wins on conflict):

- `tscribe.config.js`
- `tscribe.config.cjs`
- `tscribe.config.json`

Minimal `tscribe.config.js` example:

```js
export default {
  src: "packages",
  ext: "ts,tsx",
  format: "md",
  sort: "alpha",
  ignore: "node_modules,dist,coverage",
};
```

---

## Library API

```ts
import { tscribe, applySort, findFilesDirectly } from "tscribe";

// run programmatically
await tscribe({
  src: ".",
  ext: "ts",
  format: "plain",
  sort: "mtime",
});
```

| Function                          | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `tscribe(opts)`                   | Main entry; produces concatenated output or zip |
| `applySort(files, mode)`          | Deterministic file ordering                     |
| `findFilesDirectly(dir, extList)` | Fast fs-based scanner used in tests             |

---

## Development

```bash
pnpm install
pnpm test      # runs Jest with coverage
```

Current coverage: **100 % statements, branches, functions, and lines**.

---

## License

MIT © Soluble Labs Co., Ltd.
