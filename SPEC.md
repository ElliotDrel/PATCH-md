# PatchMD Draft 0.2.1

PatchMD is a human- and AI-readable record of the intent behind deliberate
customizations to a downstream software fork.

The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** describe this
draft's requirements.

## File

- The file MUST be named `PATCH.md` and live at the repository root.
- The file MUST be readable as ordinary Markdown without special tooling.
- A repository MUST have at most one authoritative `PATCH.md`.
- The file SHOULD identify the upstream repository and branch.

## Scope

An entry belongs in `PATCH.md` when it describes an intentional change to
upstream-owned behavior that the downstream fork expects to preserve.

The file SHOULD NOT track:

- formatting-only or incidental refactors;
- generated files or dependency lockfiles;
- local environment configuration or secrets;
- ordinary dependency updates;
- additions that upstream cannot overwrite and that need no upgrade handling.

## Entries

Each customization MUST have a stable, human-readable ID. A kebab-case ID such
as `compact-navigation` is recommended. IDs MUST NOT depend on commit hashes or
list positions.

Each entry MUST contain:

- **Status:** `active` or `retired`.
- **Intent:** the user or product outcome being preserved.
- **Why:** why the downstream fork needs the change.
- **Behavior:** observable requirements that should remain true.
- **Scope:** affected files, packages, or subsystems.
- **Reconstruction:** guidance and constraints for implementing the intent on
  newer upstream code.

An entry MAY include implementation notes and links to commits, issues, or
upstream pull requests. It SHOULD NOT contain a full source patch. One entry MAY
cover multiple files or commits when they serve one intent.

## Lifecycle

### Record

Downstream code MUST remain in ordinary Git commits. The matching `PATCH.md`
entry SHOULD be added or refreshed in the same logical change.

A fork SHOULD make recording reliable by wiring reminders into its own
workflow — for example agent instructions, a pre-commit warning, or a CI
check — so that changing upstream-owned code without recording intent is
surfaced rather than silent.

### Update

An update process MUST:

1. refuse to discard uncommitted work;
2. create a recoverable reference before rewriting history;
3. try normal Git integration before reconstructing code;
4. preserve displaced downstream content before resolving a conflict;
5. prefer the new upstream version when a conflict cannot be resolved safely;
6. verify the resulting repository with its own checks;
7. make no push or deployment without user approval.

The update process MAY be wired into the fork's existing upgrade entry points so
these guarantees run as part of the normal update.

### Resolve

When mechanical integration is insufficient, a developer or agent SHOULD
compare the new upstream implementation, the previous downstream
implementation, and the matching `PATCH.md` intent.

It MUST reconstruct intent rather than blindly restore old text. Ambiguous work
MUST be shown to the user instead of guessed.

### Retire

When upstream satisfies an intent or the customization is abandoned, its entry
MUST be marked `retired` rather than deleted. The reason and relevant upstream
reference SHOULD be recorded.

## Review

The user MUST be told which customizations were preserved, changed, retired, or
left unresolved. The result MUST be reviewed before it is pushed, deployed, or
otherwise adopted.

## Compatibility

PatchMD does not require a specific agent, package manager, programming
language, or upgrade program. Tools MAY automate this lifecycle if they preserve
the guarantees above.
