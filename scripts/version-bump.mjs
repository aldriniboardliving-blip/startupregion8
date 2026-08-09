#!/usr/bin/env node
/**
 * Auto version bump for Region 8 Startups.
 *
 * Determines the next semantic version from the commit messages between the
 * last release tag and HEAD (conventional-commit style), updates package.json,
 * commits the bump, and creates an annotated tag `vX.Y.Z`.
 *
 * Rules (per release):
 *   - major (v1.0.0 -> v2.0.0): any commit is a BREAKING CHANGE, or message
 *     contains `!:` / "breaking" / "major" / "overhaul" / "rewrite" / "redesign"
 *   - minor (v1.0.0 -> v1.1.0): any commit is a feature (`feat:`, "feature")
 *   - patch (v1.0.0 -> v1.0.1): fixes, style, chore, docs, refactor, perf, etc.
 *
 * Exits with a non-zero code if anything goes wrong, otherwise prints the new
 * version (e.g. "v1.2.3") to stdout.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const pkgPath = path.join(root, "package.json");

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...opts }).trim();
}

function getLastTag() {
  try {
    return sh("git describe --tags --abbrev=0 --match 'v[0-9]*'");
  } catch {
    return "";
  }
}

function getCommitsSince(lastTag) {
  try {
    const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
    const log = sh(`git log --oneline ${range}`);
    return log ? log.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
}

function classify(commits) {
  const msgs = commits.map((c) => c.replace(/^\w+\s+/, "").toLowerCase());

  const major = msgs.find((m) =>
    /breaking change|!(\s|$|\)|:)|overhaul|rewrite|redesign|migration|^major\b/.test(m)
  );
  if (major) return "major";

  const minor = msgs.find((m) =>
    /^feat(\([^)]*\))?!?:|^feature\b|new feature|add(ed)? .* feature/.test(m)
  );
  if (minor) return "minor";

  return "patch";
}

function bump(version, type) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

async function main() {
  const lastTag = getLastTag();
  const commits = getCommitsSince(lastTag);

  if (!commits.length) {
    console.log("");
    return;
  }

  const type = classify(commits);

  let current;
  if (lastTag) {
    current = lastTag.replace(/^v/, "");
  } else {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    current = pkg.version || "1.0.0";
  }

  if (!/^\d+\.\d+\.\d+$/.test(current)) {
    console.error(`[version-bump] Cannot parse current version "${current}".`);
    process.exit(1);
  }

  const next = bump(current, type);

  // Update package.json (keeps other working-tree changes untouched).
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.version !== next) {
    pkg.version = next;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    sh("git add package.json");
    try {
      sh(`git commit -m "chore(release): v${next}"`);
    } catch (e) {
      console.error(`[version-bump] ${e.message}`);
    }
  }

  try {
    sh(`git tag -a v${next} -m "Release v${next}"`);
  } catch (e) {
    // A tag that already exists (e.g. re-push) is not an error.
    console.error(`[version-bump] ${e.message}`);
  }

  console.log(`v${next}`);
}

main().catch((e) => {
  console.error(`[version-bump] ${e.message}`);
  process.exit(1);
});
