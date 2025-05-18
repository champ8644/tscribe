import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { pathToFileURL } from "url";
import { TscribeOptions } from "./types";

function log(message: string, opts: TscribeOptions) {
  if (!opts.quiet) console.log(message);
}

function debug(message: string, opts: TscribeOptions) {
  if (opts.verbose && !opts.quiet) console.log("[debug]", message);
}

export async function tscribe(opts: TscribeOptions): Promise<void> {
  const headingTpl =
    opts.heading ||
    (opts.format === "plain" ? "// --- {file} ---" : "### {file}");

  debug(`src = ${opts.src}`, opts);
  debug(`ext = ${opts.ext}`, opts);
  debug(`ignore = ${opts.ignore}`, opts);
  debug(`sort = ${opts.sort}`, opts);

  // Pass opts into plugin loader for proper logging
  const transformFn = await loadTransformPlugin(opts.transform, opts);

  const exts = opts.ext.split(",").map((e) => e.trim().toLowerCase());
  const pattern = `${path.resolve(opts.src)}/**/*.{${exts.join(",")}}`;
  const ignoreList = opts.ignore.split(",").map((p) => p.trim());
  const files = await glob(pattern, { ignore: ignoreList });

  debug(`Found ${files.length} file(s) before sort`, opts);
  const sorted = await applySort(files, opts.sort);

  if (opts.list) {
    log(sorted.join("\n"), opts);
    return;
  }

  const sections = await Promise.all(
    sorted.map(async (f) => {
      let body = await fs.readFile(f, "utf8");
      if (transformFn) {
        body = await transformFn(body, f);
      }
      const title = headingTpl.replace(
        "{file}",
        path.relative(process.cwd(), f)
      );
      return `${title}\n\n${body}`;
    })
  );

  const fullOutput = sections.join("\n\n");

  if (opts.zip) {
    const stream = createWriteStream(path.resolve(opts.zip));
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(stream);
    archive.append(fullOutput, { name: "output.txt" });
    await archive.finalize();
    await new Promise<void>((resolve) => stream.on("close", () => resolve()));
    log(`📦 Zipped output to ${opts.zip}`, opts);
  } else if (opts.out) {
    await fs.writeFile(opts.out, fullOutput, "utf8");
    log(`✅ Written to ${opts.out}`, opts);
  } else {
    process.stdout.write(fullOutput);
  }

  log(`✅ Processed ${sections.length} files.`, opts);
}

/**
 * Try to load a CommonJS transform module, exiting on failure.
 */
async function loadTransformPlugin(
  pathOrEmpty?: string,
  opts?: TscribeOptions
) {
  if (!pathOrEmpty) return undefined;

  const full = path.resolve(pathOrEmpty);
  if (full.endsWith(".cjs")) {
    try {
      // require the .cjs transform
      const mod = require(full);
      return mod.default ?? mod.transform ?? mod;
    } catch (err) {
      console.error("❌ Failed to load transform module:", err);
      // tests expect an exit(2)
      if (opts) process.exit(2);
      // in non-CLI contexts, rethrow
      throw err;
    }
  }

  // no other module types supported under CommonJS mode
  return undefined;
}

export async function applySort(
  files: string[],
  mode: TscribeOptions["sort"]
): Promise<string[]> {
  switch (mode) {
    case "alpha":
      return files.sort((a, b) => a.localeCompare(b));
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
