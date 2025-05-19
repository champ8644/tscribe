import { applySort, buildGlobPattern, tscribe } from "../src/core";
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const TEMP_DIRS = [
  "__temp__",
  "__temp_list__",
  "__temp_stdout__",
  "__temp_out__",
  "__temp_out_empty__",
  "__temp_empty__",
  "__temp_glob_error__",
  "__temp_workspace__",
];

describe("applySort", () => {
  it("sorts alphabetically", async () => {
    const sorted = await applySort(["z.ts", "a.ts", "m.ts"], "alpha");
    expect(sorted).toEqual(["a.ts", "m.ts", "z.ts"]);
  });

  it("sorts by path (default)", async () => {
    const files = ["z.ts", "a.ts", "m.ts"];
    const sorted = await applySort([...files], "path");
    expect(sorted).toEqual(files);
  });

  it("sorts by mtime", async () => {
    const base = path.join(ROOT, "__temp__");
    const paths = ["1.ts", "2.ts", "3.ts"].map((f) => path.join(base, f));

    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(paths[1], "2");
    await new Promise((r) => setTimeout(r, 10));
    fs.writeFileSync(paths[0], "1");
    await new Promise((r) => setTimeout(r, 10));
    fs.writeFileSync(paths[2], "3");

    const sorted = await applySort(paths, "mtime");
    expect(sorted).toEqual([paths[1], paths[0], paths[2]]);
  });
});

describe("tscribe integration", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  describe("basic output modes", () => {
    it("prints file list to console", async () => {
      const base = path.join(ROOT, "__temp_list__");
      const file = path.join(base, "demo.ts");
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(file, "// hello");

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      await tscribe({
        src: base,
        ext: "ts",
        ignore: "",
        format: "plain",
        sort: "path",
        list: true,
      });
      expect(logSpy).toHaveBeenCalledWith(expect.any(String));
      logSpy.mockRestore();
    });

    it("writes to stdout without --out", async () => {
      const base = path.join(ROOT, "__temp_stdout__");
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, "a.ts"), "console.log('A');");
      fs.writeFileSync(path.join(base, "b.ts"), "console.log('B');");

      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      const visible = fs.readdirSync(base);
      console.log("📁 Files visible to tscribe:", visible);
      visible.forEach((f) => {
        const content = fs.readFileSync(path.join(base, f), "utf8");
        console.log("🔍 Content of", f, "=", content);
      });

      await tscribe({
        src: base,
        ext: "ts",
        ignore: "",
        format: "md",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");
      expect(output).toContain("console.log('A');");
      expect(output).toContain("console.log('B');");
      writeSpy.mockRestore();
    });

    it("writes output to text file with --out only", async () => {
      const base = path.join(ROOT, "__temp_out__");
      const out = path.join(base, "out.txt");
      const file = path.join(base, "demo.ts");

      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(file, `console.log('hello');`);

      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "ts",
        out,
        format: "md",
        sort: "path",
      });

      const result = fs.readFileSync(out, "utf8");
      expect(result).toContain("console.log('hello');");

      const stdoutDump = writeSpy.mock.calls.map(([s]) => String(s)).join("");
      expect(stdoutDump).not.toContain("console.log('hello');");

      writeSpy.mockRestore();
    });

    it("creates an empty file when no files match and --out is given", async () => {
      const base = path.join(ROOT, "__temp_out_empty__");
      const out = path.join(base, "out.txt");

      fs.mkdirSync(base, { recursive: true });
      await tscribe({
        src: base,
        ext: "ts",
        out,
        format: "plain",
        sort: "path",
        quiet: true,
      });

      const content = fs.readFileSync(out, "utf8");
      expect(content).toBe("");
    });

    it("writes empty to stdout when no files and no --out", async () => {
      const base = path.join(ROOT, "__temp_empty__");
      fs.mkdirSync(base, { recursive: true });

      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);
      await tscribe({
        src: base,
        ext: "ts",
        format: "plain",
        sort: "path",
        quiet: true,
      });

      expect(writeSpy).toHaveBeenCalledWith("");
      writeSpy.mockRestore();
    });

    it("logs an error when glob pattern throws", async () => {
      const base = path.join(ROOT, "__temp_glob_error__");
      fs.mkdirSync(base, { recursive: true });

      const debugSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const globSpy = jest
        .spyOn(require("glob"), "glob")
        .mockImplementation(() => {
          throw new Error("Mock glob failure");
        });

      await tscribe({
        src: base,
        ext: "ts",
        format: "plain",
        sort: "alpha",
      });

      const output = debugSpy.mock.calls.map((c) => c.join(" ")).join("\n");
      expect(output).toMatch(/error in glob:.*Mock glob failure/i);

      debugSpy.mockRestore();
      globSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("exits early if src does not exist", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      await tscribe({
        src: "__nonexistent__",
        ext: "ts",
        format: "plain",
        sort: "path",
      });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("Processed 0 files")
      );
      logSpy.mockRestore();
    });
  });

  describe("realistic project layout", () => {
    const base = path.join(ROOT, "__temp_workspace__");

    beforeAll(() => {
      // Create folders
      fs.mkdirSync(path.join(base, ".git"), { recursive: true });
      fs.mkdirSync(path.join(base, "node_modules", "fake-dep"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(base, "packages", "core"), { recursive: true });
      fs.mkdirSync(path.join(base, "packages", "ignored"), { recursive: true });
      fs.mkdirSync(path.join(base, "utils"), { recursive: true });

      // Write various files
      fs.writeFileSync(path.join(base, "index.ts"), "console.log('index');");
      fs.writeFileSync(
        path.join(base, "index.tsx"),
        "export default function Index() {};"
      );
      fs.writeFileSync(path.join(base, "README.md"), "# Hello World");
      fs.writeFileSync(
        path.join(base, ".gitignore"),
        "node_modules\npackages/ignored"
      );

      fs.writeFileSync(path.join(base, ".git", "HEAD"), "ref: refs/heads/main");
      fs.writeFileSync(
        path.join(base, "node_modules", "fake-dep", "index.js"),
        "module.exports = {};"
      );

      fs.writeFileSync(
        path.join(base, "packages", "core", "core.ts"),
        "export const core = true;"
      );
      fs.writeFileSync(
        path.join(base, "packages", "core", "core.tsx"),
        "export const Core = () => <div />;"
      );
      fs.writeFileSync(
        path.join(base, "packages", "ignored", "hidden.ts"),
        "// should be ignored"
      );

      fs.writeFileSync(
        path.join(base, "utils", "helpers.ts"),
        "export function help() {}"
      );
      fs.writeFileSync(
        path.join(base, "utils", "math.js"),
        "export const PI = 3.14;"
      );
    });

    it("respects ignore patterns and includes only ts/tsx", async () => {
      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "ts,tsx",
        ignore: "node_modules/**,.git/**,packages/ignored/**",
        format: "plain",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");
      expect(output).toContain("core.ts");
      expect(output).toContain("core.tsx");
      expect(output).toContain("index.tsx");
      expect(output).not.toContain("hidden.ts");
      expect(output).not.toContain("math.js");
      expect(output).not.toContain("fake-dep");
      expect(output).not.toContain(".git");

      writeSpy.mockRestore();
    });

    it("includes markdown headings for each file when using md format", async () => {
      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "ts,tsx",
        ignore: "node_modules/**,.git/**,packages/ignored/**",
        format: "md",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");
      expect(output).toMatch(/### .*core\.ts/);
      expect(output).toMatch(/### .*core\.tsx/);
      expect(output).toMatch(/### .*index\.ts/);
      writeSpy.mockRestore();
    });

    it("sorts files alphabetically when sort is alpha", async () => {
      const base = path.join(ROOT, "__temp_workspace__");
      const outPath = path.join(ROOT, "__temp_out__", "out.txt");

      // Ensure output directory exists
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      await tscribe({
        src: base,
        ext: "ts,tsx",
        ignore: "node_modules/**,.git/**,packages/ignored/**",
        format: "plain",
        sort: "alpha",
        out: outPath,
        verbose: true,
      });

      const output = fs.readFileSync(outPath, "utf8");

      const rel = (file: string) =>
        path.relative(process.cwd(), path.join(base, file)).replace(/\\/g, "/");

      const order = [
        "packages/core/core.ts",
        "packages/core/core.tsx",
        "utils/helpers.ts",
        "index.ts",
        "index.tsx",
      ];

      const headings = order.map((f) => `// --- ${rel(f)} ---`);

      const positions = headings.map((h) => {
        const pos = output.indexOf(h);
        expect(pos).toBeGreaterThanOrEqual(0);
        return pos;
      });

      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
    });

    it("includes .ts, .tsx files but excludes .js if not specified", async () => {
      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "ts,tsx",
        ignore: "",
        format: "plain",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");
      expect(output).toContain("core.ts");
      expect(output).not.toContain("math.js");
      writeSpy.mockRestore();
    });

    it("includes .js when specified in ext", async () => {
      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "ts,tsx,js",
        ignore: "packages/ignored/**",
        format: "plain",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");
      expect(output).toContain("math.js");
      expect(output).not.toContain("hidden.ts");
      writeSpy.mockRestore();
    });

    it("matches all files when ext is empty or '*'", async () => {
      const base = path.join(ROOT, "__temp_workspace__");

      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "", // <--- triggers the red branch
        ignore: "node_modules/**,.git/**,packages/ignored/**",
        format: "plain",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");

      expect(output).toContain("core.ts");
      expect(output).toContain("core.tsx");
      expect(output).toContain("index.ts");
      expect(output).toContain("index.tsx");
      expect(output).toContain("README.md"); // <- non-ts file matched
      expect(output).not.toContain("hidden.ts");
      expect(output).not.toContain("fake-dep");

      writeSpy.mockRestore();
    });

    it("respects custom ignore paths like packages/ignored/**", async () => {
      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      await tscribe({
        src: base,
        ext: "ts,tsx,js",
        ignore: "packages/ignored/**",
        format: "plain",
        sort: "alpha",
        quiet: true,
      });

      const output = writeSpy.mock.calls.flat().join("");
      expect(output).not.toContain("hidden.ts");
      writeSpy.mockRestore();
    });
  });

  afterAll(() => {
    for (const dir of TEMP_DIRS) {
      const abs = path.join(ROOT, dir);
      if (fs.existsSync(abs)) fs.rmSync(abs, { recursive: true, force: true });
    }
    delete process.env.NODE_ENV;
  });
});
