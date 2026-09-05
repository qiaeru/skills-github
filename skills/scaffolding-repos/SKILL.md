---
name: scaffolding-repos
description: Scaffold or refresh the generic files of the owner's public GitHub repos. Use when starting, normalizing, or auditing a repo's setup: the generic .gitignore, the LF .gitattributes, a Keep a Changelog / SemVer CHANGELOG.md, and the Repo profile marker the other github skills read.
---

# Repo setup

Install or refresh the four things every one of the owner's repos should carry: a generic `.gitignore`, an LF-normalizing `.gitattributes`, a `CHANGELOG.md` (Keep a Changelog + SemVer), and the `## Repo profile` marker in the root `CLAUDE.md`.

**Idempotent and non-destructive.** If a file already exists, show a diff of what you would change and ask before writing. Never clobber an existing `CHANGELOG.md` or hand-tuned `.gitignore`; merge missing entries in instead.

**LICENSE check.** While in the repo, check for a `LICENSE` file. If there is none, flag it to the owner: these repos are public, and a public repo without a license is all-rights-reserved by default, which usually contradicts the intent. Do not pick or install a license yourself; the choice belongs to the owner.

## 1. Determine the profile

Decide two things, asking the owner if they are not already obvious:

- **Lock**: `locked` (protected `main`, feature branch + PR, owner merges and publishes) or `free` (commit straight to `main`).
- **Docs language**: `en` or `fr`.

## 2. Write `.gitignore` and `.gitattributes`

These two files live next to this skill, in `templates/`. Copy and rename:

- `templates/gitignore` -> `.gitignore`
- `templates/gitattributes` -> `.gitattributes`

The rules are identical in every language; only the comments differ. The template comments are English. For a `fr` repo, swap each comment line using this table:

| English comment | French comment |
| --- | --- |
| `# Claude Code working files, local to the dev machine.` | `# Fichiers de travail Claude Code, internes au poste de développement.` |
| `# Operating systems.` | `# Systèmes d'exploitation.` |
| `# Editors and IDEs.` | `# Éditeurs et IDE.` |
| `# Backups and temporary files.` | `# Sauvegardes et fichiers temporaires.` |
| `# Normalize line endings to LF for every text file, any OS.` | `# Normalise les fins de ligne en LF pour tout fichier texte, quel que soit l'OS.` |
| `# Binary assets: never touch these even if git guesses wrong.` | `# Fichiers binaires : git n'y touche jamais, même s'il se trompe.` |

When `.gitattributes` lands in a repo that already has commits, the new rules do not rewrite the files already in the index on their own. Run `git add --renormalize .` afterwards and look at `git status`: if files were renormalized, commit them separately (`chore: normalize line endings`) so the line-ending noise never mixes with a real change.

## 3. Create `CHANGELOG.md`

If there is no `CHANGELOG.md`, copy `templates/CHANGELOG.md`, next to this skill, to the repo root as is. The boilerplate is English whatever the docs language: the official French translation of Keep a Changelog shows the very same English example (title, intro sentences, `[Unreleased]`), so a `fr` repo keeps the English preamble and headings and writes only its bullets in French. Do not translate the file. Then start tracking changes under `[Unreleased]` with the standard English change-type names (see the `committing` skill).

## 4. Append ecosystem entries

The generic `.gitignore` only covers the universal set (Claude files, OS, IDE, backups). Offer to append the entries the detected stack needs, for example:

- Node: `node_modules/`, `dist/`, `build/`, `*.log`, `*.tsbuildinfo`, `coverage/`, `.env`, `.env.local`
- Python: `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`, `dist/`, `*.egg-info/`
- Rust: `target/`
- Always, if relevant: `.env` and any secret or local database files.
- Claude Code: the template ignores `.claude/` whole. If the repo carries a `.claude/settings.json` meant to be shared (a team permission allowlist, hooks), replace the `.claude/` line with `.claude/*` followed by `!.claude/settings.json`. The `*` matters: git cannot re-include a file whose parent directory is excluded, so a bare `!` after `.claude/` does nothing. `settings.local.json` and the rest of the folder stay ignored.

## 5. Write the Repo profile marker

Add or refresh this section in the root `CLAUDE.md` (create a minimal `CLAUDE.md` if none exists). `CLAUDE.md` is gitignored, so the marker stays local. The `committing` and `releasing` skills read the literal `Lock:` and `Docs language:` tokens.

```markdown
## Repo profile (read by the github skills)

- Lock: locked   <!-- locked = feature branch + PR ; free = commit straight to main -->
- Docs language: en   <!-- en | fr -->
```

Set the two values to the profile from step 1.

**Marker-only mode.** When `committing` or `releasing` only need the profile recorded and the repo already has its other generic files, write just this section into the root `CLAUDE.md` directly; do not run the rest of this skill. Those skills do this inline, so the full scaffold is reserved for a repo that needs its generic files installed or refreshed.

## 6. Commit the scaffold

Run the `committing` checklist and commit the generic files as one `chore:` commit (subject in the docs language, for example `chore: add generic repo files`), following the lock. Keep it apart from the renormalization commit of step 2 and from any code change made in the same session, so the scaffold stays a single, revertable concern.
