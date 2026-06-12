# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The repo now installs as a Claude Code plugin (`skills-github`) and is its own marketplace, installable with `/plugin marketplace add qiaeru/skills-github` then `/plugin install skills-github@skills-github`, with updates through `/plugin update`; copying the skill folders by hand stays as a fallback. `releasing` lists the plugin manifest among the version files to bump.

### Changed

- `scaffolding-repos` ships the CHANGELOG boilerplates as template files (`templates/CHANGELOG.en.md` / `CHANGELOG.fr.md`) instead of inline blocks in the skill.
- `committing` condenses the `Co-Authored-By` rule and uses a model-neutral example trailer, since commits may come from different Claude models (Fable, Opus).
- `committing` adds a pre-push scan for secrets and unintended staged files, names the diff-base commands (`git merge-base origin/main HEAD` when locked, `@{u}` when free), recovers a rejected free-mode push with `git pull --rebase`, and prunes every comment syntax (`#` included).

## [1.1.1] - 2026-06-05

### Changed

- Trim two filler adverbs from the `releasing` and `scaffolding-repos` prose (stop-slop pass).

## [1.1.0] - 2026-05-27

### Changed

- `committing` and `releasing` now write the four-line `Repo profile` marker themselves when it is missing, instead of delegating to the full `scaffolding-repos` skill; `scaffolding-repos` documents this marker-only mode.
- `committing` flags that suppressing the `Generated with Claude Code` PR trailer deliberately overrides the default Claude Code instruction, recommends passing multi-line commit messages and PR bodies through a file, and says to keep that file outside the worktree so it is never staged.
- `releasing` recommends running the typecheck or build before tagging, with a fallback to cheap equivalent checks when the build only runs in CI or Docker, and passing Release notes through `--notes-file` rather than inline.
- `releasing` spells out the lockfile bump for two more layouts: a workspace monorepo (every `packages.<workspace>` node) and several independent packages side by side (the two-occurrence rule per lockfile), and warns against editing a dependency that shares the version number by coincidence.
- `releasing` step 5 now has the owner read the publishing workflow's `on:` trigger (tag push vs Release event) to know when automation fires, and confirm the run succeeded with `gh run list` / `gh run watch` rather than only noting it was triggered.
- `releasing` notes that `gh release create` defaults the Release title to the tag (pass `--title` for another label), and that on a squash-merge repo the feature branch must be deleted local-first or with `git branch -D`, since the flattened commits make `git branch -d` refuse.

### Fixed

- `committing` now says to keep the `Co-Authored-By` trailer Claude adds verbatim, without stripping it or hardcoding a model name or version, so commits stay attributed to whichever model actually made them.

## [1.0.0] - 2026-05-27

### Added

- Initial release: three Claude Code skills (`committing`, `releasing`, `scaffolding-repos`) for managing public GitHub repos.
- `Repo profile` marker convention (`Lock:` and `Docs language:`) so the skills adapt to locked or free repos and to English or French docs.
- Generic templates installed by `scaffolding-repos`: a `.gitignore` (Claude, OS and IDE files), an LF `.gitattributes`, and a Keep a Changelog / SemVer `CHANGELOG.md` in the repo's single language.
