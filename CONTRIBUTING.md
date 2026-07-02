# Contributing

PatchMD should remain small, readable, and useful without special tooling.

Before proposing a change:

1. Explain the real fork-maintenance problem it solves.
2. Prefer clarifying the existing format over adding a new field or mechanism.
3. Update the specification, template, skills, skill assets, installer, and
   examples together when the behavior changes.
4. Run the repository validation and all skill validators.

Bug reports and examples from maintained downstream forks are especially useful.

## Proposing a specification change

Open an issue describing the maintenance failure, evidence from a real fork,
the smallest proposed change, and its compatibility impact. Specification
changes require matching updates to the template, conformance fixtures, skills,
tests, documentation, and changelog. Draft releases may break compatibility;
stable releases follow semantic versioning.

## Trial reports

Reports should identify the upstream and downstream repositories, PatchMD
version, update method, active entries, conflict outcome, verification commands,
and any intent that could not be reconstructed confidently. Redact private code
while retaining enough behavioral evidence to evaluate the workflow.
