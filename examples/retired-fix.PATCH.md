# PATCH.md

This file records the intent behind deliberate customizations to this fork.

## Upstream

- Repository: `https://github.com/example/notes-app`
- Branch: `main`
- PatchMD version: `0.2`

## Active customizations

No active customizations.

## Retired customizations

### preserve-drafts-on-refresh

- **Status:** retired
- **Intent:** Prevent unsaved drafts from disappearing after a browser refresh.
- **Why:** Older upstream releases stored drafts only in component memory.
- **Behavior:** A refresh restores the latest unsaved draft for the open note.
- **Scope:** Draft persistence and note editor initialization.
- **Reconstruction:** No longer required. Upstream now persists draft state and
  restores it before rendering the editor.
- **References:** Retired after upstream PR `#456`.
