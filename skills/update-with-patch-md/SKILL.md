---
name: update-with-patch-md
description: Update a PatchMD-managed downstream fork from its configured upstream without losing custom intent. Use when a user asks to update, upgrade, rebase, sync, resolve upstream conflicts, reapply customizations, or retire patches in a repository containing PATCH.md.
---

# Update with PatchMD

Replay ordinary fork commits on new upstream code, preserve anything displaced,
and use PATCH.md only when Git cannot safely finish the job.

## Hard rules

1. Never discard uncommitted work.
2. Create a recoverable Git ref before rewriting history.
3. Preserve conflicted downstream files as exact bytes before choosing upstream.
4. Reapply intent, not old text.
5. Ask before reconstructing, retiring, pushing, or deploying.
6. Roll back when required verification fails.

## 1. Preflight

Read repository instructions and `PATCH.md`. Confirm:

- repository root and current branch;
- a clean working tree;
- the upstream remote and branch;
- active customization entries;
- project verification commands.

Fetch upstream. If there are no new upstream commits, report that and stop.

Create `backup/pre-patchmd-update-<timestamp>` at the current HEAD. Record its
exact name. Do not continue if the ref cannot be created.

## 2. Rebase

Rebase the downstream commits onto upstream.

If commits replay cleanly, continue to the intent audit. Git may skip patches
that upstream already contains.

For each content conflict:

1. Record `REBASE_HEAD`, its subject, and every unmerged path.
2. Save the pre-update version from the backup ref to a timestamped backup
   directory outside the worktree. Use a binary-safe method that preserves the
   exact Git blob bytes.
3. Keep the rebased side for the conflicted path. During a rebase this is the
   upstream base plus patches already replayed.
4. Continue the rebase, or skip the commit if keeping upstream makes it empty.
5. Repeat until the rebase finishes.

Write a small manifest containing the repository root, upstream ref, backup ref,
conflicted path, original patch commit, subject, and backup path. On an
unsupported rebase state, abort and restore the backup ref.

## 3. Audit intent

Review every active PATCH.md entry against the new upstream code, including
entries whose commits replayed cleanly. Classify each as:

- preserved;
- already satisfied upstream;
- needs reconstruction;
- ambiguous.

Show the evidence and ask for approval before changing code or retiring an
entry. Honor partial approval.

For approved reconstruction, compare the new code, backed-up code, PATCH.md
intent, and original commit. Implement the intent using the new architecture.
If upstream fully satisfies it, remove redundant downstream behavior safely and
mark the entry `retired` with the upstream reference. Never guess.

## 4. Verify or roll back

Run the configured install and verification commands. If a required check fails:

1. abort any active rebase;
2. reset the working branch to the recorded backup ref;
3. restore dependencies when the repository requires it;
4. report the failure and exact recovery locations.

Do not delete the backup ref or backup files automatically.

## 5. Review

Report upstream commits received, downstream commits replayed or skipped,
customizations preserved, reconstructed, retired, or unresolved, verification
results, backup locations, and the resulting branch state. Stop before push or
deployment unless the user explicitly approves it.
