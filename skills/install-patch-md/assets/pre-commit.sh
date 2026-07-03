#!/bin/sh
# PatchMD pre-commit hook (advisory). Installed by the install-patch-md skill.
# Warns when you change upstream-owned files without recording intent in PATCH.md.
# Skip once:    git commit --no-verify
# Make blocking: change the final "exit 0" to "exit 1".

UPSTREAM_REF="__UPSTREAM_REF__"   # set by the installer, e.g. upstream/main

# Recording intent in the same commit clears the warning.
git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMRD -M | grep -qxF 'PATCH.md' && exit 0

base=$(git merge-base HEAD "$UPSTREAM_REF" 2>/dev/null) || exit 0
[ -z "$base" ] && exit 0

# A staged file that already exists in the upstream merge base is upstream-owned.
owned=$(git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMRD -M | while IFS= read -r f; do
  git cat-file -e "$base:$f" 2>/dev/null && printf '  %s\n' "$f"
done)
[ -z "$owned" ] && exit 0

echo "PatchMD: upstream-owned files changed without updating PATCH.md:"
printf '%s\n' "$owned"
echo "If this is a deliberate customization, record its intent in PATCH.md"
echo "(run the modify-with-patch-md skill). Skip once with: git commit --no-verify"
exit 0
