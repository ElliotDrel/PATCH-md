---
name: modify-with-patch-md
description: Make a deliberate downstream change to a PatchMD-managed fork while recording its intent. Use whenever the user asks to customize, modify, fix, patch, or add behavior to upstream-owned code in a repository that contains a root PATCH.md, or when a PatchMD pre-commit warning or CI check flags an unrecorded change.
---

# Modify with PatchMD

Make the requested change normally and keep its intent durable. This is the
skill PatchMD's triggers point to: when the agent-instructions note, the
pre-commit warning, or the CI check asks you to record intent, run this.

## 1. Establish scope

1. Read the repository instructions and root `PATCH.md`.
2. Confirm the requested behavior is a deliberate downstream customization, not
   a fix you would send upstream.
3. Reuse the existing entry when the request changes the same intent. Otherwise
   choose a new stable kebab-case ID.

Do not create entries for formatting, generated files, lockfile churn,
environment configuration, ordinary dependency updates, or unrelated additions
that upstream cannot overwrite.

## 2. Implement and record

Implement the customization using the fork's existing architecture. Add or
update one feature-centered `PATCH.md` entry containing:

- **Status**
- **Intent**
- **Why**
- **Behavior**
- **Scope**
- **Reconstruction**
- optional **References**

Describe outcomes and constraints, not a copy of the code. One entry may cover
multiple files or commits when they serve one intent.

## 3. Verify

Run the commands in root `PATCH.md`'s `Verification` section. Re-read the diff
and the `PATCH.md` entry to confirm they describe the same behavior. Fix
failures caused by your change.

## 4. Commit and report

When commits are authorized, keep the implementation and the `PATCH.md` update
in the same logical commit so the triggers stay satisfied. Otherwise leave both
staged for the user's normal commit workflow. Never push without approval.

Report the behavior changed, the `PATCH.md` entry created or refreshed, the
checks run, and any unresolved ambiguity.
