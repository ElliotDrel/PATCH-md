# Releasing patch.md-intent

This repository publishes `patch.md-intent` to npm from
`.github/workflows/release.yml`. A pushed `v*` tag starts the workflow; npm
authenticates that GitHub Actions job through OIDC trusted publishing. No
`NPM_TOKEN` is stored in GitHub.

## One-time npm configuration

On npmjs.com, open `patch.md-intent` → Settings → Trusted Publisher and configure:

- Provider: GitHub Actions
- Organization/user: `ElliotDrel`
- Repository: `PATCH-md`
- Workflow filename: `release.yml`
- Environment: none
- Allowed action: `npm publish`

Names are case-sensitive. The package's `repository.url` must also match the
GitHub repository. npm validates this binding only when a publish runs, so a
saved configuration is not proof that it is correct.

The workflow must run on a GitHub-hosted runner and retain:

```yaml
permissions:
  id-token: write
  contents: read
```

See npm's [trusted-publisher documentation](https://docs.npmjs.com/trusted-publishers/)
for the registry-side requirements.

## Why the workflow uses Node 24

npm trusted publishing requires npm 11.5.1 or newer and Node 22.14.0 or newer.
The workflow pins Node 24 because its bundled npm satisfied that requirement in
the verified release and needed no separate npm upgrade step.

An earlier Node 22 run reached `npm publish`, generated package output, then
failed with a registry `404 Not Found` on the package PUT. npm had not completed
the OIDC exchange and fell back to an unauthenticated request. Moving the job to
Node 24 fixed the release without adding a token.

Do not diagnose this failure with `npm whoami`: OIDC credentials exist only
during the publish operation, so `whoami` does not report trusted-publisher
status.

## What the workflow does

The release workflow:

1. Starts when a tag matching `v*` is pushed.
2. Checks out without persisting Git credentials.
3. Sets up Node 24 and the public npm registry.
4. Rejects a tag whose name does not equal `package.json`'s version.
5. Runs `npm test`.
6. Runs `npm publish --access public`.

Trusted publishing automatically attaches npm provenance for this public package
and repository; the workflow does not need a `--provenance` flag.

The workflow has one shared concurrency group with cancellation enabled. Push
one release tag at a time and wait for its job to finish before pushing another,
or the newer run can cancel the earlier one.

## Preflight

Before creating a tag:

1. Confirm the working tree is clean.
2. Confirm `main` contains every intended release commit.
3. Set a new, unpublished version in `package.json`.
4. Update versioned README links when they point at the release tag.
5. Run:

   ```text
   npm test
   npm pack --dry-run
   git diff --check
   ```

6. Push `main` and wait for both Ubuntu and Windows validation jobs.
7. Confirm the tag does not already exist locally, on GitHub, or as an npm
   version.

npm versions are immutable. Never reuse a version that the registry has already
published.

## Publish

Create an annotated tag on the verified release commit and push it:

```text
git tag -a vX.Y.Z -m "PatchMD Draft X.Y.Z"
git push origin vX.Y.Z
```

Monitor the publish workflow:

```text
gh run list --workflow release.yml --limit 3
gh run watch <run-id> --exit-status
```

Do not create the GitHub Release until npm publishing succeeds. The tag push is
the npm trigger; creating a GitHub Release is a separate presentation step.

## Verify the public artifact

Check the registry rather than relying only on the green Actions job:

```text
npm view patch.md-intent@X.Y.Z version
npm view patch.md-intent version dist-tags time --json
```

Then test the public tarball through the actual user path in a temporary Git
repository:

```text
mkdir patchmd-release-check
cd patchmd-release-check
git init
npx --yes patch.md-intent@X.Y.Z --version
npx --yes patch.md-intent@X.Y.Z
```

Confirm that `.agents/skills/install-patch-md/SKILL.md` exists, then delete the
temporary directory.

Finally create the GitHub Release:

```text
gh release create vX.Y.Z --title "PatchMD Draft X.Y.Z" --notes "<release notes>"
```

A release is complete only when all of these agree:

- `main` contains the release commit;
- the tag resolves to that commit;
- branch validation passed on Ubuntu and Windows;
- the tag-triggered publish workflow passed;
- npm reports the version and `latest` tag;
- a clean public `npx` install succeeds;
- the GitHub Release exists.

## Moving a bad tag

Move a tag only when npm has not published that version. Delete it locally and
remotely, recreate it on the correct commit, and push it again:

```text
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z
git tag -a vX.Y.Z <correct-commit-sha> -m "PatchMD Draft X.Y.Z"
git push origin vX.Y.Z
```

If npm already contains the version, leave the tag in place, fix forward with a
new version, and publish a new tag.

## Troubleshooting

### Publish fails with 404 or authentication errors

Check, in order:

1. Node and npm versions in the workflow logs; npm must be 11.5.1 or newer.
2. `id-token: write` permission.
3. GitHub-hosted runner usage.
4. Exact npm Trusted Publisher owner, repository, workflow filename, and allowed
   action.
5. Exact `repository.url` in `package.json`.
6. Whether the version already exists on npm.

### No publish workflow starts

Confirm that the tag was pushed to `origin`, matches `v*`, and contains the
workflow file. The workflow runs from the tagged commit, not from whatever is
currently on `main`.

### Tag/version verification fails

The tag must be exactly `v` plus the `package.json` version. A package version
of `0.2.1` requires tag `v0.2.1`.

### Actions is green but npm still shows the old release

Query the exact version first, then `dist-tags`. Registry propagation can lag
briefly. If the exact version is absent, inspect the publish step rather than
assuming the job uploaded it.

## Verified release: 0.2.1

On 2026-07-03, the successful release followed this sequence:

1. `main` was pushed at commit `ca7be2c`.
2. The `Validate` workflow passed on Ubuntu and Windows.
3. Annotated tag `v0.2.1` was pushed.
4. `Publish to npm` ran on Node 24, passed tests, and published successfully.
5. npm reported `0.2.1` as both the exact version and `latest`.
6. A fresh `npx --yes patch.md-intent@0.2.1` installation created all three
   skills and the template in a temporary Git repository.
7. GitHub Release `v0.2.1` was created after registry verification.

This sequence is the known-good baseline for the next release.
