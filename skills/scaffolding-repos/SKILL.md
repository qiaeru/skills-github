---
name: scaffolding-repos
description: Scaffold or refresh the generic files of the owner's public GitHub repos. Use when starting or normalizing a repo: install the generic .gitignore (Claude, OS and IDE files), the LF .gitattributes, a Keep a Changelog / SemVer CHANGELOG.md, and the Repo profile marker the other github skills read.
---

# Repo setup

Install or refresh the four things every one of the owner's repos should carry: a generic
`.gitignore`, an LF-normalizing `.gitattributes`, a `CHANGELOG.md` (Keep a Changelog +
SemVer), and the `## Repo profile` marker in the root `CLAUDE.md`.

**Idempotent and non-destructive.** If a file already exists, show a diff of what you would
change and ask before writing. Never clobber an existing `CHANGELOG.md` or hand-tuned
`.gitignore`; merge missing entries in instead.

## 1. Determine the profile

Decide two things, asking the owner if they are not already obvious:

- **Lock**: `locked` (protected `main`, feature branch + PR, owner merges and publishes) or
  `free` (commit straight to `main`).
- **Docs language**: `en` or `fr`.

## 2. Write `.gitignore` and `.gitattributes`

These two files live next to this skill, in `templates/`. Copy and rename:

- `templates/gitignore` -> `.gitignore`
- `templates/gitattributes` -> `.gitattributes`

The rules are identical in every language; only the comments differ. The template comments
are English. For a `fr` repo, swap each comment line using this table:

| English comment                                                  | French comment                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| `# Claude Code working files, local to the dev machine.`         | `# Fichiers de travail Claude Code, internes au poste de développement.` |
| `# Operating systems.`                                           | `# Systèmes d'exploitation.`                                         |
| `# Editors and IDEs.`                                            | `# Éditeurs et IDE.`                                                 |
| `# Backups and temporary files.`                                 | `# Sauvegardes et fichiers temporaires.`                            |
| `# Normalize line endings to LF for every text file, any OS.`    | `# Normalise les fins de ligne en LF pour tout fichier texte, quel que soit l'OS.` |
| `# Binary assets: never touch these even if git guesses wrong.`  | `# Fichiers binaires : git n'y touche jamais, même s'il se trompe.` |

## 3. Create `CHANGELOG.md`

If there is no `CHANGELOG.md`, create one from the boilerplate for the docs language. The
repo is mono-language: write only one language, never both. Then start tracking changes under
`[Unreleased]` with the localized change-type names (see the `committing` skill).

`en`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

`fr`:

```markdown
# Journal des modifications

Toutes les modifications notables apportées à ce projet seront consignées dans ce fichier.

Le format suit la convention [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/).

## [Unreleased]
```

## 4. Append ecosystem entries

The generic `.gitignore` only covers the universal set (Claude files, OS, IDE, backups).
Offer to append the entries the detected stack needs, for example:

- Node: `node_modules/`, `dist/`, `build/`, `*.log`, `*.tsbuildinfo`, `coverage/`, `.env`,
  `.env.local`
- Python: `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`, `dist/`, `*.egg-info/`
- Always, if relevant: `.env` and any secret or local database files.

## 5. Write the Repo profile marker

Add or refresh this section in the root `CLAUDE.md` (create a minimal `CLAUDE.md` if none
exists). `CLAUDE.md` is gitignored, so the marker stays local. The `committing` and
`releasing` skills read the literal `Lock:` and `Docs language:` tokens.

```markdown
## Repo profile (read by the github skills)

- Lock: locked   <!-- locked = feature branch + PR ; free = commit straight to main -->
- Docs language: en   <!-- en | fr -->
```

Set the two values to the profile from step 1.
