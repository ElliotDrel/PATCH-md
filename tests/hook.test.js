'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const asset = path.resolve(__dirname, '../skills/install-patch-md/assets/pre-commit.sh');
const ciAsset = path.resolve(__dirname, '../skills/install-patch-md/assets/patchmd-ci.yml');

function shellCommand() {
  if (process.platform !== 'win32') return 'sh';
  const where = spawnSync('where.exe', ['git'], { encoding: 'utf8' });
  const gitPath = where.stdout?.split(/\r?\n/).find(Boolean);
  if (!gitPath) return 'sh';
  const bundled = path.resolve(path.dirname(gitPath), '..', 'bin', 'sh.exe');
  return fs.existsSync(bundled) ? bundled : 'sh';
}

function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('pre-commit asset warns only for unrecorded upstream-owned changes', (t) => {
  const sh = shellCommand();
  const shell = spawnSync(sh, ['--version']);
  if (shell.error) return t.skip('POSIX shell is unavailable');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'patchmd-hook-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  git(cwd, 'init', '-q');
  git(cwd, 'config', 'user.email', 'test@example.com');
  git(cwd, 'config', 'user.name', 'PatchMD Test');
  fs.writeFileSync(path.join(cwd, 'owned.txt'), 'upstream\n');
  fs.writeFileSync(path.join(cwd, 'PATCH.md'), '# PATCH.md\n');
  git(cwd, 'add', '.');
  git(cwd, 'commit', '-qm', 'upstream');
  git(cwd, 'branch', 'upstream-main');

  const hook = path.join(cwd, 'pre-commit.sh');
  fs.writeFileSync(hook, fs.readFileSync(asset, 'utf8').replace('__UPSTREAM_REF__', 'upstream-main'));
  fs.writeFileSync(path.join(cwd, 'owned.txt'), 'downstream\n');
  git(cwd, 'add', 'owned.txt');
  const warning = spawnSync(sh, [hook], { cwd, encoding: 'utf8' });
  assert.equal(warning.status, 0);
  assert.match(warning.stdout, /upstream-owned files changed/);

  fs.writeFileSync(path.join(cwd, 'PATCH.md'), '# PATCH.md\n\nRecorded.\n');
  git(cwd, 'add', 'PATCH.md');
  const recorded = spawnSync(sh, [hook], { cwd, encoding: 'utf8' });
  assert.equal(recorded.status, 0);
  assert.equal(recorded.stdout, '');
});

test('CI asset compares PATCH.md against the pull request base', (t) => {
  const sh = shellCommand();
  if (spawnSync(sh, ['--version']).error) return t.skip('POSIX shell is unavailable');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'patchmd-ci-'));
  const upstreamParent = fs.mkdtempSync(path.join(os.tmpdir(), 'patchmd-upstream-'));
  const upstream = path.join(upstreamParent, 'upstream.git');
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  t.after(() => fs.rmSync(upstreamParent, { recursive: true, force: true }));
  git(cwd, 'init', '-q', '-b', 'main');
  git(cwd, 'config', 'user.email', 'test@example.com');
  git(cwd, 'config', 'user.name', 'PatchMD Test');
  fs.writeFileSync(path.join(cwd, 'owned.txt'), 'upstream\n');
  git(cwd, 'add', '.');
  git(cwd, 'commit', '-qm', 'upstream');
  git(cwd, 'clone', '--bare', '.', upstream);

  fs.writeFileSync(path.join(cwd, 'PATCH.md'), '# PATCH.md\n');
  git(cwd, 'add', 'PATCH.md');
  git(cwd, 'commit', '-qm', 'adopt PatchMD');
  const prBase = git(cwd, 'rev-parse', 'HEAD').trim();
  fs.writeFileSync(path.join(cwd, 'owned.txt'), 'downstream\n');
  git(cwd, 'add', 'owned.txt');
  git(cwd, 'commit', '-qm', 'change owned file');

  const yaml = fs.readFileSync(ciAsset, 'utf8');
  const script = yaml.match(/        run: \|\r?\n([\s\S]+)$/)[1].replace(/^ {10}/gm, '');
  const env = {
    ...process.env,
    UPSTREAM_REPO: upstream.replace(/\\/g, '/'),
    UPSTREAM_BRANCH: 'main',
    PR_BASE_SHA: prBase,
  };
  const warning = spawnSync(sh, ['-c', script], { cwd, env, encoding: 'utf8' });
  assert.equal(warning.status, 0, warning.stderr);
  assert.match(warning.stdout, /upstream-owned files changed/);

  fs.appendFileSync(path.join(cwd, 'PATCH.md'), '\nRecorded.\n');
  git(cwd, 'add', 'PATCH.md');
  git(cwd, 'commit', '-qm', 'record intent');
  const recorded = spawnSync(sh, ['-c', script], { cwd, env, encoding: 'utf8' });
  assert.equal(recorded.status, 0, recorded.stderr);
  assert.match(recorded.stdout, /PATCH.md updated in this pull request/);
});
