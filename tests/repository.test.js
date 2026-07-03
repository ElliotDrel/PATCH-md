'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const required = [
  'README.md',
  'SPEC.md',
  'template/PATCH.md',
  'examples/minimal.PATCH.md',
  'examples/customization.PATCH.md',
  'examples/retired-fix.PATCH.md',
  'skills/install-patch-md/SKILL.md',
  'skills/modify-with-patch-md/SKILL.md',
  'skills/update-with-patch-md/SKILL.md',
  'skills/install-patch-md/assets/agent-instructions.md',
  'skills/install-patch-md/assets/pre-commit.sh',
  'skills/install-patch-md/assets/patchmd-ci.yml',
  'bin/install.js',
];
const fields = ['Status', 'Intent', 'Why', 'Behavior', 'Scope', 'Reconstruction'];

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function markdown() {
  return execFileSync('git', ['ls-files', '*.md'], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((relative) => path.join(root, relative))
    .filter((absolute) => fs.existsSync(absolute));
}

test('repository contains complete, clean Markdown', () => {
  for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  for (const file of markdown()) {
    const source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file);
    assert.ok(source.endsWith('\n'), `missing final newline: ${relative}`);
    assert.doesNotMatch(source, /\[TODO/, `unfinished placeholder: ${relative}`);
    source.split('\n').forEach((line, index) => assert.equal(line, line.trimEnd(), `trailing whitespace: ${relative}:${index + 1}`));
    for (const match of source.matchAll(/\[[^\]]+\]\((?!https?:\/\/)([^)#]+)/g)) {
      assert.ok(fs.existsSync(path.resolve(path.dirname(file), match[1])), `broken local link in ${relative}: ${match[1]}`);
    }
  }
  assert.ok(!fs.existsSync(path.join(root, 'PATCH.md')), 'the standards repo must not contain a downstream PATCH.md');
});

test('template and examples contain the required record shape', () => {
  const template = read('template/PATCH.md');
  for (const heading of ['## Upstream', '## Verification', '## Active customizations', '## Retired customizations']) assert.match(template, new RegExp(heading));
  for (const field of fields) assert.match(template, new RegExp(`\\*\\*${field}:\\*\\*`));
  const minimal = read('examples/minimal.PATCH.md');
  for (const marker of ['Repository:', 'Branch:', '## Verification', 'No active customizations.', 'No retired customizations.']) assert.match(minimal, new RegExp(marker));
  const active = read('examples/customization.PATCH.md');
  const retired = read('examples/retired-fix.PATCH.md');
  for (const field of fields) {
    assert.match(active, new RegExp(`\\*\\*${field}:\\*\\*`));
    assert.match(retired, new RegExp(`\\*\\*${field}:\\*\\*`));
  }
  assert.match(active, /\*\*Status:\*\* active/);
  assert.match(retired, /\*\*Status:\*\* retired/);
});

test('skills retain their names and documented safety rules', () => {
  for (const name of ['install-patch-md', 'modify-with-patch-md', 'update-with-patch-md']) {
    const source = read(`skills/${name}/SKILL.md`);
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, `${name} has invalid frontmatter`);
    assert.match(frontmatter[1], new RegExp(`^name: ${name}$`, 'm'));
    assert.match(frontmatter[1], /^description: .+$/m);
  }
  const install = read('skills/install-patch-md/SKILL.md').replace(/\s+/g, ' ');
  for (const marker of ['.agents/skills/', 'Propose the wiring', 'assets/agent-instructions.md', 'assets/pre-commit.sh', 'assets/patchmd-ci.yml']) assert.ok(install.includes(marker), `install skill missing: ${marker}`);
  const update = read('skills/update-with-patch-md/SKILL.md').replace(/\s+/g, ' ');
  for (const marker of [
    'Never discard uncommitted work',
    'recoverable Git ref',
    'exact Git blob bytes',
    'downstream deleted it, write no file',
    'upstream-based side with `--ours`',
    'Ask before reconstructing',
    'Roll back',
    'Stop before push',
    '`--force-with-lease`',
    'Follow any update flow',
  ]) assert.ok(update.includes(marker), `update skill missing: ${marker}`);
});
