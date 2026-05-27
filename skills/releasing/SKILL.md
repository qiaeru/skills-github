---
name: releasing
description: Cut a new version of one of the owner's public GitHub repos. Use when the owner asks to publish, ship, or release a version (patch/minor/major bump, CHANGELOG promotion, tag, GitHub Release). Adapts the steps to the repo lock (PR workflow vs direct-to-main) and docs language.
---

# Release procedure

Pick the bump per semantic versioning: **patch** for bug-fixes only, **minor** for any new
user-visible feature, **major** for breaking changes that require user or operator action.
Use today's date.

## 0. Read the repo profile first

Read `Lock:` and `Docs language:` from the `## Repo profile` section of the repo's root
`CLAUDE.md` (see the `committing` skill). The lock decides whether you cut the release
on a feature branch through a pull request or straight on `main`. The docs language decides
the CHANGELOG wording. If the section is missing, infer, confirm once, and offer to record
it with `scaffolding-repos`.

## 1. Pre-flight: run the `committing` checklist

A release ships the docs, not just the code, so before bumping anything run the
`committing` pass over everything since the last release: confirm the docs are current
and that no change left an existing doc stale, update any `CLAUDE.md` the work invalidated or
extended, and prune comments to the strictly useful. Then make sure `[Unreleased]` is
complete: every user-visible change since the last tag has a bullet, there are no duplicates,
and it reads cleanly for a human. A release is the worst moment to find the changelog is
missing entries.

## 2. Bump the version

Find where the version lives and bump it:

- Node: `version` in `package.json`, plus the top-level `version` in `package-lock.json`
  (two occurrences: the top object and `packages.""`). In a workspace repo, bump every
  workspace `package.json`. No dependency changes belong in a release commit.
- Other ecosystems: `pyproject.toml` / `Cargo.toml` / `*.csproj` / `composer.json` and their
  lockfiles, as applicable.
- Content-only repos (a skill, docs): there is no manifest. The **tag is the version**;
  there is nothing to bump.

## 3. Promote the CHANGELOG

In `CHANGELOG.md`, rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD` and add a fresh empty
`[Unreleased]` section above it. Re-read every bullet in the section being promoted and apply
the tightening rule from the `committing` skill (short sentences, no implementation
detail, grouped under the localized change-type names). Never rewrite already-released
sections.

For example, a `## [Unreleased]` carrying this session's bullets becomes
`## [1.4.0] - 2026-05-27` (today's date), with a new empty `## [Unreleased]` inserted above
it.

## 4. Commit, then follow the lock

Make one commit: `chore(release): cut version X.Y.Z` (conventional, `Co-Authored-By` trailer
kept).

**`Lock: locked`:**

1. Commit on the feature branch and push. If no pull request exists yet, give the owner the
   title and body to paste.
2. **The owner merges the pull request.** This is the human gate of a locked repo; do not
   bypass it. Tell the owner explicitly and wait for confirmation before continuing. (The
   Release itself is published at step 4, once the tag exists.)
3. After merge is confirmed: `git checkout main && git pull`, then
   `git tag -a vX.Y.Z -m "..."` and `git push origin vX.Y.Z`. Delete the feature branch
   (`git branch -d <branch>` and `git push origin --delete <branch>`).
4. Walk the owner through the GitHub Releases page: select the tag just pushed and paste the
   relevant CHANGELOG section as the release body. If `gh` is installed and authenticated
   (`gh auth status`), you may offer instead to run
   `gh release create vX.Y.Z --notes-file <file>` once the owner approves.

**`Lock: free`:**

1. Commit on `main`, tag `vX.Y.Z`, and push both `main` and the tag.
2. Publish the GitHub Release: walk the owner through the Releases page with the CHANGELOG
   section, or, if `gh` is authenticated and the owner approves,
   `gh release create vX.Y.Z --notes-file <file>`.

## 5. Note any automation

If the repo publishes on the Release event (a Docker image, an npm package, a GitHub Pages
build), remind the owner that publishing the Release triggers it; nothing more to run by hand.
