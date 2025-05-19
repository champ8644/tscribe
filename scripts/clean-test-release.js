const { execSync } = require("child_process");
const version = require("../package.json").version;
const tag = `v${version}-test`;

console.log(`🧹 Removing test tag: ${tag}`);
execSync(`git tag -d ${tag}`, { stdio: "inherit" });
execSync(`git push origin :refs/tags/${tag}`, { stdio: "inherit" });
