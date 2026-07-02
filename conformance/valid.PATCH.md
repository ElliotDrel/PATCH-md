# PATCH.md

## Upstream

- Repository: `https://github.com/example/application`
- Branch: `main`
- PatchMD version: `0.2`

## Active customizations

### compact-navigation

- **Status:** active
- **Intent:** Let keyboard users change sections directly.
- **Why:** The downstream product requires a keyboard-first workflow.
- **Behavior:** The documented section shortcuts navigate unless focus is in an input.
- **Scope:** Keyboard commands and navigation.
- **Reconstruction:** Use the current upstream command API and retain the input guard.

## Retired customizations

No retired customizations.
