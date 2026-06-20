# PatchMD

PatchMD is a proposed convention for keeping customized software updatable.

A root `PATCH.md` records the **intent** behind deliberate changes made to a
fork. The code and Git commits remain the implementation. The document gives a
future developer or AI agent enough context to preserve, adapt, or retire those
changes when upstream moves on.

```text
customize -> record intent -> update upstream -> repair if needed -> review
```

PatchMD is a draft proposal, not an established standard or finished product.
It is inspired by [Theo's "A letter to tech CEOs" talk](https://www.youtube.com/watch?v=G1xqTjoihfo),
the predictable-file approach of [AGENTS.md](https://agents.md/), and a working
fork-maintenance workflow first developed in
[gbrain](https://github.com/ElliotDrel/gbrain/commit/2e3053fa000c6e01fc8dc28f0eb4acaa11381c37). An early project-specific
experiment also exists in [T3 Code PR #3146](https://github.com/pingdotgg/t3code/pull/3146).

## The idea

When you customize a fork:

1. Change the application normally and commit the work normally.
2. Add or update a `PATCH.md` entry describing the outcome you intended.
3. Later, update from upstream using normal Git mechanics first.
4. If a patch conflicts or has become obsolete, use its recorded intent to
   repair or retire it.
5. Verify and review the result before pushing or deploying it.

`PATCH.md` is not a diff, lockfile, or substitute for version control. It
explains *why the fork differs* so the implementation can change safely.

## Quick start

From the root of your fork, give your agent either of these prompts.

### Run the installer directly

```text
Read and follow this skill in the current repository:
https://raw.githubusercontent.com/ElliotDrel/PATCH-md/main/skills/install-patch-md/SKILL.md

Use it to install PatchMD in this fork.
```

### Install it as a skill

Install the
[install-patch-md skill](skills/install-patch-md/)
in your agent's skills directory, then run:

```text
Use the install-patch-md skill to add PatchMD to this fork.
```

The installer creates `PATCH.md`, inventories existing customizations, and
adapts the other two repository skills to the fork's upstream and verification
commands:

- `install-patch-md` sets up an existing or new fork.
- `modify-with-patch-md` records intent while making custom changes.
- `update-with-patch-md` safely rebases, repairs, verifies, and reports.

## What belongs in PATCH.md

Record intentional changes to upstream-owned behavior that the fork needs to
keep. Do not record formatting-only edits, generated files, lockfile churn,
environment files, ordinary dependency updates, or unrelated local additions.

Keep entries about outcomes, not old code. One entry may cover several files or
commits when they implement one customization.

## Specification

[SPEC.md](SPEC.md) defines Draft 0.1. The format is intentionally small:

- one root `PATCH.md`;
- one stable ID per customization;
- plain-English intent, rationale, behavior, scope, and reconstruction guidance;
- `active` and `retired` lifecycle states;
- normal Git commits as the implementation record.

See [examples/](examples/) for complete files.

## Design documentation

- [The PatchMD mentality](docs/MENTALITY.md) explains the principles and the
  boundaries behind the standard.
- [Origins and inspiration](docs/ORIGINS.md) traces the idea to
  [Theo Browne (`@t3dotgg`)](https://github.com/t3dotgg), his
  [original video](https://www.youtube.com/watch?v=G1xqTjoihfo&t=1970s), and
  related conventions.
- [The gbrain reference implementation](docs/GBRAIN-REFERENCE.md) documents the
  exact working fork workflow that informed Draft 0.1.

## Status

Draft 0.1 is open for practical feedback from maintainers of private and
downstream forks. Keep proposals simple and grounded in a real maintenance
problem.

## License

MIT
