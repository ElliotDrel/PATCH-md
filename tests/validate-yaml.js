'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const root = path.resolve(__dirname, '..');
for (const file of ['.github/workflows/validate.yml', '.github/workflows/release.yml', 'skills/install-patch-md/assets/patchmd-ci.yml']) {
  YAML.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
for (const name of ['install-patch-md', 'modify-with-patch-md', 'update-with-patch-md']) {
  const source = fs.readFileSync(path.join(root, 'skills', name, 'SKILL.md'), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`${name} has no YAML frontmatter`);
  const data = YAML.parse(match[1]);
  if (data.name !== name || typeof data.description !== 'string') throw new Error(`${name} has invalid frontmatter`);
}
console.log('YAML validation passed.');
