const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../dist/index.js");
const content = fs.readFileSync(file, "utf8");

if (!content.startsWith("#!")) {
  fs.writeFileSync(file, "#!/usr/bin/env node\n" + content);
  fs.chmodSync(file, 0o755); // make it executable
}
