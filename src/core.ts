import { promises as fs, createWriteStream, existsSync, readdirSync } from "fs";
import path from "path";
import { glob } from "glob";
import archiver from "archiver";
import { TscribeOptions } from "./types";

function log(message: string, opts: TscribeOptions) {
  if (!opts.quiet) console.log(message);
}

function debug(message: string, opts: TscribeOptions) {
  if (opts.verbose && !opts.quiet) console.log("[debug]", message);
}

/**
 * Find files directly using filesystem APIs - more reliable in test environments
 */
export async function findFilesDirectly(
  dir: string,
  extensions: string[]
): Promise<string[]> {
  try {
    const dirFiles = readdirSync(dir);
    return dirFiles
      .filter((file) => {
        const ext = path.extname(file).slice(1).toLowerCase();
        return extensions.includes(ext);
      })
      .map((file) => path.join(dir, file));
  } catch (err) {
    return [];
  }
}

export async function tscribe(opts: TscribeOptions): Promise<void> {
  const headingTpl =
    opts.heading ||
    (opts.format === "plain" ? "// --- {file} ---" : "### {file}");

  debug(`src = ${opts.src}`, opts);
  debug(`ext = ${opts.ext}`, opts);
  debug(`ignore = ${opts.ignore}`, opts);
  debug(`sort = ${opts.sort}`, opts);

  let files: string[] = [];
  const srcPath = path.resolve(opts.src);

  // Check if directory exists
  if (!existsSync(srcPath)) {
    debug(`Source directory ${srcPath} does not exist`, opts);
    log(`✅ Processed 0 files.`, opts);
    return;
  }

  // Parse extensions
  const extsArray = opts.ext.split(",").map((e) => e.trim().toLowerCase());

  // Use direct file reading - more reliable especially for tests
  files = await findFilesDirectly(srcPath, extsArray);

  // If no files found yet, try with glob as fallback
  if (files.length === 0) {
    const pattern = `${srcPath.replace(/\\/g, "/")}/**/*.{${opts.ext}}`;
    log(`🚀 ~ tscribe ~ pattern: ${pattern}`, opts);

    const ignoreList = (opts.ignore ?? "node_modules,dist,.git")
      .split(",")
      .map((p) => p.trim());

    try {
      files = await glob(pattern, {
        ignore: ignoreList,
        windowsPathsNoEscape: true,
        absolute: true,
      });

      debug(`Found ${files.length} files using glob`, opts);
    } catch (err) {
      debug(`Error in glob: ${err}`, opts);
    }
  } else {
    debug(`Found ${files.length} files using direct file system`, opts);
  }

  //   console.log("🔍 tscribe: files =", files);

  if (files.length === 0) {
    debug("No files found", opts);
    log(`✅ Processed 0 files.`, opts);
    if (!opts.zip) {
      process.stdout.write(""); // Empty output when no files found
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

  if (opts.zip) {
    const stream = createWriteStream(path.resolve(opts.zip));
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(stream);
    archive.append(fullOutput, { name: "output.txt" });
    await archive.finalize();
    await new Promise<void>((resolve) => stream.on("close", () => resolve()));
    log(`📦 Zipped output to ${opts.zip}`, opts);
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
