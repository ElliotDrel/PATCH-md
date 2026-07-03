# Releasing patch.md-intent

This repository publishes to npm as `patch.md-intent` using npm's
**trusted publishing**: `.github/workflows/release.yml` authenticates to the
registry via GitHub Actions OIDC instead of a stored `NPM_TOKEN` secret.

## How trusted publishing works

A conventional publish workflow needs a long-lived npm token saved as a
GitHub secret. Trusted publishing replaces that with a per-run handshake:

1. GitHub Actions issues the job a short-lived OIDC token, unlocked by
   `permissions: id-token: write` in the workflow.
2. That token asserts which repository, workflow file, and ref the run came
   from — e.g. `ElliotDrel/PATCH-md`, `release.yml`, `refs/tags/v0.2.0`.
3. `npm publish` presents the OIDC token to the registry instead of an auth
   token.
4. npm checks it against the package's registered **Trusted Publisher**
   binding. If the repository and workflow file match, npm mints a
   short-lived publish token for that run. No secret is ever stored.

## One-time npm-side configuration

Configured once, on npmjs.com, under `patch.md-intent` → Settings → Trusted
Publisher:

- Provider: GitHub Actions
- Organization/user: `ElliotDrel`
- Repository: `PATCH-md`
- Workflow filename: `release.yml`
- Environment: none

The workflow filename must match `.github/workflows/release.yml` exactly, or
the OIDC token won't match the binding and the publish is rejected.

## The release workflow

`release.yml` triggers on push of a `v*` tag (not on a published GitHub
Release):

1. Check out with `persist-credentials: false`.
2. Set up Node and point npm at the public registry.
3. Verify the pushed tag matches the version in `package.json` — a tag of
   `v0.2.0` must correspond to `"version": "0.2.0"`.
4. Run the test suite.
5. `npm publish --access public`.

A `concurrency` group ensures overlapping tag pushes cancel in favor of the
latest one.

### Required Node version

npm trusted publishing requires **npm CLI ≥ 11.5.1**, which is only bundled
with **Node.js 24+**. On an older Node version (e.g. 22), `npm publish`
silently skips the OIDC handshake and falls back to an unauthenticated
request — which fails with a `404 Not Found` on the registry PUT for any
package that already has a published version, rather than a clear auth
error. `release.yml` therefore pins `node-version: 24`; do not lower it.

Only the release workflow needs Node 24 — `validate.yml` never publishes and
can stay on whatever Node version it already uses.

## Cutting a release

1. Bump `version` in `package.json` and commit.
2. Tag the release commit and push the tag:
   ```
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
3. Watch the run: `gh run list --workflow=release.yml --limit 3`.
4. Confirm the registry picked it up:
   `npm view patch.md-intent versions --json`.

If a tag needs to move (e.g. it was cut before a fix landed), delete and
recreate it rather than reusing the old ref:

```
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z
git tag vX.Y.Z <correct-commit-sha>
git push origin vX.Y.Z
```

## Prior art

This setup mirrors the release workflow used by the
[e-stack](https://github.com/ElliotDrel/e-stack) repository, which publishes
`elliot-stack` to npm the same way.
