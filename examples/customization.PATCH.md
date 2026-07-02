# PATCH.md

This file records the intent behind deliberate customizations to this fork.

## Upstream

- Repository: `https://github.com/example/notes-app`
- Branch: `main`
- PatchMD version: `0.2`

## Active customizations

### compact-navigation

- **Status:** active
- **Intent:** Let keyboard-heavy users switch sections without opening the
  navigation drawer.
- **Why:** Upstream requires pointer interaction for every section change.
- **Behavior:** `Ctrl+1` through `Ctrl+4` switch the four primary sections;
  shortcuts do nothing while a text field is active.
- **Scope:** Desktop keyboard handling and primary navigation state.
- **Reconstruction:** Use upstream's current command and navigation APIs. Keep
  the text-input guard and avoid a second navigation state store.
- **References:** Downstream issue `#12`.

## Retired customizations

No retired customizations.
