#!/usr/bin/env node
/**
 * Auto-increment the package version and tag the release, driven by the
 * magnitude of the changes pushed to `main` (Conventional Commits style):
 *
 *   BREAKING change (feat!/BREAKING CHANGE:)  -> MAJOR  v1.0.0 -> v2.0.0
 *   feat:                                     -> MINOR  v1.0.0 -> v1.1.0
 *   anything else (fix, style, docs, refactor)-> PATCH  v1.0.0 -> v1.0.1
 *
 * Only runs for `main`; on any other branch it never bumps or tags.
 *
 * Runs as an npm script (`npm run release:version`) or inside the GitHub
 * Actions workflow (scripts/../version.yml). Safe to run locally too.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";

const ROOT = process.cwd();
const PKG_PATH = `${ROOT}/package.json`;
const LOCK_PATH = `${ROOT}/package-lock.json`;

const run = (cmd) => execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();

function writeOutput(key, value) {
  console.log(`${key}=${value}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

function currentBranch() {
  try {
    return run("git rev-parse --abbrev-ref HEAD");
  } catch {
    return "";
  }
}

function latestTag() {
  try {
    return run('git describe --tags --abbrev=0 --match "v[0-9]*.[0-9]*.[0-9]*"');
  } catch {
    return null;
  }
}

function parse(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v).replace(/^v/, ""));
  return m
    ? { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) }
    : null;
}

function setVersion(file, version) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  data.version = version;
  if (data.packages && data.packages[""] && data.packages[""].version !== undefined) {
    data.packages[""].version = version;
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function main() {
  const branch = currentBranch();
  if (branch && branch !== "main") {
    console.log(`On branch "${branch}" - skipping version bump (main only).`);
    writeOutput("bumped", "false");
    writeOutput("next", "");
    return;
  }

  const prevTag = latestTag();
  const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8"));
  const base = parse((prevTag || "").replace(/^v/, "")) || parse(pkg.version) || { major: 0, minor: 0, patch: 0 };

  // Commits since the last release tag. With no tag yet, use the whole history.
  const range = prevTag ? `${prevTag}..HEAD` : "HEAD";
  const subjects = run(`git log --format=%s ${range}`);
  const bodies = run(`git log --format=%B ${range}`);

  if (!subjects.trim()) {
    console.log("No new commits since the last release - nothing to version.");
    writeOutput("bumped", "false");
    writeOutput("next", "");
    return;
  }

  const hasBreaking =
    /BREAKING[ -]CHANGE\s*:/i.test(bodies) ||
    subjects
      .split("\n")
      .some((line) => /^[a-z]+(\([^)]*\))?!:/i.test(line.trim()));
  const hasFeature = subjects
    .split("\n")
    .some((line) => /^feat(\([^)]*\))?!?:/i.test(line.trim()));

  const next = { ...base };
  if (hasBreaking) {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  } else if (hasFeature) {
    next.minor += 1;
    next.patch = 0;
  } else {
    next.patch += 1;
  }

  const version = `${next.major}.${next.minor}.${next.patch}`;
  const tag = `v${version}`;

  setVersion(PKG_PATH, version);
  if (existsSync(LOCK_PATH)) setVersion(LOCK_PATH, version);

  run("git add package.json package-lock.json");
  run(`git commit -m "chore: release ${tag}"`);
  run(`git tag -a ${tag} -m "chore: release ${tag}"`);

  console.log(`Bumped ${base.major}.${base.minor}.${base.patch} -> ${tag}`);
  writeOutput("bumped", "true");
  writeOutput("next", version);
  writeOutput("tag", tag);
}

main();