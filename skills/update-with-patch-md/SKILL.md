---
name: update-with-patch-md
description: Update a PatchMD-managed downstream fork from its configured upstream without losing custom intent. Use when the user asks to update, upgrade, rebase, sync, pull upstream, resolve upstream conflicts, reapply customizations, or retire patches in a repository that contains a root PATCH.md.
---

# Update with PatchMD

Replay ordinary fork commits on new upstream code, preserve anything displaced,
and use `PATCH.md` only when Git cannot safely finish the job.

## Hard rules

1. Never discard uncommitted work.
2. Create a recoverable Git ref before rewriting history.
3. Preserve conflicted downstream files as exact Git blob bytes before choosing
   upstream.
4. Reapply intent, not old text.
5. Ask before reconstructing, retiring, pushing, or deploying.
6. Roll back when required verification fails.

## 1. Preflight

Read the repository instructions and `PATCH.md`. Confirm:

- the repository root and current branch;
- a clean working tree (stop if it is dirty — see hard rule 1);
- the upstream remote and branch;
- the active customization entries;
- the project verification commands (see the Project configuration section
  below if present).

Fetch upstream. If there are no new upstream commits, report that and stop.

Create `backup/pre-patchmd-update-<timestamp>` at the current HEAD and record
its exact name. Do not continue if the ref cannot be created.

## 2. Rebase

Rebase the downstream commits onto upstream.

If commits replay cleanly, continue to the intent audit. Git may skip patches
that upstream already contains.

For each content conflict:

1. Record `REBASE_HEAD`, its subject, and every unmerged path.
2. Save the pre-update version from the backup ref to a timestamped backup
   directory outside the worktree, using a binary-safe method (for example
   `git cat-file` into a file) that preserves the exact Git blob bytes.
3. Keep the rebased side for the conflicted path (`--theirs` during rebase is
   the original downstream patch; `--ours` is the upstream base plus patches
   already replayed). Prefer upstream — `--ours` — when the conflict cannot be
   resolved safely.
4. Continue the rebase, or skip the commit if keeping upstream makes it empty.
5. Repeat until the rebase finishes.

Write a small manifest containing the repository root, upstream ref, backup ref,
each conflicted path, the original patch commit and subject, and the backup
path. On an unsupported rebase state, abort and restore the backup ref.

## 3. Audit intent

Review every active `PATCH.md` entry against the new upstream code, including
entries whose commits replayed cleanly. Classify each as:

- preserved;
- already satisfied upstream;
- needs reconstruction;
- ambiguous.

Show the evidence and ask for approval before changing code or retiring an
entry. Honor partial approval.

For approved reconstruction, compare the new code, the backed-up code, the
`PATCH.md` intent, and the original commit. Implement the intent using the new
architecture. If upstream fully satisfies it, remove the redundant downstream
behavior safely and mark the entry `retired` with the upstream reference. Never
guess.

## 4. Verify or roll back

Run the configured install and verification commands. If a required check
fails:

1. abort any active rebase;
2. reset the working branch to the recorded backup ref;
3. restore dependencies when the repository requires it;
4. report the failure and the exact recovery locations.

Do not delete the backup ref or backup files automatically.

## 5. Review

Report the upstream commits received, downstream commits replayed or skipped,
customizations preserved, reconstructed, retired, or left unresolved, the
verification results, the backup locations, and the resulting branch state.
Stop before push or deployment unless the user explicitly approves it.
