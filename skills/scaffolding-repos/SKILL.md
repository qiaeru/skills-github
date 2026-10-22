---
name: scaffolding-repos
description: Scaffold or refresh the generic files of the owner's public GitHub repos. Use when starting, normalizing, or auditing a repo's setup. Covers the generic .gitignore, the LF .gitattributes, and a Keep a Changelog and SemVer CHANGELOG.md, with comments in the repo's language.
---

# Repo setup

Install or refresh the three files every one of the owner's repos should carry: a generic `.gitignore`, an LF-normalizing `.gitattributes`, and a `CHANGELOG.md` (Keep a Changelog + SemVer). A repo with GitHub workflows is also offered a Dependabot configuration (step 4). The dotfile comments and the CHANGELOG bullets follow the repo's language, per `committing` step 0.

The skill is idempotent and non-destructive. If a file already exists, show a diff of what you would change and ask before writing. Never clobber an existing file, whether `CHANGELOG.md`, a hand-tuned `.gitignore`, or a `.gitattributes` whose comments record a project-specific reason: merge the missing entries in and keep the repo's own comments.

While in the repo, check for a `LICENSE` file. If there is none and the repo is public (`gh repo view --json visibility -q .visibility`), flag it to the owner: a public repo without a license is all-rights-reserved by default, which usually contradicts the intent. A private repo needs no such warning. Do not pick a license yourself; the choice belongs to the owner. Once they name one, `gh repo license view <spdx-id>` (for example `mit`) prints its text: fill its placeholders, such as `[year]` and `[fullname]`, and write it to `LICENSE`.

## 1. Write `.gitignore` and `.gitattributes`

These two files live next to this skill, in `templates/`. Copy and rename:

- `templates/gitignore` -> `.gitignore`
- `templates/gitattributes` -> `.gitattributes`

The rules are identical in every language; only the comments differ. The template comments are English. For a French repo, swap each comment line using this table:

| English comment | French comment |
| --- | --- |
| `# Claude Code working files, local to the dev machine.` | `# Fichiers de travail Claude Code, internes au poste de développement.` |
| `# Operating systems.` | `# Systèmes d'exploitation.` |
| `# Editors and IDEs.` | `# Éditeurs et IDE.` |
| `# Backups and temporary files.` | `# Sauvegardes et fichiers temporaires.` |
| `# Normalize line endings to LF for every text file, any OS.` | `# Normalise les fins de ligne en LF pour tout fichier texte, quel que soit l'OS.` |
| `# Windows batch scripts: cmd.exe misreads them with LF endings.` | `# Scripts batch Windows : cmd.exe les lit mal avec des fins de ligne LF.` |
| `# Binary assets: never touch these even if git guesses wrong.` | `# Fichiers binaires : git n'y touche jamais, même s'il se trompe.` |

## 2. Create `CHANGELOG.md`

If there is no `CHANGELOG.md`, copy `templates/CHANGELOG.md`, next to this skill, to the repo root as is, and do not translate it: its boilerplate and headings stay English whatever the repo's language, and only the bullets follow it (`committing` step 5 gives the reason and the tightening rule).

## 3. Append ecosystem entries

The generic `.gitignore` only covers the universal set (Claude files, OS, IDE, backups). Offer to append the entries the detected stack needs, for example:

- Node: `node_modules/`, `dist/`, `build/`, `*.log`, `*.tsbuildinfo`, `coverage/`, `.env.local`
- Python: `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`, `dist/`, `*.egg-info/`
- Rust: `target/`
- Another stack: start from GitHub's official template, `gh repo gitignore view <Stack>` (`gh repo gitignore list` names them), and pick the entries the repo needs rather than pasting the whole file, whose English comments would break the language rule in a non-English repo.
- Always, if relevant: `.env` and any secret or local database files.
- Claude Code: the template ignores `.claude/` whole. If the repo carries a `.claude/settings.json` meant to be shared (a team permission allowlist, hooks), replace the `.claude/` line with `.claude/*` followed by `!.claude/settings.json`. The `*` matters: git cannot re-include a file whose parent directory is excluded, so a bare `!` after `.claude/` does nothing. `settings.local.json` and the rest of the folder stay ignored.

## 4. Offer Dependabot

When the repo has workflows under `.github/workflows/` and no `.github/dependabot.yml`, offer to copy `templates/dependabot.yml`, next to this skill, to `.github/dependabot.yml`. It keeps the GitHub Actions the workflows pin up to date, which matters for security since an action runs with the workflow's token. The `cooldown` skips versions younger than a week, the ones most likely to be yanked or compromised, and the `chore` prefix keeps Dependabot's commits conventional. Offer to add one entry per detected package ecosystem (`npm`, `pip`, `cargo`, `docker`, and so on) in the same shape. Each entry opens its own pull requests, so the owner may decline: do not insist.

## 5. Commit the scaffold

Run the `committing` checklist and commit the generic files as one `chore:` commit (subject in the repo's language, for example `chore: add generic repo files`). Keep it apart from the renormalization commit of step 6 and from any code change made in the same session, so the scaffold stays a single, revertable concern.

## 6. Renormalize line endings

When `.gitattributes` lands in a repo that already has commits, the new rules do not rewrite the files already in the index on their own. Once the scaffold commit is in, and only on a clean tree (`git status` shows nothing; stash or commit anything else first), run `git add --renormalize .`. It re-adds every tracked file as it stands in the worktree, so on a dirty tree it would stage unrelated edits along with the line endings. If files were renormalized, commit them on their own (`chore: normalize line endings`) so the line-ending noise never mixes with a real change.
