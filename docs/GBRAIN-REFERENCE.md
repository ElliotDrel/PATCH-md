# The gbrain reference implementation

PatchMD Draft 0.1 was informed by a working safe-upgrade flow built in Elliot
Drel's gbrain fork before this repository existed.

This document describes the implementation at commit
[`2e3053f`](https://github.com/ElliotDrel/gbrain/commit/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37).
The commit is the stable reference because the original feature branch is no
longer published.

## The problem it solved

The gbrain fork carried ordinary local commits on top of upstream. Some were
permanent personal customizations; others were bug fixes that could eventually
become unnecessary when upstream fixed the same problem.

The old `git pull --ff-only` upgrade path could not update a branch with local
commits. A normal conflict also left the operator deciding between two code
versions without a durable statement of what the downstream version was meant
to accomplish.

The solution combined three pieces:

1. [`PATCH.md`](https://github.com/ElliotDrel/gbrain/blob/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37/PATCH.md)
   recorded local intent.
2. [`upgrade-bunlink.ts`](https://github.com/ElliotDrel/gbrain/blob/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37/src/commands/upgrade-bunlink.ts)
   performed a recoverable, upstream-first rebase.
3. [`upgrade-resolve`](https://github.com/ElliotDrel/gbrain/blob/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37/skills/upgrade-resolve/SKILL.md)
   guided an agent through user-approved semantic reconstruction.

## The gbrain PATCH.md format

The file deliberately excluded OpenClaw-local additions that gbrain upgrades
could not overwrite. It recorded only changes to gbrain-owned files.

Each entry used:

- **Change:** the behavior that changed;
- **Edit made:** the current implementation shape;
- **Why:** the reason the fork needed it;
- **How to recreate:** guidance for rebuilding it after an update;
- optional **Status:** such as `retired`.

Entries could be detailed because they captured real operational knowledge,
including failed approaches and invariants that a future agent must not break.
They contained intent and reconstruction guidance, not source-code dumps.

## Making a customization

The fork's safe-change protocol was simple:

1. Make the change on the fork's normal branch.
2. Commit it normally; never rely on an uncommitted local patch.
3. Add or refresh the corresponding `PATCH.md` entry in the same logical unit.
4. Mark upstreamed or abandoned entries retired instead of deleting them.

The fork could remain many commits ahead of upstream. PatchMD did not replace
or flatten that history.

## Running an update

For a source-linked installation, `gbrain upgrade` called the dedicated upgrade
function instead of `git pull --ff-only`. The flow was:

1. Resolve the current branch's configured upstream.
2. Fetch its remote.
3. Count new upstream commits; stop if already current.
4. Refuse to continue with a dirty working tree.
5. Create `backup/pre-upgrade-<timestamp>` at the original HEAD.
6. Rebase local commits onto upstream.
7. Let commits that apply cleanly replay normally.
8. Handle each conflicting commit in a guarded loop.
9. Capture `REBASE_HEAD`, its subject, and every unmerged path.
10. Read the previous downstream file from the backup ref as exact Git blob
    bytes and save it under `~/.gbrain/upgrade-backups/<id>/`.
11. Keep the rebased side for the conflicted path. During a rebase, this is the
    new upstream base plus downstream commits already replayed.
12. Continue the rebase, or skip the patch commit if it became empty.
13. Write `manifest.json` with the repo root, upstream, rollback ref, original
    patch commit, subject, conflicted path, and backup path.
14. Abort and reset to the backup ref if an unsupported state or fatal error
    occurs.

The surrounding
[`upgrade.ts`](https://github.com/ElliotDrel/gbrain/blob/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37/src/commands/upgrade.ts)
then ran `bun install`, the typecheck, and a `gbrain --version` smoke test. A
failed verification triggered a hard reset to the pre-upgrade backup ref and a
dependency reinstall.

The behavior was covered by
[`upgrade-bunlink.serial.test.ts`](https://github.com/ElliotDrel/gbrain/blob/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37/test/upgrade-bunlink.serial.test.ts),
including dirty trees, clean replay, exact-byte backups, upstream deletion,
empty conflicting commits, mixed clean/conflicting commits, and rollback refs.

## Resolving displaced patches

When conflicts occurred, the upgrade finished with upstream's version in place
and pointed the operator to the resolver skill. The resolver did not run
unattended.

For each conflicted file it presented:

- the current upstream-based file;
- the exact backed-up downstream file;
- the original patch commit and subject;
- the matching `PATCH.md` entry.

After user approval, the agent rebuilt the intent on the new architecture. It
did not paste the old file over upstream. If upstream already satisfied the
intent, the agent skipped reconstruction and retired the entry. Ambiguous files
were reported rather than guessed.

The result was verified, committed as ordinary fork work, and reported with its
rollback branch and backup directory.

## What gbrain proved

The implementation demonstrated that the PatchMD idea can work without a new
version-control system:

- normal commits remain the implementation;
- most commits replay without agent involvement;
- upstream can be the safe default during conflict;
- exact old bytes and a rollback ref make reconstruction recoverable;
- plain-English intent gives an agent information that a diff cannot;
- temporary patches can disappear cleanly when upstream absorbs them.

## What Draft 0.1 generalized

The gbrain file was specific to one product and often organized entries around
files. The generic standard changed the durable unit to a stable customization
ID with explicit intent, behavior, scope, and reconstruction fields.

The standard also separates required outcomes from implementation details. A
tool does not have to use Bun, TypeScript, gbrain's backup directory, or its
exact command names. It must preserve the same safety properties: no lost dirty
work, a recovery point, preserved conflict evidence, intent-aware resolution,
verification, and user review before adoption.
