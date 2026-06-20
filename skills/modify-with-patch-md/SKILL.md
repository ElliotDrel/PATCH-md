---
name: modify-with-patch-md
description: Make deliberate downstream changes to a PatchMD-managed software fork while preserving their intent. Use whenever a user asks to customize, modify, fix, or add behavior to upstream-owned code in a repository containing PATCH.md.
---

# Modify with PatchMD

Make the requested change normally and keep its intent durable.

## 1. Establish scope

1. Read repository instructions and root `PATCH.md`.
2. Confirm the requested behavior is a deliberate downstream customization.
3. Reuse an existing entry when the request changes the same intent; otherwise
   choose a stable kebab-case ID.

Do not create entries for formatting, generated files, lockfile churn,
environment configuration, ordinary dependency updates, or unrelated additions
that upstream cannot overwrite.

## 2. Implement and record

Implement the customization using the repository's existing architecture. Add
or update one feature-centered PATCH.md entry containing:

- Status;
- Intent;
- Why;
- Behavior;
- Scope;
- Reconstruction;
- optional references.

Describe outcomes and constraints, not a copy of the code. One entry may cover
multiple files or commits when they serve one intent.

## 3. Verify

Run the repository's configured checks. Re-read the diff and PATCH.md entry to
ensure they describe the same behavior. Fix failures caused by the change.

## 4. Commit and report

When commits are authorized, keep the implementation and PATCH.md update in the
same logical commit. Otherwise leave both ready for the user's normal commit
workflow. Never push without explicit approval.

Report the behavior changed, PATCH.md entry created or refreshed, checks run,
and any unresolved ambiguity.
