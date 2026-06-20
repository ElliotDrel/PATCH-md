---
name: install-patch-md
description: Add PatchMD to a new or existing downstream software fork. Use when the user asks to install, initialize, set up, or adopt PATCH.md; to inventory an existing fork's customizations; or to install the companion modify and update skills into this repository.
---

# Install PatchMD

Set up PatchMD without inventing intent or changing product code.

## 1. Inspect the fork

1. Read the repository's agent instructions (`CLAUDE.md`, `AGENTS.md`, `README`) and any docs.
2. Confirm the repository root, current branch, and working-tree status.
3. Inspect remotes and branch tracking. Identify the canonical upstream
   repository and branch. Ask only when the evidence is ambiguous.
4. Find the merge base with upstream and inspect the downstream commits and
   diffs that diverge from it.
5. Discover the repository's normal install, test, typecheck, build, and smoke
   commands.

Do not modify files yet.

## 2. Propose the record

Group existing downstream changes by user or product intent, not by file or
commit. For each proposed entry, show:

- a stable kebab-case ID;
- intent and rationale;
- observable behavior;
- affected scope;
- reconstruction guidance;
- supporting commits or issues when useful.

Mark uncertain groupings explicitly. Never infer business intent from a diff
alone. Ask the user to correct or approve the proposal before writing it.

## 3. Install

After approval:

1. Create root `PATCH.md` using the PatchMD Draft 0.1 format. Base it on
   `template/PATCH.md` from this skill's repository.
2. Record the upstream repository and branch.
3. Add the approved active entries. Leave the active and retired sections empty
   (with a short "No ... customizations." line) when the fork has none.
4. Install the companion `modify-with-patch-md` and `update-with-patch-md`
   skills into the fork. Copy each skill folder into `.claude/skills/<name>/`
   for project scope, or `~/.claude/skills/<name>/` for personal scope. Keep one
   canonical copy of each.
5. Append a short "Project configuration" section to both installed skills
   recording the discovered upstream ref and the exact verification commands.
   Do not rewrite their generic workflow.
6. Re-read every file you wrote and confirm no template placeholders remain.

Do not add a CLI, hooks, or product code.

## 4. Report

Report the upstream chosen, entries created, uncertain intent left unresolved,
skills installed or adapted, and verification commands configured. Do not
commit or push unless the user explicitly asks.
