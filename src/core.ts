import { promises as fs, existsSync, readdirSync } from "fs";
import path from "path";
import { glob } from "glob";
import { TscribeOptions } from "./types";
import micromatch from "micromatch";
import { orderBy } from "natural-orderby";

function log(message: string, opts: TscribeOptions) {
  if (!opts.quiet) console.log(message);
}

function debug(message: string, opts: TscribeOptions) {
  if (opts.verbose && !opts.quiet) console.log("[debug]", message);
}

function filterIgnoredPaths(
  files: string[],
  ignore: string,
  basePath: string
): string[] {
  if (!ignore?.trim()) return files;

  const patterns = ignore
    .split(",")
    .map((p) => p.trim().replace(/\\/g, "/"))
    .filter(Boolean);

  return files.filter((file) => {
    const relativePath = path.relative(basePath, file).replace(/\\/g, "/");
    return !micromatch.isMatch(relativePath, patterns);
  });
}

export function buildGlobPattern(srcPath: string, ext: string): string {
  const resolved = srcPath.replace(/\\/g, "/");
  if (ext === "" || ext === "*") {
    return `${resolved}/**/*`;
  }
  const exts = ext
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (exts.length > 1) {
    return `${resolved}/**/*.{${exts.join(",")}}`;
  }
  return `${resolved}/**/*.${exts[0]}`;
}

export async function tscribe(opts: TscribeOptions): Promise<void> {
  const headingTpl =
    opts.heading ||
    (opts.format === "plain" ? "// --- {file} ---" : "### {file}");

  debug(`src = ${opts.src}`, opts);
  debug(`ext = ${opts.ext}`, opts);
  debug(`ignore = ${opts.ignore}`, opts);
  debug(`sort = ${opts.sort}`, opts);
  debug(`verbose = ${opts.verbose}`, opts);

  let files: string[] = [];
  const srcPath = path.resolve(opts.src);

  // Check if directory exists
  if (!existsSync(srcPath)) {
    debug(`Source directory ${srcPath} does not exist`, opts);
    log(`✅ Processed 0 files.`, opts);
    return;
  }

  const pattern = buildGlobPattern(srcPath, opts.ext);

  debug(`glob pattern: ${pattern}`, opts);
  // handle ignore patterns properly
  const ignoreList = (opts.ignore ?? "node_modules,dist,.git")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  try {
    debug(`srcPath exists: ${existsSync(srcPath)}`, opts);
    debug(`ignoreList: ${ignoreList.join(", ")}`, opts);
    debug(`directory contents: ${readdirSync(srcPath).join(", ")}`, opts);

    files = await glob(pattern, {
      ignore: ignoreList,
      absolute: true,
      nodir: true,
    });
    debug(`found ${files.length} files via glob`, opts);
  } catch (err) {
    log(`error in glob: ${err}`, opts);
  }

  // apply manual filtering
  files = filterIgnoredPaths(files, opts.ignore || "", srcPath);
  debug(`final filtered files: ${files.length}`, opts);

  // show matched files only in verbose mode
  debug(`files matched before output: ${files.join(", ")}`, opts);

  if (files.length === 0) {
    debug("No files found", opts);
    log(`✅ Processed 0 files.`, opts);

    const empty = "";
    if (opts.out) {
      await fs.writeFile(path.resolve(opts.out), empty, "utf8"); // write empty file
    } else {
      process.stdout.write(empty); // default fallback
    }

    return;
  }

  const sorted = await applySort(files, opts.sort);

  if (opts.list) {
    log(sorted.join("\n"), opts);
    return;
  }

  const sections = await Promise.all(
    sorted.map(async (f) => {
      const body = await fs.readFile(f, "utf8");
      const title = headingTpl.replace(
        "{file}",
        path.relative(process.cwd(), f).replace(/\\/g, "/")
      );
      return `${title}\n\n${body}`;
    })
  );

  const fullOutput = sections.join("\n\n");

  if (opts.out) {
    // Fix: Make sure output file is written properly
    const outPath = path.resolve(opts.out);
    await fs.writeFile(outPath, fullOutput, "utf8");
    debug(`Output written to ${outPath}`, opts);
  } else {
    process.stdout.write(fullOutput);
  }

  log(`✅ Processed ${sections.length} files.`, opts);
}

export async function applySort(
  files: string[],
  mode: TscribeOptions["sort"]
): Promise<string[]> {
  switch (mode) {
    case "alpha":
      return orderBy([...files], [(f) => path.basename(f)]);
    case "mtime": {
      const stats = await Promise.all(
        files.map(async (f) => ({ file: f, mtime: (await fs.stat(f)).mtimeMs }))
      );
      return stats.sort((a, b) => a.mtime - b.mtime).map((s) => s.file);
    }
    case "path":
    default:
      return files;
  }
}
