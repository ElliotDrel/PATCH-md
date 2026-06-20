# The PatchMD mentality

PatchMD exists because AI has made software customization much cheaper, but it
has not made long-lived forks cheap to maintain.

The difficult part is rarely making the first change. The difficult part is
understanding what that change was *for* months later, after upstream has moved,
the original code no longer exists, and the person or agent performing the
update was not present for the original decision.

PatchMD preserves that missing context.

## The two sources of truth

A PatchMD-managed fork has two complementary records:

- **The code and Git commits** record what the fork currently does.
- **`PATCH.md`** records why the fork intentionally differs from upstream and
  what outcome must survive.

`PATCH.md` does not replace Git. Git is good at storing and replaying exact
changes. PatchMD gives a developer or agent the semantic context needed when
the exact old change no longer fits the new code.

## Principles

### Intent is more durable than implementation

Files move. APIs change. Components are rewritten. A customization such as
"restore an unsaved draft after refresh" can remain valid even when every line
of its implementation has changed.

Record the desired outcome, observable behavior, rationale, and important
constraints. Do not preserve an obsolete code snippet as if it were the goal.

### Use normal Git first

Most upstream updates should not need AI. Fetch and integrate upstream using
ordinary Git mechanics. Let clean downstream commits replay cleanly.

Bring in an agent only for the semantic work Git cannot do: determining whether
an intent is already satisfied, reconstructing it on a new architecture, or
explaining why it is now ambiguous.

### Fork changes remain ordinary commits

PatchMD does not require a special patch branch, commit format, or custom
version-control system. The maintainer commits to the fork normally and can be
dozens or hundreds of commits ahead of upstream.

The matching PatchMD entry should be updated in the same logical unit so the
code and its reason do not drift apart.

### Prefer upstream during uncertainty

When a rebase conflicts, the new upstream implementation is the safest initial
baseline. Preserve the previous downstream bytes and a rollback ref before
choosing it. Then use the recorded intent to decide whether anything needs to
be rebuilt.

This prevents stale downstream code from silently replacing new upstream
behavior while keeping everything needed for recovery.

### Reconstruct intent, not text

A resolver should compare three things:

1. the new upstream implementation;
2. the previous downstream implementation;
3. the `PATCH.md` entry describing the intended outcome.

Blindly copying the old file over the new one defeats the purpose. If the new
architecture cannot support the intent confidently, stop and ask.

### The user controls adoption

An update is not complete merely because Git exits successfully. The result
must pass the fork's real verification commands, and the user must be told what
was preserved, changed, retired, or left unresolved.

PatchMD tooling must not push, deploy, force-push, or delete recovery data
without approval.

### Retirement is success

Some downstream patches are temporary fixes. When upstream solves the same
problem, the correct outcome is to remove the redundant downstream behavior and
mark the entry `retired`.

Do not delete the entry. Its history explains why old commits disappeared and
prevents a future maintainer from recreating an obsolete patch.

### Keep the standard small

The format must remain useful as plain Markdown. A repository needs one root
file, a small set of required fields, and no special parser.

Automation may grow around PatchMD, but the standard should not require a
specific agent, package manager, programming language, or hosted service.

## What belongs in PATCH.md

Record a change when all three are true:

1. it deliberately changes upstream-owned behavior;
2. the fork expects that behavior to survive future updates;
3. a future update could overwrite, conflict with, or obsolete it.

Do not record incidental formatting, generated files, lockfile churn,
environment configuration, ordinary dependency updates, or additions that are
independent of upstream and need no reconciliation.

## The test for every design decision

When considering a new field, tool, or workflow, ask:

> Does this help a future maintainer understand and safely preserve an intended
> customization after upstream changes?

If not, it probably does not belong in PatchMD.
