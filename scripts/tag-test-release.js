const { execSync } = require("child_process");
const version = require("../package.json").version;
const tag = `v${version}-test`;

console.log(`📦 Tagging test release: ${tag}`);
execSync(`git tag ${tag}`, { stdio: "inherit" });
execSync(`git push origin ${tag}`, { stdio: "inherit" });
