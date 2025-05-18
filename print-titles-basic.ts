import { promises as fs } from "fs";
import * as path from "path";

async function findTSFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const fullPath = path.resolve(dir, dirent.name);
      return dirent.isDirectory()
        ? findTSFiles(fullPath)
        : dirent.name.endsWith(".ts")
        ? [fullPath]
        : [];
    })
  );
  return files.flat();
}

async function main(rootDir: string, outputPath: string) {
  const tsFiles = await findTSFiles(rootDir);
  const chunks: string[] = [];

  for (const file of tsFiles) {
    const relative = path.relative(process.cwd(), file);
    const content = await fs.readFile(file, "utf8");
    chunks.push(`### 📄 ${relative}\n\`\`\`ts\n${content.trim()}\n\`\`\`\n`);
  }

  await fs.writeFile(outputPath, chunks.join("\n"), "utf8");
  console.log(`✅ Done. Written to ${outputPath}`);
}

main("./test", "output.txt").catch(console.error);
