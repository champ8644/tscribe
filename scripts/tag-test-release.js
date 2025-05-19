const { execSync } = require("child_process");
const pkg = require("../package.json");

const baseVersion = pkg.version;
const tagPrefix = `v${baseVersion}-test`;

// Find existing test tags for this version
const existingTags = execSync(`git tag --list "${tagPrefix}.*"`)
  .toString()
  .split("\n")
  .filter((tag) => tag.startsWith(tagPrefix));

const nextSuffix = existingTags.length;
const newTag = `${tagPrefix}.${nextSuffix}`;

console.log(`🏷 Creating test tag: ${newTag}`);
execSync(`git tag ${newTag}`, { stdio: "inherit" });
execSync(`git push origin ${newTag}`, { stdio: "inherit" });
