const { execSync } = require("child_process");

// List all local test tags
const localTags = execSync(`git tag --list "v*-test*"`)
  .toString()
  .split("\n")
  .filter(Boolean);

if (localTags.length === 0) {
  console.log("✅ No test tags to delete.");
  process.exit(0);
}

console.log(`🧹 Deleting local test tags:\n  ${localTags.join("\n  ")}`);
execSync(`git tag -d ${localTags.join(" ")}`, { stdio: "inherit" });

console.log(`🚮 Deleting remote test tags...`);
for (const tag of localTags) {
  execSync(`git push origin :refs/tags/${tag}`, { stdio: "inherit" });
}
