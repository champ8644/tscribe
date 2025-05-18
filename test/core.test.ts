import { applySort } from "../src/core";
import fs from "fs";
import path from "path";

const base = path.join(__dirname, "__temp__");

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
    const paths = [`${base}/1.ts`, `${base}/2.ts`, `${base}/3.ts`];

    await fs.promises.mkdir(base, { recursive: true });

    await fs.promises.writeFile(paths[1], "2");
    await new Promise((r) => setTimeout(r, 10));
    await fs.promises.writeFile(paths[0], "1");
    await new Promise((r) => setTimeout(r, 10));
    await fs.promises.writeFile(paths[2], "3");

    const sorted = await applySort(paths, "mtime");
    expect(sorted).toEqual([paths[1], paths[0], paths[2]]);
  });

  afterAll(async () => {
    // Recursively remove the __temp__ directory
    await fs.promises.rm(base, { recursive: true, force: true });
  });
});
