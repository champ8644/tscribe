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
  // Set NODE_ENV to 'test' for all tests
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

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

  it("writes concatenated output to stdout when no --out or --zip is given", async () => {
    const base = path.join(ROOT, "__temp_stdout__");
    fs.mkdirSync(base, { recursive: true });

    const files = [
      { name: "a.ts", content: `console.log('A');` },
      { name: "b.ts", content: `console.log('B');` },
    ];

    // ✅ Synchronously write files to ensure they are visible immediately
    files.forEach((f) => {
      fs.writeFileSync(path.join(base, f.name), f.content);
    });

    const visible = fs.readdirSync(base);
    console.log("🧪 Visible files before tscribe:", visible);

    const writeSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    await tscribe({
      src: base,
      ext: "ts",
      ignore: "",
      format: "md",
      sort: "alpha",
      quiet: true,
    });

    const output = writeSpy.mock.calls.flat().join("");

    const relA = path
      .relative(process.cwd(), path.join(base, "a.ts"))
      .replace(/\\/g, "/");
    const relB = path
      .relative(process.cwd(), path.join(base, "b.ts"))
      .replace(/\\/g, "/");

    console.log("🧪 MOCK OUTPUT:", JSON.stringify(output, null, 2));

    expect(output).toContain(`### ${relA}`);
    expect(output).toContain("console.log('A');");
    expect(output).toContain(`### ${relB}`);
    expect(output).toContain("console.log('B');");

    writeSpy.mockRestore();
    fs.rmSync(base, { recursive: true, force: true });
  });

  it("emits debug messages when --verbose is set (and not when --quiet)", async () => {
    const base = path.join(ROOT, "__temp_debug__");
    const filePath = path.join(base, "debug.ts");
    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(filePath, "// debug info");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await tscribe({
      src: base,
      ext: "ts",
      ignore: "",
      format: "plain",
      sort: "path",
      list: true,
      verbose: true,
      quiet: false,
    });

    // ✅ Match the "[debug]" and string separately
    const debugMessages = logSpy.mock.calls
      .filter(([tag]) => tag === "[debug]")
      .map(([, msg]) => msg);

    expect(debugMessages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/src =/),
        expect.stringMatching(/Found \d+ files/),
      ])
    );

    logSpy.mockRestore();
  });
});

// cleanup any root temp directories you created
afterAll(async () => {
  process.env.NODE_ENV = undefined; // Reset NODE_ENV
  for (const dir of [
    "__temp__",
    "__temp_list__",
    "__temp_zip__",
    "__temp_stdout__",
    "__temp_debug__",
  ]) {
    await fs.promises.rm(path.join(ROOT, dir), {
      recursive: true,
      force: true,
    });
  }
});
