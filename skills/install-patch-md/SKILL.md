---
name: install-patch-md
description: Add PatchMD to a new or existing downstream software fork. Use when a user asks to install, initialize, set up, or adopt PATCH.md; inventory existing fork customizations; or create repository-specific PatchMD modification and update skills.
---

# Install PatchMD

Set up PatchMD without inventing intent or changing product code.

## 1. Inspect the fork

1. Read the repository's agent instructions and documentation.
2. Confirm the repository root, current branch, and working-tree status.
3. Inspect remotes and branch tracking. Identify the canonical upstream
   repository and branch; ask only when the evidence is ambiguous.
4. Find the merge base and inspect downstream commits and diffs.
5. Discover the repository's normal install, test, typecheck, build, and smoke
   commands.

Do not modify files yet.

## 2. Propose the record

Group existing downstream changes by user or product intent, not by file or
commit. For each proposed entry, show:

- stable kebab-case ID;
- intent and rationale;
- observable behavior;
- affected scope;
- reconstruction guidance;
- supporting commits or issues when useful.

Mark uncertain groupings explicitly. Never infer business intent from a diff
alone. Ask the user to correct or approve the proposal before writing it.

## 3. Install

After approval:

1. Create root `PATCH.md` using the PatchMD Draft 0.1 format.
2. Record the upstream repository and branch.
3. Add the approved active entries. Use empty active and retired sections when
   the fork has no recorded customizations.
4. Copy the sibling `modify-with-patch-md` and `update-with-patch-md` skill
   folders from the PatchMD distribution into the target's chosen skills
   collection if they are not already there. Keep one canonical copy of each.
5. Add a short project configuration section to both installed skills with the
   discovered upstream ref and exact verification commands. Do not rewrite the
   generic workflow.
6. Validate both skills and re-read the resulting files for placeholders.

Do not add agent-vendor adapters, a CLI, hooks, or product code.

## 4. Report

Report the upstream chosen, entries created, uncertain intent left unresolved,
skills installed or adapted, and verification commands configured. Do not
commit or push unless the user explicitly asks.
