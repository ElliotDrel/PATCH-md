# Origins and inspiration

PatchMD began with an idea from [Theo Browne (`@t3dotgg`)](https://github.com/t3dotgg),
creator of [T3 Code](https://github.com/pingdotgg/t3code).

Theo presented the proposal near the end of his April 2026 video
[“A letter to tech CEOs”](https://www.youtube.com/watch?v=G1xqTjoihfo).
The PatchMD segment begins at approximately
[32:50](https://www.youtube.com/watch?v=G1xqTjoihfo&t=1970s).

## Theo's proposal

The video starts from a broader observation: AI sharply reduces the cost of
changing open-source software. People who previously had to request a feature
can now fork an application and ask an agent to tailor it to their needs.

T3 Code made that change visible. Users did not merely contribute conventional
pull requests; many created increasingly personal forks. That raised a harder
question: how can an application remain updatable when each user may be running
a different version of it?

Theo connected the idea to existing plain-English files such as `CLAUDE.md`,
`AGENTS.md`, and `SOUL.md`, which give software or agents durable instructions.
He also referenced the mentality behind
[`patch-package`](https://github.com/ds300/patch-package): dependency code can
be treated as editable code, with local changes reapplied later. The weakness
is that a textual patch becomes brittle when upstream changes the same area.

His proposed answer was a second write whenever an agent customizes an app:

1. change the source code to implement the requested feature;
2. encode the feature's intent in `patch.md`.

During a future update, the system should pull upstream normally. If the changes
apply cleanly, no agent intervention is needed. If they do not, an agent can use
the intent record to resolve the conflict or rebuild the customization on the
new code. The user then reviews the result before migrating to it.

The larger vision is software that is “self-forking, self-customizing, and
self-healing” when upstream changes. That vision is discussed around
[35:09](https://www.youtube.com/watch?v=G1xqTjoihfo&t=2109s).

## What this repository adds

Theo's video proposed the product model and the core insight: preserve intent
next to customized code. This repository turns that idea into a small,
tool-independent convention:

- the canonical filename is `PATCH.md` at the fork root;
- entries are organized around stable customization intent;
- code remains in ordinary Git commits;
- the lifecycle is record, update, resolve, review, and retire;
- updates require recovery points, preserved conflict evidence, verification,
  and user approval;
- three skills cover installation, ordinary modification, and upstream updates.

These details are PatchMD Draft 0.1 design decisions. They should not be
attributed to Theo unless he adopts them separately.

## Other precedents

- [AGENTS.md](https://github.com/agentsmd/agents.md) demonstrates the value of a
  predictable, plain-Markdown filename that multiple tools can understand.
- [AUTH.md](https://github.com/workos/auth.md) demonstrates a Markdown-discovered
  protocol accompanied by reference material and implementations.
- [`patch-package`](https://github.com/ds300/patch-package) demonstrates the
  practical value—and textual fragility—of maintaining changes on top of code
  owned elsewhere.
- [Git rebase](https://git-scm.com/docs/git-rebase) and
  [Git cherry](https://git-scm.com/docs/git-cherry) provide the underlying
  mechanics for replaying downstream commits and recognizing equivalent
  patches.
- [T3 Code PR #3146](https://github.com/pingdotgg/t3code/pull/3146) was an early,
  project-specific attempt to implement the idea before this standard existed.

## Sources linked by Theo

The video's description also points to:

- Builder.io's [“The AI ‘slop’ fork”](https://www.builder.io/blog/ai-slop-forks)
- [Mitchell Hashimoto's post](https://x.com/mitchellh/status/2041566958681014418)

They are useful context for the wider discussion about AI, open source, and
user-maintained forks. PatchMD does not require agreement with every argument in
those sources.
