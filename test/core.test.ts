import { applySort, tscribe } from "../src/core";
import * as fs from "fs";
import * as path from "path";

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
    });

    expect(fs.existsSync(zipPath)).toBe(true);
    await fs.promises.rm(base, { recursive: true, force: true });
  });
});

// cleanup any temp directories we created under the project root
afterAll(async () => {
  for (const dir of ["__temp__", "__temp_list__", "__temp_zip__"]) {
    await fs.promises.rm(path.join(ROOT, dir), {
      recursive: true,
      force: true,
    });
  }
});
