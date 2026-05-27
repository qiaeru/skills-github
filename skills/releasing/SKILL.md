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
the CHANGELOG wording. If the section is missing, infer, confirm once, then write the
four-line `## Repo profile` marker into the root `CLAUDE.md` yourself (the block is in the
`scaffolding-repos` skill, step 5). Reach for the full `scaffolding-repos` skill only if the
repo also lacks its other generic files.

## 1. Pre-flight: run the `committing` checklist

A release ships the docs, not just the code, so before bumping anything run the
`committing` pass over everything since the last release: confirm the docs are current
and that no change left an existing doc stale, update any `CLAUDE.md` the work invalidated or
extended, and prune comments to the strictly useful. Then make sure `[Unreleased]` is
complete: every user-visible change since the last tag has a bullet, there are no duplicates,
and it reads cleanly for a human. A release is the worst moment to find the changelog is
missing entries.

If the project has a typecheck or build step, run it now and confirm it passes before you
bump anything. This matters most when publishing the Release triggers a build (see step 5):
a broken build is cheap to find before the tag and painful to find after. When the real build
only runs in Docker or CI and is not reachable locally, run the cheapest equivalent checks
instead (syntax check the changed sources, parse any JSON or config they touch), and tell the
owner the actual build will run in CI when the tag is pushed, so they know it is still
unverified at tag time.

## 2. Bump the version

Find where the version lives and bump it:

- Node: bump `version` in `package.json`, and the `version` in its `package-lock.json` in
  exactly two places, the top object and `packages.""`. Edit only those `version` keys: a
  dependency can carry the same number by coincidence, so never touch a `node_modules/*` or
  other dependency entry, and never blind-replace the old version string across the lockfile.
  Two layouts go past the single package:
  - Workspace monorepo: bump every workspace `package.json` **and** the `version` of each
    matching `packages.<workspace>` node in the lockfile. Miss those and the workspace nodes
    stay behind, which makes `npm ci` reject the lockfile as out of sync and breaks any Docker
    build that runs it.
  - Several independent packages side by side, each with its own `package-lock.json` and no
    workspaces (say a root package and a `server/` package): apply the same two-occurrence
    rule to each lockfile separately.

  No dependency changes belong in a release commit.
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
   Release itself is published in the last sub-step below, once the tag exists.)
3. After merge is confirmed: `git checkout main && git pull`, then
   `git tag -a vX.Y.Z -m "..."` and `git push origin vX.Y.Z`. Delete the feature branch,
   local first then remote (`git branch -d <branch>` then `git push origin --delete <branch>`).
   On a squash-merge repo the branch commits were flattened into one new commit on `main`, so
   they are not ancestors of `main` and `git branch -d` can refuse with "not fully merged";
   the work is safely merged, so use `git branch -D` to force it.
4. Walk the owner through the GitHub Releases page: select the tag just pushed and paste the
   relevant CHANGELOG section as the release body. If `gh` is installed and authenticated
   (`gh auth status`), you may offer instead to run
   `gh release create vX.Y.Z --notes-file <file>` once the owner approves. Always pass the
   body through `--notes-file`, never inline `--notes "..."`: a multi-line body inline invites
   shell quoting accidents (a stray `@`, an unescaped quote). Without `--title`, gh uses the
   tag name as the Release title, which is fine; add `--title "..."` only if you want a
   different label.

**`Lock: free`:**

1. Commit on `main`, tag `vX.Y.Z`, and push both `main` and the tag.
2. Publish the GitHub Release: walk the owner through the Releases page with the CHANGELOG
   section, or, if `gh` is authenticated and the owner approves,
   `gh release create vX.Y.Z --notes-file <file>`.

## 5. Confirm the release automation

Many of these repos publish on a tag or Release event (a Docker image, an npm package, a
GitHub Pages build). Before relying on it, read the `on:` trigger of the publishing workflow
under `.github/workflows/`, because it decides when the automation fires and what to watch:

- `on: push: tags:` fires when you push the tag (step 4), before the Release exists. The
  Release you publish next is then only a notes wrapper, and the build is likely already
  running or finished by the time you publish it.
- `on: release: types: [published]` fires only when you publish the Release; nothing runs at
  the tag push.

Either way, confirm the run actually succeeded instead of only telling the owner it was
triggered: `gh run list --workflow=<file>` (or `gh run watch`) after the tag push. On a tag
trigger especially, a failed build means the image or package never publishes even though the
tag and Release already exist, so without this check the failure goes unnoticed.
