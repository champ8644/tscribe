import { Command } from "commander";
import chokidar from "chokidar";
import { tscribe } from "./core";
import { loadConfig } from "./load-config";
import { TscribeOptions } from "./types";
import { version } from "./version";

const program = new Command();

program
  .name("tscribe")
  .version(version, "-v, --version", "output the current version")
  .description(
    "Concatenate TypeScript-family files with headings, ready for ingestion by LLMs."
  )
  .option("-s, --src <directory>", "root folder to scan", ".")
  .option("-o, --out <file>", "write output to a text file")
  .option("-e, --ext <list>", "comma-separated extensions", "ts,tsx")
  .option(
    "--ignore <patterns>",
    "comma-separated ignore patterns",
    "node_modules,dist,.git"
  )
  .option("--heading <template>", "heading template", "")
  .option("--format <type>", "heading format: md or plain", "md")
  .option("--sort <mode>", "sort files: alpha, path, or mtime", "path")
  .option("--list", "print file list only")
  .option("--watch", "watch for file changes")
  .option("--verbose", "print debug output")
  .option("--quiet", "suppress console logs")
  .parse(process.argv);

const cliOpts = program.opts<TscribeOptions>();

(async () => {
  try {
    const config = await loadConfig();
    const opts: TscribeOptions = { ...config, ...cliOpts };

    const run = async () => {
      try {
        await tscribe(opts);
      } catch (err) {
        console.error("❌ Runtime error:", err);
        process.exit(1);
      }
    };

    if (opts.watch) {
      console.log("👀 Watching...");
      chokidar
        .watch(opts.src, {
          ignored: opts.ignore.split(","),
          ignoreInitial: false,
        })
        .on("all", run);
    } else {
      await run();
    }
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(2);
  }
})();
