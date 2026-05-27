# skills-github

Reusable Claude Code skills for managing public GitHub repos at commit, push, and release time, plus the generic repo files every project should carry.

This repo is the single source for three skills. You copy them into a target repo's `.claude/skills/` (gitignored, local only). The skills stay generic: instead of hardcoding one project's layout, they adapt to two axes they read from the target repo.

## The two axes

Each repo is described by a `## Repo profile` section in its root `CLAUDE.md`:

```markdown
## Repo profile (read by the github skills)

- Lock: locked   <!-- locked = feature branch + PR ; free = commit straight to main -->
- Docs language: en   <!-- en | fr -->
```

- **Lock** decides the Git workflow. `locked` means `main` is protected: work on a feature branch, open a pull request, and the owner merges and publishes the Release (the human gate). `free` means commit straight to `main`.
- **Docs language** decides the language of everything written for the owner: commit messages, PR text, CHANGELOG entries, docs. `en` or `fr`.

The skill instructions themselves are in English; only the output follows the docs language. `CLAUDE.md` is gitignored, so the marker stays local and never ships.

## The three skills

- **`committing`** is the checklist to run before every commit and push: Git workflow rules (branching vs direct-to-main per the lock, conventional commits, PR body style), a keep-or-delete pass on every comment in the diff, docs updates, and tightening the `[Unreleased]` CHANGELOG section.
- **`releasing`** cuts a new version: pick the SemVer bump, bump the manifest(s) if any, promote `[Unreleased]` to a dated section, then tag and publish, following the lock (PR + owner-published Release, or direct tag on `main`). It offers the `gh` CLI for PR and Release creation while keeping the owner as the merge/publish gate in locked repos.
- **`scaffolding-repos`** scaffolds or refreshes the generic files in a repo: the `.gitignore` (ignores `CLAUDE.md`, `.claude/`, OS and IDE files), the LF-normalizing `.gitattributes`, a Keep a Changelog / SemVer `CHANGELOG.md` in the repo's single language, and the `## Repo profile` marker. It is idempotent and never clobbers existing files without showing a diff first.

## Install into a repo

Claude Code loads per-repo skills from `<repo>/.claude/skills/`. Copy the three skill folders there:

```powershell
$dest = "C:\path\to\your-repo\.claude\skills"
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item -Recurse skills\committing        $dest
Copy-Item -Recurse skills\releasing         $dest
Copy-Item -Recurse skills\scaffolding-repos $dest
```

Restart Claude Code so the skills are detected. Then, in that repo, invoke `scaffolding-repos` once to lay down the generic files and write the `## Repo profile` marker. After that, `committing` and `releasing` read the marker and adapt automatically.

When you change a skill in this repo, re-copy it into the target repos and restart Claude Code; skills are not hot-reloaded.

## Layout

```text
skills-github/
├── README.md
├── CHANGELOG.md
├── CLAUDE.md                   # gitignored, dev notes + this repo's Repo profile
├── LICENSE
├── .gitignore
├── .gitattributes
├── .github/
│   └── FUNDING.yml
└── skills/
    ├── committing/
    │   └── SKILL.md
    ├── releasing/
    │   └── SKILL.md
    └── scaffolding-repos/
        ├── SKILL.md
        └── templates/
            ├── gitignore       # renamed to .gitignore on install
            └── gitattributes   # renamed to .gitattributes on install
```

## License

MIT, see [LICENSE](LICENSE).
