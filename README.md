# skills-github

Reusable Claude Code skills for managing public GitHub repos at commit, push, and release time, plus the generic repo files every project should carry.

This repo is the single source for three skills. You copy them into a target repo's `.claude/skills/` (gitignored, local only). The skills stay generic: instead of hardcoding one project's layout, they adapt to two axes they read from the target repo.

## The two axes

Each repo is described by a `## Repo profile` section in its root `CLAUDE.md`:

```markdown
## Repo profile (read by the github skills)

- Lock: locked   <!-- locked = feature branch + PR ; free = commit straight to main -->
- Docs language: en   <!-- en | fr -->
```

- **Lock** decides the Git workflow. `locked` means `main` is protected: work on a feature branch, open a pull request, and the owner merges and publishes the Release (the human gate). `free` means commit straight to `main`.
- **Docs language** decides the language of everything written for the owner: commit messages, PR text, CHANGELOG entries, docs. `en` or `fr`.

The skill instructions themselves are in English; only the output follows the docs language. `CLAUDE.md` is gitignored, so the marker stays local and never ships.

## The three skills

- **`committing`** is the checklist to run before every commit and push: Git workflow rules (branching vs direct-to-main per the lock, conventional commits, PR body style), a keep-or-delete pass on every comment in the diff, docs updates, and tightening the `[Unreleased]` CHANGELOG section.
- **`releasing`** cuts a new version: pick the SemVer bump, bump the manifest(s) if any, promote `[Unreleased]` to a dated section, then tag and publish, following the lock (PR + owner-published Release, or direct tag on `main`). It offers the `gh` CLI for PR and Release creation while keeping the owner as the merge/publish gate in locked repos.
- **`scaffolding-repos`** scaffolds or refreshes the generic files in a repo: the `.gitignore` (ignores `CLAUDE.md`, `.claude/`, OS and IDE files), the LF-normalizing `.gitattributes`, a Keep a Changelog / SemVer `CHANGELOG.md` in the repo's single language, and the `## Repo profile` marker. It is idempotent and never clobbers existing files without showing a diff first.

## Layout

```text
skills-github/
├── README.md
├── CHANGELOG.md
├── CLAUDE.md                   # gitignored, dev notes + this repo's Repo profile
├── LICENSE
├── .gitignore
├── .gitattributes
├── .github/
│   └── FUNDING.yml
└── skills/
    ├── committing/
    │   └── SKILL.md
    ├── releasing/
    │   └── SKILL.md
    └── scaffolding-repos/
        ├── SKILL.md
        └── templates/
            ├── gitignore       # renamed to .gitignore on install
            └── gitattributes   # renamed to .gitattributes on install
```

## Installation

Claude Code loads a project's skills from the `.claude/skills/` folder at the root of that project, and global skills from `~/.claude/skills/`.

The repo is organized so each skill copies as one block. The [skills/](skills/) folder holds `committing/`, `releasing/` and `scaffolding-repos/`, each already under the exact name Claude Code expects.

To install them in a project, copy the three folders into that project's `.claude/skills/` directory, creating that directory if it does not exist. For an installation that applies to all your projects, copy the same folders into `~/.claude/skills/` instead.

Restart Claude Code so the skills are detected. You can confirm they were picked up by asking Claude for the list of available skills or by invoking one by name. Then, in the target repo, invoke `scaffolding-repos` once to lay down the generic files and write the `## Repo profile` marker; after that, `committing` and `releasing` read the marker and adapt automatically.

When you change a skill in this repo, re-copy its folder into the target project's `.claude/skills/` (or its global equivalent) and restart Claude Code, since skill content is not hot-reloaded.

## Usage

Once the skills are installed and Claude Code is restarted, Claude uses them in three ways.

- When you name a skill explicitly ("run `committing` before I push", "cut a release with `releasing`", "scaffold this repo with `scaffolding-repos`"), Claude loads its `SKILL.md` and follows the checklist step by step. This is the most reliable path when you want the full pass.
- When you ask for the underlying action without naming the skill ("commit this", "ship a new version", "set up the repo files"), Claude recognizes the context from the skill's `description` frontmatter and invokes it on its own. You can confirm by asking which skill it just applied.
- The three skills chain. `scaffolding-repos` writes the `## Repo profile` marker, then `committing` and `releasing` read it to pick the Git workflow and the docs language. `releasing` also reuses the CHANGELOG tightening rule from `committing`, so a release stays consistent with everyday commits.

## Limits

These skills handle Git and GitHub hygiene, not the substance of your work. A few things they deliberately leave to you:

- They do not run your build or your tests. They assume you verify the code yourself before asking for a commit or a release; they only gate the docs, the commit message, the CHANGELOG and the release mechanics.
- They do not judge the code. They check comments, docs freshness and conventional-commit form, not correctness, design or factual accuracy.
- They model two axes only, `Lock` and `Docs language`. A repo whose workflow falls outside them (a monorepo release train, a signed-tag policy, a non-`main` default branch) may need manual steps the skills do not cover.
- Docs language is `en` or `fr`. Other languages are not supported.

## Quick test

To confirm the skills are loaded, ask Claude to list the available skills, or invoke one by name. The clearest check: in a repo where you copied the folders, ask Claude to "scaffold this repo with `scaffolding-repos`" and watch it lay down the generic files and write the `## Repo profile` marker. If instead Claude improvises its own `.gitignore` or asks what a Repo profile is, the skills were not detected: re-copy the folders into `.claude/skills/` and restart Claude Code.

## License

MIT, see [LICENSE](LICENSE).
