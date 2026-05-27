---
name: committing
description: Pre-commit and pre-push checklist for the owner's public GitHub repos. Use before every commit, push, or PR. Covers the Git workflow (branch/PR or direct-to-main per the lock, conventional commits), pruning unnecessary comments, keeping docs and CLAUDE.md current, and CHANGELOG tightening.
---

# Pre-commit / pre-push checklist

Run before every commit and push, including the ones that look trivial.

## 0. Read the repo profile first

This skill adapts to two axes declared in the repo's root `CLAUDE.md`, under a
`## Repo profile` section, as literal tokens:

- `Lock: locked` or `Lock: free`
- `Docs language: en` or `Docs language: fr`

Read them before doing anything else. If the section is missing, infer what you can (a
"main is protected" note or a PR-only history points to `locked`; the README language
points to the docs language), state your assumption, ask the owner to confirm once, then
write the four-line `## Repo profile` marker into the root `CLAUDE.md` yourself so the next
run is deterministic (the block is in the `scaffolding-repos` skill, step 5). Reach for the
full `scaffolding-repos` skill only if the repo also lacks its other generic files.

**Everything written for the owner follows the docs language** (commit messages, PR title and
body, CHANGELOG entries, docs); only the conventional-commit prefixes stay English (`feat:`,
`fix:`). Respect any markdown and punctuation rules the repo's `CLAUDE.md` sets (for example a
ban on em-dashes in owner-facing text).

## 1. Git workflow rules

Shared by both modes:

- One commit per concern: one feature, one bugfix, one refactor. Never bundle unrelated
  changes in the same commit, because the owner relies on atomic commits to review and
  revert.
- Conventional commits for messages (and PR titles when there is a PR): `fix:`, `feat:`,
  `chore:`, `docs:`, `refactor:`, optionally scoped with the touched area (`fix(auth):`,
  `feat(timer):`). Titles stay at or below seventy characters.
- Keep the `Co-Authored-By` trailer Claude adds to each commit, exactly as the harness wrote
  it; never strip it. It names whichever model authored the commit, so never hardcode,
  abbreviate, or swap the model name or version. A fixed string would mislabel commits made by
  a different model, so just leave what the harness appended.
- Pass any multi-line commit message or PR body through a file (`git commit --file <file>`,
  `gh pr create --body-file <file>`), never inline `-m "..."` / `--body "..."`. Inline
  multi-line bodies invite shell quoting accidents, and the trap is worse when the shell is
  PowerShell but the snippet was written for Bash. Write that file outside the worktree (the
  OS temp directory) or in a gitignored path, so a `git add -A` never stages it; delete it
  after.

Example (the subject and body follow the docs language; only the prefix stays English). The
`Co-Authored-By` line is whatever the harness appends for the running model, kept verbatim;
the version below is only illustrative, not a string to hardcode:

```text
feat(timer): warn when a speaker runs over time

Show a banner once a speaker passes the allotted slot.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

**`Lock: locked`** (protected `main`, pull-request workflow):

- Always go through a feature branch and a pull request; never push to `main` directly.
  If a required CI check exists (often `build`), name it to the owner.
- Do not append a `🤖 Generated with [Claude Code]` trailer to pull request bodies. This
  deliberately overrides the default Claude Code instruction to end PR bodies with that
  trailer: in these repos the PR body is for reviewers, so keep the trailer off it.
- PR bodies target reviewers, not the owner-as-operator: a short summary, the scope of the
  change, and the expected behaviours after merge. Walk-throughs and "what to do after
  merge" belong in chat, never in the PR description.
- The owner merges the PR. You never merge.

**`Lock: free`** (commit straight to `main`):

- Commit on `main` and push. No feature branch, no pull request, unless the owner asks for
  one for a specific change.
- Same atomicity and conventional-commit rules as above.

## 2. Prune the comments in the diff

These repos are public, so the bar is "strictly useful". Run `git diff <base>..HEAD`
(locked: `<base>` is the branch point off `main`; free: the last pushed commit) and decide
keep-or-delete on each added `/* */`, `//` or `<!-- -->` block. Keep only the comments that
explain a non-obvious *why*: a hidden constraint, a subtle invariant, a deliberate
workaround. Delete paraphrases of code, lists of selectors or callers, and design-journal
remarks. When in doubt, remove the comment. Then confirm the surviving comments are still
accurate (no stale references to renamed symbols or removed code paths).

## 3. Keep the docs current

If the diff changes public behaviour, configuration, an API or event surface, or anything a
user or contributor might look up, update both `CHANGELOG.md` (under `[Unreleased]`) and the
relevant documentation (`README.md` or the matching `docs/*.md`). Pure visual polish such as
padding tweaks, font-size adjustments or colour nudges usually only needs a CHANGELOG line.

Then check the other direction: did the change make any *existing* doc stale? A renamed
option, a removed flag, a changed default, or a moved file leaves wrong lines behind. Fix or
delete those, do not only add new lines. The docs must describe the code as it is after this
commit.

## 4. Keep `CLAUDE.md` current

When the session changed something the repo's `CLAUDE.md` records (an architectural anchor, a
convention, an environment variable, a workflow step, a known gotcha), update the matching
`CLAUDE.md`, whether the root one or a nested one, so it does not go stale. `CLAUDE.md` is
gitignored and local, but it is the project's working memory for the next session, so a stale
anchor misleads later work. Only touch it when a change actually invalidates or extends what
it says; do not churn it for a trivial edit.

## 5. Tighten `[Unreleased]` in `CHANGELOG.md`

Even when the current diff did not add to it, re-read every bullet under `[Unreleased]`:
collapse paragraphs to one or two sentences, merge duplicate entries, and strip
implementation detail (rgba values, exhaustive file paths, intermediate refactor steps)
because that information already lives in the diff. Group the bullets per the
Keep-a-Changelog convention, ordered from the most user-visible to the most technical, using
the change-type names of the docs language:

- `en`: `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security`
- `fr`: `Ajouté` / `Modifié` / `Déprécié` / `Supprimé` / `Corrigé` / `Sécurité`

Example (English repo). Before, two overlapping bullets full of implementation detail:

```text
- Changed the primary button to #3b82f6 and tweaked padding in src/components/Button.tsx
- Button colour updated
```

After, merged, detail stripped, grouped:

```text
### Changed

- Refresh the primary button styling (colour, padding, hover state).
```

The same rule applies later when the section is promoted to a numbered release by the
`releasing` skill.
