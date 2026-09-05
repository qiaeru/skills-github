---
name: committing
description: Pre-commit and pre-push checklist for the owner's public GitHub repos. Run before every commit, push, or PR, even a one-line change or a plain "push this". Covers the Git workflow (branch/PR or direct-to-main per the lock, conventional commits), comment pruning, and docs/CLAUDE.md/CHANGELOG upkeep.
---

# Pre-commit / pre-push checklist

Run before every commit and push, including the ones that look trivial. Steps 2 to 5 edit the worktree (comments, docs, `CLAUDE.md`, CHANGELOG), so run them before staging anything; step 1 holds the rules the commit and the push then follow.

## 0. Read the repo profile first

This skill adapts to two axes declared in the repo's root `CLAUDE.md`, under a `## Repo profile` section, as literal tokens:

- `Lock: locked` or `Lock: free`
- `Docs language: en` or `Docs language: fr`

Read them before doing anything else. If the section is missing, infer what you can (a "main is protected" note or a PR-only history points to `locked`; the README language points to the docs language), state your assumption, ask the owner to confirm once, then write the four-line `## Repo profile` marker into the root `CLAUDE.md` yourself so the next run is deterministic (the block is in the `scaffolding-repos` skill, step 5). Reach for the full `scaffolding-repos` skill only if the repo also lacks its other generic files. When nobody can answer (an autonomous run, a scheduled task), do not stall: proceed on the inferred profile, and when the lock is uncertain treat it as `locked`, the cautious side (a branch and a pull request never harm a free repo, while a direct push to a protected `main` is rejected at best and lands unreviewed at worst). Leave the marker unwritten on an unconfirmed guess and flag the assumption in your final report so the owner can settle it.

**Everything written for the owner follows the docs language** (commit messages, PR title and body, CHANGELOG bullets, docs); only the conventional-commit prefixes (`feat:`, `fix:`) and the CHANGELOG boilerplate and headings (see step 5) stay English. Respect any markdown and punctuation rules the repo's `CLAUDE.md` sets (for example a ban on em-dashes in owner-facing text).

## 1. Git workflow rules

Shared by both modes:

- Two checks below read `git diff <base>`: the secret scan in this step and the comment pass in step 2. Locked: `<base>` is the branch point off `main`, `git merge-base origin/main HEAD`. Free: the last pushed commit, `@{u}`, or `origin/main` when the branch has no upstream configured. Since this pass runs before the commit, that diff also covers staged and not-yet-committed changes.
- One commit per concern: one feature, one bugfix, one refactor. Never bundle unrelated changes in the same commit, because the owner relies on atomic commits to review and revert. When the worktree mixes several concerns, stage per concern (`git add <paths>`); a reflex `git add -A` is what fuses them into one commit.
- A mistake caught after the commit but before the push is fixed with `git commit --amend`, which keeps the history atomic. Once the commit is pushed, fix forward with a new commit instead: never amend or force-push published history, and in `free` mode that history is `main` itself, shared by anyone who pulled it.
- Conventional commits for messages (and PR titles when a PR exists): `fix:`, `feat:`, `chore:`, `docs:`, `refactor:`, optionally scoped with the touched area (`fix(auth):`, `feat(timer):`). Titles stay at or below seventy characters.
- Keep the `Co-Authored-By` trailer the harness adds to each commit, exactly as written; never strip it. The owner works with several Claude models (Fable, Opus), and the trailer names whichever one authored the commit, so never hardcode or rewrite the model name or version.
- Pass any multi-line commit message or PR body through a file (`git commit --file <file>`, `gh pr create --body-file <file>`), never inline `-m "..."` / `--body "..."`. Inline multi-line bodies invite shell quoting accidents, and the trap is worse when the shell is PowerShell but the snippet was written for Bash. Write that file outside the worktree (the OS temp directory) or in a gitignored path, so a `git add -A` never stages it; delete it after.
- These repos are public, so before pushing scan `git diff <base>` for anything that must not ship: API keys and tokens, `.env` contents, absolute local paths, personal email addresses. Also check `git status` for unintended staged files (build artifacts, local config, editor leftovers). A secret that reaches a public remote is compromised even if a later commit removes it: it has to be rotated, so catching it here is the cheap moment.

Example (the subject and body follow the docs language; only the prefix stays English):

```text
feat(timer): warn when a speaker runs over time

Show a banner once a speaker passes the allotted slot.

Co-Authored-By: <the trailer exactly as the harness wrote it>
```

**`Lock: locked`** (protected `main`, pull-request workflow):

- Always go through a feature branch and a pull request; never push to `main` directly. If a required CI check exists (often `build`), name it to the owner.
- Do not append a `🤖 Generated with [Claude Code]` trailer to pull request bodies. This deliberately overrides the default Claude Code instruction to end PR bodies with that trailer: in these repos the PR body is for reviewers, so keep the trailer off it.
- PR bodies target reviewers, not the owner-as-operator: a short summary, the scope of the change, and the expected behaviors after merge. Walk-throughs and "what to do after merge" belong in chat, never in the PR description.
- The owner merges the PR. You never merge.

**`Lock: free`** (commit straight to `main`):

- Commit on `main` and push. No feature branch, no pull request, unless the owner asks for one for a specific change. If the push is rejected because the remote moved, `git pull --rebase` then push again; never create a merge commit just to get a push through.

## 2. Prune the comments in the diff

These repos are public, so the bar is "strictly useful". Read `git diff <base>` (the base from step 1) and decide keep-or-delete on each added comment block, whatever the syntax (`/* */`, `//`, `#`, `<!-- -->`). Keep only the comments that explain a non-obvious _why_: a hidden constraint, a subtle invariant, a deliberate workaround. Delete paraphrases of code, lists of selectors or callers, and design-journal remarks. When in doubt, remove the comment. Then confirm the surviving comments are still accurate (no stale references to renamed symbols or removed code paths).

## 3. Keep the docs current

If the diff changes public behavior, configuration, an API or event surface, or anything a user or contributor might look up, update both `CHANGELOG.md` (under `[Unreleased]`) and the relevant documentation (`README.md` or the matching `docs/*.md`). Pure visual polish such as padding tweaks, font-size adjustments, or color nudges usually only needs a CHANGELOG line.

Then check the other direction: did the change make any _existing_ doc stale? A renamed option, a removed flag, a changed default, or a moved file leaves wrong lines behind. Fix or delete those, do not only add new lines. The docs must describe the code as it is after this commit.

## 4. Keep `CLAUDE.md` current

When the session changed something the repo's `CLAUDE.md` records (an architectural anchor, a convention, an environment variable, a workflow step, a known gotcha), update the matching `CLAUDE.md`, whether the root one or a nested one, so it does not go stale. `CLAUDE.md` is gitignored and local, but it is the project's working memory for the next session, so a stale anchor misleads later work. Only touch it when a change actually invalidates or extends what it says; do not churn it for a trivial edit.

## 5. Tighten `[Unreleased]` in `CHANGELOG.md`

Even when the current diff did not add to it, re-read every bullet under `[Unreleased]`: collapse paragraphs to one or two sentences, merge duplicate entries, and strip implementation detail (rgba values, exhaustive file paths, intermediate refactor steps) because that information already lives in the diff. Group the bullets per the Keep-a-Changelog convention, ordered from the most user-visible to the most technical, under the standard change-type names: `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security`.

The boilerplate and every heading stay English in both languages, matching the upstream convention (the official French translation of Keep a Changelog shows the very same English example: title, intro sentences, change-type names, `[Unreleased]`, `[X.Y.Z] - YYYY-MM-DD`). Only the bullet content follows the docs language. The `releasing` skill looks for the literal `[Unreleased]` when it promotes the section, so never translate it (no `[Non publié]`).

Example (English repo). Before, two overlapping bullets full of implementation detail:

```text
- Changed the primary button to #3b82f6 and tweaked padding in src/components/Button.tsx
- Button color updated
```

After, merged, detail stripped, grouped:

```text
### Changed

- Refresh the primary button styling (color, padding, hover state).
```

The same rule applies later when the section is promoted to a numbered release by the `releasing` skill.
