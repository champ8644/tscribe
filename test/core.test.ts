import { applySort, tscribe } from "../src/core";
import fs from "fs";
import path from "path";

// Use project root temp directories so Jest won't pick them up as tests
const ROOT = process.cwd();

describe("applySort", () => {
  const files = ["z.ts", "a.ts", "m.ts"];

  it("sorts alphabetically", async () => {
    const sorted = await applySort([...files], "alpha");
    expect(sorted).toEqual(["a.ts", "m.ts", "z.ts"]);
  });

  it("sorts by path (default)", async () => {
    const sorted = await applySort([...files], "path");
    expect(sorted).toEqual(files);
  });

  it("sorts by mtime", async () => {
    const base = path.join(ROOT, "__temp__");
    const paths = [
      path.join(base, "1.ts"),
      path.join(base, "2.ts"),
      path.join(base, "3.ts"),
    ];

    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(paths[1], "2");
    await new Promise((r) => setTimeout(r, 10));
    await fs.promises.writeFile(paths[0], "1");
    await new Promise((r) => setTimeout(r, 10));
    await fs.promises.writeFile(paths[2], "3");

    const sorted = await applySort(paths, "mtime");
    expect(sorted).toEqual([paths[1], paths[0], paths[2]]);

    await fs.promises.rm(base, { recursive: true, force: true });
  });
});

describe("tscribe integration", () => {
  it("prints list of files when opts.list is true", async () => {
    const base = path.join(ROOT, "__temp_list__");
    const filePath = path.join(base, "demo.ts");

    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(filePath, "// hello");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await tscribe({
      src: base,
      ext: "ts",
      ignore: "",
      format: "plain",
      sort: "path",
      list: true,
      quiet: true,
    });

    expect(logSpy).toHaveBeenCalledWith(expect.any(String));
    logSpy.mockRestore();
    await fs.promises.rm(base, { recursive: true, force: true });
  });

  it("writes output to a zip file", async () => {
    const base = path.join(ROOT, "__temp_zip__");
    const zipPath = path.join(base, "output.zip");

    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(path.join(base, "test.ts"), "let a = 1");

    await tscribe({
      src: base,
      ext: "ts",
      ignore: "",
      format: "plain",
      sort: "alpha",
      zip: zipPath,
      quiet: true,
    });

    expect(fs.existsSync(zipPath)).toBe(true);
    await fs.promises.rm(base, { recursive: true, force: true });
  });

  it("applies a valid transform module", async () => {
    const base = path.join(ROOT, "__temp_transform__");
    const transformPath = path.join(base, "transform.cjs");
    const filePath = path.join(base, "test.ts");
    const outPath = path.join(base, "out.txt");

    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(filePath, "const x = 42;");
    await fs.promises.writeFile(
      transformPath,
      `module.exports = (t) => t.replace(/42/, "99");`
    );

    await tscribe({
      src: base,
      ext: "ts",
      out: outPath,
      transform: transformPath,
      ignore: "",
      quiet: true,
      format: "plain",
      sort: "path",
    });

    const result = await fs.promises.readFile(outPath, "utf8");
    expect(result).toContain("99");
    await fs.promises.rm(base, { recursive: true, force: true });
  });

  it("exits when transform file fails to load", async () => {
    const spy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(
      tscribe({
        src: ROOT,
        ext: "ts",
        ignore: "",
        transform: "nonexistent/path.cjs",
        format: "plain",
        quiet: true,
        sort: "path",
      })
    ).rejects.toThrow("process.exit called");

    spy.mockRestore();
  });
});

// Cleanup any root temp folders
afterAll(async () => {
  await Promise.all([
    fs.promises.rm(path.join(ROOT, "__temp_list__"), {
      recursive: true,
      force: true,
    }),
    fs.promises.rm(path.join(ROOT, "__temp_zip__"), {
      recursive: true,
      force: true,
    }),
    fs.promises.rm(path.join(ROOT, "__temp_transform__"), {
      recursive: true,
      force: true,
    }),
    fs.promises.rm(path.join(ROOT, "__temp__"), {
      recursive: true,
      force: true,
    }),
  ]);
});
