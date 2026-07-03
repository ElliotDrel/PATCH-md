# Developing PatchMD

PatchMD is intentionally small: a Markdown convention, three lifecycle skills,
one installer, and optional advisory triggers. Add machinery only when a real
fork-maintenance failure demonstrates the need.

## Start here

1. Read `README.md` for the user-facing model.
2. Read `SPEC.md` before changing format or lifecycle requirements.
3. Read the affected skill and its assets before changing behavior.
4. Read the matching tests before editing the installer or triggers.

The standards repository does not contain a root `PATCH.md`; it is not a
downstream fork. The distributable template belongs in `template/PATCH.md`.

## Keep the surfaces aligned

A behavior change may affect several copies of the same contract:

- `SPEC.md`: normative requirements;
- `template/PATCH.md` and `examples/`: record shape and examples;
- `skills/`: agent workflows;
- `skills/install-patch-md/assets/`: optional repository triggers;
- `bin/install.js`: package installation behavior;
- `README.md` and `docs/`: user and maintainer guidance;
- `tests/`: executable checks for the changed behavior.

Update only the surfaces that actually share the changed contract. Search for
the old wording before finishing so one copy does not silently drift.

## Design boundaries

- Code and ordinary Git commits remain the implementation. `PATCH.md` records
  durable intent.
- Entries describe one product outcome, even when several files implement it.
- Temporary fixes may use `Retire when` to make upstream retirement testable.
- Updates preserve dirty work, create a rollback ref, keep exact conflict
  evidence, use upstream as the conflict baseline, verify, and stop before push.
- Installer reruns must not silently replace local changes. `--force` is the
  explicit replacement boundary.
- Installer writes must remain inside the repository. Preserve the linked-parent
  and Git-root checks when changing destination logic.
- Hooks and CI are advisory by default. They should warn accurately without
  blocking unrelated work.

## Validate a change

Run:

```text
npm test
npm pack --dry-run
git diff --check
```

The test suite covers repository shape, installer reruns and overwrite guards,
linked-directory confinement, the pre-commit warning, and the pull-request CI
asset. For installer changes, also install the packed artifact in a temporary
Git repository and confirm both `--version` and a full install.

CI runs the same tests on Ubuntu and Windows. Do not treat a local pass as a
replacement for both jobs because junction and shell behavior differ by
platform.

## Review standard

Challenge requirements before expanding the format. Keep a proposed change when
it prevents realistic data loss, incorrect updates, or repeated maintainer
confusion. Reject speculative fields, duplicate process documents, and
automation that has no verified consumer.

For writing changes, prioritize factual accuracy and executable instructions.
Parallel list grammar and contrastive wording are acceptable when they describe
real distinctions; stylistic pattern matching alone is not a reason to rewrite.

## Releasing

See `docs/RELEASING.md`. A release is complete only when the branch checks pass,
the tag-triggered publish job succeeds, npm reports the new version as `latest`,
and a clean public `npx` installation works.
