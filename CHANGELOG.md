# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-27

### Added

- Initial release: three Claude Code skills (`committing`, `releasing`, `scaffolding-repos`) for managing public GitHub repos.
- `Repo profile` marker convention (`Lock:` and `Docs language:`) so the skills adapt to locked or free repos and to English or French docs.
- Generic templates installed by `scaffolding-repos`: a `.gitignore` (Claude, OS and IDE files), an LF `.gitattributes`, and a Keep a Changelog / SemVer `CHANGELOG.md` in the repo's single language.
