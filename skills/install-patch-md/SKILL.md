---
name: install-patch-md
description: Add PatchMD to a new or existing downstream fork and wire it into the fork's real workflow. Use when the user asks to install, initialize, set up, or adopt PATCH.md; to inventory a fork's customizations; to install the modify and update skills; or to add the triggers (agent instructions, a pre-commit hook, a CI check) that keep PATCH.md honest.
---

# Install PatchMD

Set up PatchMD, wire it into how the fork already works, and never invent intent
or change product code. Show every edit and apply only what the user approves.

## 1. Install the skill files

Make sure all three PatchMD skills exist in the repo before anything else.

- Canonical copies live in `.agents/skills/<name>/`. Claude Code reads them
  through symlinks at `.claude/skills/<name>/`.
- If they are missing (for example you are running this skill from its raw URL),
  install them: run `npx patch.md-intent` in the repo root, or copy
  `install-patch-md`, `modify-with-patch-md`, and `update-with-patch-md` from
  this skill's repository into `.agents/skills/<name>/` and symlink each into
  `.claude/skills/<name>/`. Fall back to a plain copy if the platform blocks
  symlinks.
- Put the template where the skill can reach it: `.agents/patchmd/PATCH.md` from
  `template/PATCH.md`.

Do not touch product code yet.

## 2. Inspect the fork

1. Read the fork's agent instructions (`CLAUDE.md`, `AGENTS.md`, `README`).
2. Confirm the repository root, current branch, and working-tree status.
3. Identify the upstream repository and branch from remotes and tracking. Ask
   only when the evidence is ambiguous.
4. Find the merge base with upstream and inspect the downstream commits and
   diffs that diverge from it.
5. Discover the fork's normal install, test, typecheck, build, and smoke
   commands.
6. Discover how the fork updates from upstream today: update scripts, Makefile
   or `package.json` targets, documented steps, or CI. Note the entry points.

## 3. Propose the record

Group existing downstream changes by user or product intent, not by file or
commit. For each proposed entry show a stable kebab-case ID, intent, rationale,
observable behavior, scope, reconstruction guidance, and supporting commits.

Mark uncertain groupings. Never infer business intent from a diff alone. Ask the
user to correct or approve before writing anything.

## 4. Propose the wiring

Show one concrete plan, then apply only the parts the user approves.

- **Triggers (opt-in).** Offer the three layers and recommend the lightest that
  fits the fork. Use the files in this skill's `assets/`:
  - agent instructions: paste `assets/agent-instructions.md` into the fork's
    `CLAUDE.md`/`AGENTS.md`;
  - pre-commit hook: install `assets/pre-commit.sh` to `.git/hooks/pre-commit`;
  - CI check: add `assets/patchmd-ci.yml` to `.github/workflows/`.
  Fill the upstream ref into each. The hook and CI default to advisory.
- **Update flow.** Inject PatchMD's preserve-and-audit step into the fork's
  existing update entry points found in step 2, so the normal update runs
  `update-with-patch-md`. Show the exact edits.

## 5. Apply

After approval:

1. Create root `PATCH.md` from `.agents/patchmd/PATCH.md`. Record the upstream
   repository and branch. Add the approved active entries; leave a short
   "No ... customizations." line where a section is empty.
2. Record the exact verification commands in root `PATCH.md` under
   `Verification`. Do not edit the installed skill files.
3. Apply the approved triggers and update-flow edits, with the upstream ref
   filled in and any hook made executable.
4. Re-read everything you wrote and confirm no placeholders remain.

Do not add a CLI or product code to the fork.

## 6. Report

Report the upstream chosen, entries created, uncertain intent left unresolved,
skills installed, triggers enabled, update entry points wired, and verification
commands. Do not commit or push unless the user asks.
