'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const installer = path.resolve(__dirname, '../bin/install.js');

function sandbox() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'patchmd-test-'));
}

function run(cwd, ...args) {
  return spawnSync(process.execPath, [installer, ...args], { cwd, encoding: 'utf8' });
}

test('installs all skills and can rerun without changes', (t) => {
  const cwd = sandbox();
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  assert.equal(run(cwd).status, 0);
  assert.equal(run(cwd).status, 0);
  for (const name of ['install-patch-md', 'modify-with-patch-md', 'update-with-patch-md']) {
    assert.ok(fs.existsSync(path.join(cwd, '.agents', 'skills', name, 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(cwd, '.claude', 'skills', name, 'SKILL.md')));
  }
});

test('refuses to overwrite local changes unless forced', (t) => {
  const cwd = sandbox();
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  assert.equal(run(cwd).status, 0);
  const skill = path.join(cwd, '.agents', 'skills', 'modify-with-patch-md', 'SKILL.md');
  fs.appendFileSync(skill, '\nlocal customization\n');
  const rejected = run(cwd);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /contains local changes/);
  assert.match(fs.readFileSync(skill, 'utf8'), /local customization/);
  assert.equal(run(cwd, '--force').status, 0);
  assert.doesNotMatch(fs.readFileSync(skill, 'utf8'), /local customization/);
});

test('protects a locally modified template', (t) => {
  const cwd = sandbox();
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  assert.equal(run(cwd).status, 0);
  const template = path.join(cwd, '.agents', 'patchmd', 'PATCH.md');
  fs.appendFileSync(template, '\nlocal template note\n');
  const rejected = run(cwd);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /PATCH\.md contains local changes/);
  assert.match(fs.readFileSync(template, 'utf8'), /local template note/);
});

test('reports version and rejects unknown options', () => {
  const cwd = sandbox();
  try {
    assert.match(run(cwd, '--version').stdout, /^0\.2\.0\s*$/);
    assert.equal(run(cwd, '--wat').status, 2);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
