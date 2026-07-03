# PatchMD

PatchMD is a draft convention for keeping customized software updatable.

A root `PATCH.md` records the **intent** behind deliberate changes made to a
fork. The code and Git commits remain the implementation. The document gives a
future developer or AI agent enough context to preserve, adapt, or retire those
changes when upstream moves on.

```text
customize -> record intent -> update upstream -> repair if needed -> review
```

PatchMD is a proposal, not an established standard.
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

Run this from the root of your fork. Either path ends the same way: the
`install-patch-md` skill sets PatchMD up.

### Point your agent at the skill

The skill installs itself first, then runs. Give your agent this prompt:

```text
Read and follow this skill, then set up PatchMD in this repo:
https://raw.githubusercontent.com/ElliotDrel/PATCH-md/v0.2.0/skills/install-patch-md/SKILL.md
```

If the skills are already in the repo, this is all you need:

```text
Use the install-patch-md skill to set up PatchMD in this repo.
```

### Or install the files with npm first

```text
npx patch.md-intent
```

This copies the three skills into `.agents/skills/` (symlinked into
`.claude/skills/`) and drops the template in, then tells you to run the setup
skill.

### What the skills do

- `install-patch-md` installs the skill files, creates `PATCH.md`, inventories
  existing customizations, and — with your approval — wires PatchMD into how the
  fork already commits and updates.
- `modify-with-patch-md` records intent while making custom changes.
- `update-with-patch-md` rebases onto upstream, resolves conflicts from recorded
  intent, verifies, and reports.

Install can also set up optional triggers — agent instructions, a pre-commit
warning, and a CI check — so a change to upstream-owned code without a `PATCH.md`
update is surfaced instead of slipping through.

## What belongs in PATCH.md

Record intentional changes to upstream-owned behavior that the fork needs to
keep. Do not record formatting-only edits, generated files, lockfile churn,
environment files, ordinary dependency updates, or unrelated local additions.

Keep entries about outcomes, not old code. One entry may cover several files or
commits when they implement one customization.

## Specification

[SPEC.md](SPEC.md) defines Draft 0.2. The format is intentionally small:

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
  exact working fork workflow that informed the first draft.

## Status

Draft 0.2 is open for practical feedback from people maintaining downstream
forks. The format will change only when real use exposes a problem.

## License

MIT
