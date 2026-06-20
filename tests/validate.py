from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "README.md",
    "SPEC.md",
    "template/PATCH.md",
    "examples/minimal.PATCH.md",
    "examples/customization.PATCH.md",
    "examples/retired-fix.PATCH.md",
    "skills/install-patch-md/SKILL.md",
    "skills/modify-with-patch-md/SKILL.md",
    "skills/update-with-patch-md/SKILL.md",
]

ENTRY_FIELDS = [
    "Status",
    "Intent",
    "Why",
    "Behavior",
    "Scope",
    "Reconstruction",
]


def read(relative_path: str) -> str:
    path = ROOT / relative_path
    assert path.is_file(), f"missing {relative_path}"
    return path.read_text(encoding="utf-8")


def validate_repository() -> None:
    for relative_path in REQUIRED_FILES:
        read(relative_path)

    markdown = "\n".join(
        path.read_text(encoding="utf-8")
        for path in ROOT.rglob("*.md")
    )
    assert "[TODO" not in markdown, "unfinished TODO placeholder found"

    for path in ROOT.rglob("*.md"):
        content = path.read_text(encoding="utf-8")
        assert content.endswith("\n"), f"missing final newline: {path.relative_to(ROOT)}"
        for number, line in enumerate(content.splitlines(), start=1):
            assert line == line.rstrip(), (
                f"trailing whitespace: {path.relative_to(ROOT)}:{number}"
            )
        for target in re.findall(r"\[[^]]+\]\((?!https?://)([^)#]+)", content):
            resolved = (path.parent / target).resolve()
            assert resolved.exists(), f"broken local link in {path.relative_to(ROOT)}: {target}"

    assert not (ROOT / "PATCH.md").exists(), (
        "the standards repository is not a downstream fork; its template belongs in template/"
    )


def validate_template_and_examples() -> None:
    template = read("template/PATCH.md")
    for heading in ("## Upstream", "## Active customizations", "## Retired customizations"):
        assert heading in template, f"template missing {heading}"
    for field in ENTRY_FIELDS:
        assert f"**{field}:**" in template, f"template missing {field}"

    minimal_example = read("examples/minimal.PATCH.md")
    for upstream_field in ("Repository:", "Branch:"):
        for name, content in (
            ("template", template),
            ("minimal example", minimal_example),
        ):
            assert upstream_field in content, f"{name} missing upstream {upstream_field}"
    assert "No active customizations." in minimal_example
    assert "No retired customizations." in minimal_example

    active_example = read("examples/customization.PATCH.md")
    retired_example = read("examples/retired-fix.PATCH.md")
    for field in ENTRY_FIELDS:
        assert f"**{field}:**" in active_example, f"active example missing {field}"
        assert f"**{field}:**" in retired_example, f"retired example missing {field}"
    assert "**Status:** active" in active_example
    assert "**Status:** retired" in retired_example


def validate_skills() -> None:
    for name in ("install-patch-md", "modify-with-patch-md", "update-with-patch-md"):
        skill = read(f"skills/{name}/SKILL.md")
        match = re.match(r"^---\n(.*?)\n---\n", skill, re.DOTALL)
        assert match, f"{name} has invalid frontmatter"
        frontmatter = match.group(1)
        assert f"name: {name}" in frontmatter, f"{name} has wrong name"

        description = re.search(r"^description:\s*(.+)$", frontmatter, re.MULTILINE)
        assert description, f"{name} has no description"
        # Claude Code truncates description + when_to_use at 1536 characters.
        assert len(description.group(1)) <= 1536, f"{name} description exceeds 1536 chars"

        # Claude Code skills are SKILL.md only; no agent-vendor adapter folder.
        assert not (ROOT / "skills" / name / "agents").exists(), (
            f"{name} still ships an agent-vendor adapter folder"
        )

    update_skill = read("skills/update-with-patch-md/SKILL.md")
    for guarantee in (
        "Never discard uncommitted work",
        "recoverable Git ref",
        "exact Git blob bytes",
        "Ask before reconstructing",
        "Roll back",
        "Stop before push",
    ):
        assert guarantee in update_skill, f"update skill missing guarantee: {guarantee}"


if __name__ == "__main__":
    validate_repository()
    validate_template_and_examples()
    validate_skills()
    print("PatchMD repository validation passed.")
