#!/usr/bin/env node
'use strict';

// Optional convenience installer: `npx patch.md-intent`.
// Copies the PatchMD skills and template into the current repo, then points you
// at the setup skill. The agent path (read install-patch-md/SKILL.md) does the
// same thing without this script.

const fs = require('fs');
const path = require('path');

const pkgRoot = path.resolve(__dirname, '..');
const repo = process.cwd();
const SKILLS = ['install-patch-md', 'modify-with-patch-md', 'update-with-patch-md'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

// Canonical copy in .agents/skills, linked into .claude/skills (copy if linking fails).
function link(name) {
  const target = path.join(repo, '.agents', 'skills', name);
  const claude = path.join(repo, '.claude', 'skills');
  fs.mkdirSync(claude, { recursive: true });
  const linkPath = path.join(claude, name);
  fs.rmSync(linkPath, { recursive: true, force: true });
  try {
    fs.symlinkSync(target, linkPath, 'junction');
    return 'linked';
  } catch {
    copyDir(target, linkPath);
    return 'copied';
  }
}

for (const name of SKILLS) {
  copyDir(path.join(pkgRoot, 'skills', name), path.join(repo, '.agents', 'skills', name));
}
fs.mkdirSync(path.join(repo, '.agents', 'patchmd'), { recursive: true });
fs.copyFileSync(
  path.join(pkgRoot, 'template', 'PATCH.md'),
  path.join(repo, '.agents', 'patchmd', 'PATCH.md'),
);

const modes = SKILLS.map((name) => `${name} (${link(name)})`);

console.log('PatchMD skills installed:');
for (const mode of modes) console.log('  .claude/skills/' + mode);
console.log('Template: .agents/patchmd/PATCH.md');
console.log('');
console.log('Next, run the setup skill. Tell your agent:');
console.log('  Use the install-patch-md skill to set up PatchMD in this repo.');
