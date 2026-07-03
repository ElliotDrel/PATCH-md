---
name: update-with-patch-md
description: Update a PatchMD-managed downstream fork from its configured upstream without losing custom intent. Use when the user asks to update, upgrade, rebase, sync, pull upstream, resolve upstream conflicts, reapply customizations, or retire patches in a repository that contains a root PATCH.md.
---

# Update with PatchMD

Rebase ordinary fork commits onto new upstream code, resolve conflicts with
`PATCH.md` intent, preserve anything displaced, and verify before handing back.

## Hard rules

1. Never discard uncommitted work.
2. Create a recoverable Git ref before rewriting history.
3. Preserve conflicted downstream files as exact Git blob bytes before choosing
   upstream.
4. Reapply intent, not old text.
5. Ask before reconstructing, retiring, pushing, or deploying.
6. Roll back when required verification fails.

## Plan

State the default plan to the user before touching the repository: back up,
rebase the fork's commits onto upstream, resolve each conflict using `PATCH.md`
intent, audit every active entry, verify, and report. Ask whether it fits the
fork and how to make it frictionless — which conflicts to prefer upstream on,
what to verify, and whether to run inside an existing update entry point. Follow
any update flow that install wired in. Honor the answers; keep the hard rules.

## 1. Preflight

Read the repository instructions and `PATCH.md`. Confirm the repository root and
branch, a clean working tree (stop if dirty — hard rule 1), the upstream remote
and branch, the active entries, and the commands in root `PATCH.md`'s
`Verification` section.

Fetch upstream. If there are no new upstream commits, report that and stop.
Create `backup/pre-patchmd-update-<timestamp>` at HEAD and record its exact
name. Do not continue if the ref cannot be created.

## 2. Rebase

Rebase the downstream commits onto upstream. If they replay cleanly, continue to
the audit; Git may skip patches upstream already contains.

For each content conflict:

1. Record `REBASE_HEAD`, its subject, and every unmerged path.
2. Check whether the path exists in the backup ref before writing its blob. If
   it exists, save its exact bytes outside the worktree with `git cat-file`. If
   downstream deleted it, write no file and record that deletion in the
   manifest. Never treat a failed command or empty redirect as a valid backup.
3. After the backup, keep the upstream-based side with `--ours` as the safe
   baseline. Preserve the downstream intent for the audit instead of restoring
   old text during the rebase. (`--theirs` is the downstream patch.)
4. Continue the rebase, or skip the commit if keeping upstream makes it empty.
5. Repeat until the rebase finishes.

Write a small manifest with the repository root, upstream ref, backup ref, each
conflicted path, the original patch commit and subject, and the backup path. On
an unsupported rebase state, abort and restore the backup ref.

## 3. Audit intent

Review every active `PATCH.md` entry against the new upstream code, including
entries that replayed cleanly. Classify each as preserved, already satisfied
upstream, needs reconstruction, or ambiguous.

Show the evidence and ask for approval before changing code or retiring an
entry. Honor partial approval. For approved reconstruction, compare the new
code, the backed-up code, the `PATCH.md` intent, and the original commit, then
implement the intent on the new architecture. If upstream fully satisfies it,
remove the redundant downstream behavior safely and mark the entry `retired`
with the upstream reference. Never guess.

## 4. Verify or roll back

Run the configured install and verification commands. If a required check fails:
abort any active rebase, reset the working branch to the recorded backup ref,
restore dependencies if needed, and report the failure and exact recovery
locations. Do not delete the backup ref or backup files automatically.

## 5. Review

Report the upstream commits received, downstream commits replayed or skipped,
customizations preserved, reconstructed, retired, or left unresolved, the
verification results, the backup locations, and the resulting branch state.
Stop before push or deployment unless the user explicitly approves it. Because
the rebase rewrote history, re-fetch the tracking remote and use
`--force-with-lease`, never `--force`; stop if the lease fails.
