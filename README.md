# Skills GitHub

Reusable Claude Code skills for managing public GitHub repos at commit, push, and release time, plus the generic repo files every project should carry.

This repo is the single source for three skills. You copy them into a target repo's `.claude/skills/` (gitignored, local only). The skills stay generic: instead of hardcoding one project's layout, they adapt to the target repo, its language and its conventions.

## The repo's language and workflow

The skills stay consistent with the repo: a repo whose README and docs are in French gets French commit messages, CHANGELOG bullets, docs, Release notes, and dotfile comments; an English repo gets English. If your `CLAUDE.md` names a language, they follow it, and a repo with nothing written yet is asked once. Nothing has to be declared anywhere for the common case.

The Keep a Changelog boilerplate (title, intro sentences, and headings such as `Added`, `Fixed`, `[Unreleased]`) stays English either way: the official French translation of Keep a Changelog shows the same untranslated example, so only the bullets follow the repo's language. The skill instructions themselves are in English; only the output follows the repo.

The Git workflow is direct-to-main by default: the skills commit on `main`, tag on it, and publish the Release from it. They open a branch and a pull request only when you ask for one or the repo requires it (a protected `main`). When the `gh` CLI is installed and authenticated, Claude does the GitHub side itself (pull requests, merges once you approve, Releases, CI runs) instead of walking you through the website. Everywhere, the repo's own conventions (its `CLAUDE.md`, its existing docs, its history) beat the skill's defaults.

## The three skills

- **`committing`** is the checklist to run before every commit and push: Git and GitHub rules (direct-to-main, conventional commits, one commit per concern, a pre-push secret scan, `gh` for the GitHub side), a keep-or-delete pass on every comment in the diff, docs updates, and tightening the `[Unreleased]` CHANGELOG section.
- **`releasing`** cuts a new version: pick the SemVer bump, bump the manifest(s) if any, promote `[Unreleased]` to a dated section, then commit, tag, publish the GitHub Release with `gh`, and watch the CI run that the tag or the Release triggers.
- **`scaffolding-repos`** scaffolds or refreshes the generic files in a repo: the `.gitignore` (ignores `CLAUDE.md`, `.claude/`, OS, and IDE files), the LF-normalizing `.gitattributes`, and a Keep a Changelog / SemVer `CHANGELOG.md` with the upstream English boilerplate. It is idempotent and never clobbers existing files without showing a diff first, and it ends by committing the scaffold as one `chore:` commit through `committing`.

## Layout

```text
skills-github/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── .github/
│   ├── FUNDING.yml
│   ├── dependabot.yml
│   ├── scripts/
│   │   └── validate.mjs
│   └── workflows/
│       └── validate.yml
├── .gitattributes
├── .gitignore
├── .markdownlint-cli2.jsonc
├── README.md
├── CHANGELOG.md
├── LICENSE
└── skills/
    ├── committing/
    │   └── SKILL.md
    ├── releasing/
    │   └── SKILL.md
    └── scaffolding-repos/
        ├── SKILL.md
        └── templates/
            ├── gitignore
            ├── gitattributes
            └── CHANGELOG.md
```

The `gitignore` and `gitattributes` templates under `scaffolding-repos/templates/` are stored without their leading dot so git tracks them; `scaffolding-repos` renames them on install. `CHANGELOG.md` copies as is, whatever the repo's language.

The repository doubles as a Claude Code plugin named `skills-github` and as its own plugin marketplace: `plugin.json` describes the plugin (the whole repository, with the skills under `skills/`), and `marketplace.json` lists it so Claude Code can install and update it straight from GitHub.

## Installation

The recommended path is the Claude Code plugin; copying the folders by hand stays available as a fallback. The two modes coexist: the `.claude-plugin/` manifest does not interfere with a manual copy into `.claude/skills/`.

### As a plugin (recommended)

The repo carries a `.claude-plugin/` manifest, so Claude Code can install it directly from GitHub. In Claude Code, run:

```text
/plugin marketplace add qiaeru/skills-github
/plugin install skills-github@skills-github
```

The plugin brings the three skills with it. Its `version` follows the repo's releases, bumped by `releasing` alongside the CHANGELOG. When a new version is published, update with `/plugin update skills-github`, or let Claude Code's automatic update pick it up, instead of re-copying anything.

### By copying the folders (fallback)

Claude Code loads a project's skills from the `.claude/skills/` folder at the root of that project, and global skills from `~/.claude/skills/`.

The repo is organized so each skill copies as one block. The [skills/](skills/) folder holds `committing/`, `releasing/`, and `scaffolding-repos/`, each already under the exact name Claude Code expects.

To install them in a project, copy the three folders into that project's `.claude/skills/` directory, creating that directory if it does not exist. For an installation that applies to all your projects, copy the same folders into `~/.claude/skills/` instead.

When you change a skill in this repo, re-copy its folder into the target project's `.claude/skills/` (or its global equivalent) and restart Claude Code, since skill content is not hot-reloaded.

### First run

Restart Claude Code so the skills are detected, then confirm they were picked up: ask Claude for the list of available skills, or, in the target repo, ask it to "scaffold this repo with `scaffolding-repos`" and watch it lay down the generic files with their comments in the repo's language. If instead Claude improvises its own `.gitignore`, the skills were not detected: check the plugin install (or re-copy the folders into `.claude/skills/`) and restart Claude Code.

## Usage

Once the skills are installed and Claude Code is restarted, Claude uses them in three ways.

- When you name a skill explicitly ("run `committing` before I push", "cut a release with `releasing`", "scaffold this repo with `scaffolding-repos`"), Claude loads its `SKILL.md` and follows the checklist step by step. This is the most reliable path when you want the full pass.
- When you ask for the underlying action without naming the skill ("commit this", "ship a new version", "set up the repo files"), Claude recognizes the context from the skill's `description` frontmatter and invokes it on its own. You can confirm by asking which skill it just applied.
- The three skills chain. `committing` holds the shared rules (the repo's language in step 0, Git and `gh` in step 1), and the other two point to it. `scaffolding-repos` commits its files through `committing`, and `releasing` runs the `committing` pass before tagging and reuses its CHANGELOG tightening rule, so a release stays consistent with everyday commits.

## Limits

These skills handle Git and GitHub hygiene, not the substance of your work. A few things they deliberately leave to you:

- They do not run your test suite. They assume you verify the code yourself before asking for a commit or a release; they gate the docs, the commit message, the CHANGELOG, and the release mechanics. The one exception is `releasing`, which runs the project's typecheck or build (when it has one) before tagging, since a broken build is far cheaper to catch before the tag than after a published Release triggers a downstream build.
- They do not judge the code. They check comments, docs freshness, and conventional-commit form, not correctness, design, or factual accuracy.
- They model one workflow, direct-to-main with a pull request as the exception. A monorepo release train, a signed-tag policy, or a non-`main` default branch may need manual steps the skills do not cover.
- The generic dotfile comments exist in English and French only; a repo in another language gets the English comments.

## License

MIT, see [LICENSE](LICENSE).
