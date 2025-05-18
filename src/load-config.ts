import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

export async function loadConfig(): Promise<Record<string, any>> {
  const configNames = [
    "tscribe.config.js",
    "tscribe.config.cjs",
    "tscribe.config.json",
  ];

  for (const name of configNames) {
    const full = path.resolve(name);
    try {
      await fs.promises.access(full);
      if (name.endsWith(".json") || name.endsWith(".cjs")) {
        return require(full);
      } else {
        const fileUrl = pathToFileURL(full).href;
        return (await import(fileUrl)).default ?? {};
      }
    } catch {
      continue;
    }
  }

  return {};
}
