#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const pkgRoot = path.resolve(__dirname, '..');
const repo = process.cwd();
const SKILLS = ['install-patch-md', 'modify-with-patch-md', 'update-with-patch-md'];
const force = process.argv.includes('--force');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: patchmd [--force]\n\nInstall PatchMD skills in the current repository.');
  process.exit(0);
}
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
}
const unknown = process.argv.slice(2).filter((arg) => arg !== '--force');
if (unknown.length) {
  console.error(`Unknown option: ${unknown[0]}. Run patchmd --help for usage.`);
  process.exit(2);
}

function files(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? files(absolute, base) : [path.relative(base, absolute)];
  }).sort();
}

function sameTree(left, right) {
  const leftFiles = files(left);
  const rightFiles = files(right);
  return leftFiles.length === rightFiles.length && leftFiles.every((name, index) =>
    name === rightFiles[index] && fs.readFileSync(path.join(left, name)).equals(fs.readFileSync(path.join(right, name))),
  );
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function replaceDir(src, dest) {
  const parent = path.dirname(dest);
  fs.mkdirSync(parent, { recursive: true });
  const stage = fs.mkdtempSync(path.join(parent, `.${path.basename(dest)}-stage-`));
  const backup = `${dest}.patchmd-backup-${process.pid}-${Date.now()}`;
  copyDir(src, stage);
  try {
    if (fs.existsSync(dest)) fs.renameSync(dest, backup);
    fs.renameSync(stage, dest);
    fs.rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    fs.rmSync(stage, { recursive: true, force: true });
    if (!fs.existsSync(dest) && fs.existsSync(backup)) fs.renameSync(backup, dest);
    throw error;
  }
}

function canonicalTarget(name) {
  return path.join(repo, '.agents', 'skills', name);
}

function assertSafeDestination(src, dest, label) {
  if (!fs.existsSync(dest) || sameTree(src, dest) || force) return;
  throw new Error(`${label} contains local changes. Re-run with --force to replace it.`);
}

function assertSafeFile(src, dest, label) {
  if (!fs.existsSync(dest) || fs.readFileSync(src).equals(fs.readFileSync(dest)) || force) return;
  throw new Error(`${label} contains local changes. Re-run with --force to replace it.`);
}

// Preflight every destination before writing anything.
for (const name of SKILLS) {
  assertSafeDestination(path.join(pkgRoot, 'skills', name), canonicalTarget(name), `.agents/skills/${name}`);
  const claude = path.join(repo, '.claude', 'skills', name);
  if (fs.existsSync(claude)) {
    const stat = fs.lstatSync(claude);
    if (stat.isSymbolicLink()) {
      const actual = fs.realpathSync(claude);
      const expected = fs.realpathSync(canonicalTarget(name));
      if (actual !== expected && !force) throw new Error(`.claude/skills/${name} points elsewhere. Re-run with --force to replace it.`);
    } else {
      assertSafeDestination(path.join(pkgRoot, 'skills', name), claude, `.claude/skills/${name}`);
    }
  }
}
const templateSource = path.join(pkgRoot, 'template', 'PATCH.md');
const templateTarget = path.join(repo, '.agents', 'patchmd', 'PATCH.md');
assertSafeFile(templateSource, templateTarget, '.agents/patchmd/PATCH.md');

for (const name of SKILLS) replaceDir(path.join(pkgRoot, 'skills', name), canonicalTarget(name));
fs.mkdirSync(path.join(repo, '.agents', 'patchmd'), { recursive: true });
fs.copyFileSync(templateSource, templateTarget);

function link(name) {
  const target = canonicalTarget(name);
  const linkPath = path.join(repo, '.claude', 'skills', name);
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.rmSync(linkPath, { recursive: true, force: true });
  try {
    fs.symlinkSync(target, linkPath, 'junction');
    return 'linked';
  } catch {
    copyDir(target, linkPath);
    return 'copied';
  }
}

const modes = SKILLS.map((name) => `${name} (${link(name)})`);
console.log('PatchMD skills installed:');
for (const mode of modes) console.log(`  .claude/skills/${mode}`);
console.log('Template: .agents/patchmd/PATCH.md\n');
console.log('Next: tell your agent to use the install-patch-md skill in this repo.');
