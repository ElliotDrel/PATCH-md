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
It is inspired by [Theo's PatchMD proposal](https://www.youtube.com/watch?v=G1xqTjoihfo),
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

Copy [template/PATCH.md](template/PATCH.md) to the root of a downstream fork,
fill in its upstream repository, and record each intentional customization.

For agent-assisted use, make the three skills in [skills/](skills/) available
to your agent:

- `install-patch-md` sets up an existing or new fork.
- `modify-with-patch-md` records intent while making custom changes.
- `update-with-patch-md` safely rebases, repairs, verifies, and reports.

Start with:

```text
Use install-patch-md to add PatchMD to this fork.
```

The installer adapts the other two skills to the repository's upstream and
verification commands.

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

## Status

Draft 0.1 is open for practical feedback from maintainers of private and
downstream forks. Keep proposals simple and grounded in a real maintenance
problem.

## License

MIT
