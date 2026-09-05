# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2026-09-05

### Changed

- `scaffolding-repos` ships one English `CHANGELOG.md` template for both docs languages: the French Keep a Changelog page shows the same untranslated example (title, intro sentences, headings), so a `fr` repo keeps the English boilerplate and writes only its bullets in French. The skill also ends by committing the scaffold as one `chore:` commit, apart from the line-ending normalization.
- `committing` opens with the order to run its steps in (edit the worktree, then stage), defines the diff base once for both the secret scan and the comment pass, drops a bullet that repeated the shared rules in free mode, and no longer stalls on the profile confirmation when nobody can answer (it proceeds on the inferred profile, `locked` when the lock is uncertain, and reports the assumption).
- `releasing` reads the profile through `committing` step 0 instead of restating it, reads today's date from the shell rather than from memory, counts lint and repo-invariants scripts among the pre-flight checks, spells out the Release notes (the promoted section minus its version heading), and tells CI-only workflows apart from release automation in its last step.
- `scaffolding-repos` explains how to share a `.claude/settings.json` despite the ignored `.claude/` folder (`.claude/*` plus a `!` rule, since git cannot re-include a file under an excluded directory).
- The three skill descriptions name more of the phrasings that should trigger them (a one-line change, "push this", tag or bump a version, audit a repo's setup).
- The invariants script also checks that the literal `## [Unreleased]` heading exists in the CHANGELOG and its template, and that the French comment-translation table in `scaffolding-repos` mirrors the template comments, row for row.
- README: the "Quick test" section folds into "First run".

### Removed

- The `CHANGELOG.fr.md` template, superseded by the single English one.

## [1.4.0] - 2026-07-05

### Changed

- CHANGELOG headings stay English in `fr` repos too (`Added`, `Fixed`, `[Unreleased]`): the official Keep a Changelog French translation keeps the English labels, so the skills stop localizing the change-type names.

## [1.3.0] - 2026-07-05

### Added

- A `validate` CI workflow mirroring the sibling repos: a repo-invariants script (skill frontmatter, relative links, the no-dash prose rule, plugin version matching the latest release), markdown hygiene via markdownlint-cli2, and the plugin manifest validation, on push, PR, and a weekly schedule. Dependabot keeps the workflow's actions current.

### Changed

- English-prose pass over the README and the `committing` skill: US spelling (`color`, `behavior`), missing serial commas, and small wording fixes.
- `committing` adds the amend rule (fix an unpushed commit with `git commit --amend`, fix forward once pushed), per-concern staging instead of a reflex `git add -A`, the same diff base for the secret scan as for the comment pass (with an `origin/main` fallback when the branch has no upstream), and pins the `[Unreleased]` and version headings as never localized.
- `releasing` names the pre-release range (`<last-tag>..HEAD`, the whole history on a first release), guards the tag step (clean tree, right commit, `vX.Y.Z` as the tag message), recovers a pushed tag whose Release did not publish, skips the automation check when no workflow exists, and reminds that a released plugin reaches installed copies through `/plugin update`.
- `scaffolding-repos` flags a missing `LICENSE` to the owner without ever picking one.
- Trim the skill descriptions back under the 300-character frontmatter limit, and write italics as underscores.

### Fixed

- Drop the redundant `**/CLAUDE.md` line from the `.gitignore` template: an unslashed `CLAUDE.md` already matches at every level.

## [1.2.0] - 2026-06-12

### Added

- The repo now installs as a Claude Code plugin (`skills-github`) and is its own marketplace, installable with `/plugin marketplace add qiaeru/skills-github` then `/plugin install skills-github@skills-github`, with updates through `/plugin update`; copying the skill folders by hand stays as a fallback. `releasing` lists the plugin manifest among the version files to bump.

### Changed

- `scaffolding-repos` ships the CHANGELOG boilerplates as template files (`templates/CHANGELOG.en.md` / `CHANGELOG.fr.md`) instead of inline blocks in the skill.
- `committing` condenses the `Co-Authored-By` rule and uses a model-neutral example trailer, since commits may come from different Claude models (Fable, Opus).
- `committing` adds a pre-push scan for secrets and unintended staged files, names the diff-base commands (`git merge-base origin/main HEAD` when locked, `@{u}` when free), recovers a rejected free-mode push with `git pull --rebase`, and prunes every comment syntax (`#` included).
- `releasing` validates the plugin manifest after bumping its version, and checks that the tag, the manifest(s), and the new CHANGELOG heading agree on the version before tagging.
- The `scaffolding-repos` templates ignore macOS `._*`, KDE `.directory`, and Zed `.zed/` files, and mark more binary types in `.gitattributes` (avif, mp3, mp4, ttf, otf, gz).
- `scaffolding-repos` runs `git add --renormalize .` after installing `.gitattributes` into a repo that already has commits, with the normalization committed separately; its ecosystem examples gain Rust.

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
