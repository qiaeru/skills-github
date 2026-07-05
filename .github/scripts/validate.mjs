// Checks the repo invariants that break silently, complementing the
// "plugin validate" run by the workflow. Runs locally with
// "node .github/scripts/validate.mjs" from the repo root.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const errors = [];
const report = (file, line, message) =>
  errors.push(line ? `${file}:${line} ${message}` : `${file} ${message}`);

const read = (file) => readFileSync(file, 'utf8');

// Prose covered by the link and punctuation checks. CLAUDE.md is gitignored
// and LICENSE is fixed legal text, so neither is in scope.
const proseFiles = ['README.md', 'CHANGELOG.md'];
const collectMarkdown = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collectMarkdown(p);
    else if (entry.name.endsWith('.md')) proseFiles.push(p);
  }
};
collectMarkdown('skills');

// 1. Frontmatter of each SKILL.md: name equal to the folder, description
// present and under 300 characters. The runtime only reads these two fields.
for (const skillName of readdirSync('skills')) {
  const dir = path.join('skills', skillName);
  if (!statSync(dir).isDirectory()) continue;
  const file = path.join(dir, 'SKILL.md');
  if (!existsSync(file)) {
    report(dir, null, 'missing SKILL.md');
    continue;
  }
  const block = read(file).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) {
    report(file, 1, 'missing frontmatter');
    continue;
  }
  const fields = {};
  for (const line of block[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  if (fields.name !== skillName) {
    report(file, 2, `name "${fields.name}" does not match folder "${skillName}"`);
  }
  if (!fields.description) {
    report(file, 3, 'description missing from the frontmatter');
  } else if ([...fields.description].length >= 300) {
    report(file, 3, `description is ${[...fields.description].length} characters, must stay under 300`);
  }
}

// 2. Relative links: every target exists, and a link written from a skill
// folder stays confined to it, since the manual install only copies that
// folder.
const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)\)/g;
for (const file of proseFiles) {
  const text = read(file);
  for (const m of text.matchAll(LINK_PATTERN)) {
    const target = m[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const line = text.slice(0, m.index).split('\n').length;
    const resolved = path.resolve(path.dirname(file), target);
    if (!existsSync(resolved)) {
      report(file, line, `dead link to ${target}`);
      continue;
    }
    const segments = file.split(path.sep);
    if (segments[0] === 'skills' && segments.length > 2) {
      const skillDir = path.resolve(segments[0], segments[1]);
      if (!resolved.startsWith(skillDir + path.sep) && resolved !== skillDir) {
        report(file, line, `link to ${target}, outside the skill's installable folder`);
      }
    }
  }
}

// 3. The repo's own markdown style: no em-dash or en-dash in prose (regular
// hyphens are fine). Syntactic exceptions: frontmatter, code fences and
// spans, link targets, URLs.
for (const file of proseFiles) {
  const lines = read(file).split(/\r?\n/);
  let inFence = false;
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (i === 0 && raw === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (raw === '---') inFrontmatter = false;
      continue;
    }
    if (/^\s*(```|~~~)/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const cleaned = raw
      .replace(/`[^`]*`/g, '')
      .replace(/\]\([^)]*\)/g, ']')
      .replace(/https?:\/\/\S+/g, '');
    if (/[—–]/.test(cleaned)) {
      report(file, i + 1, 'em-dash or en-dash in prose, replace with a period, colon, comma, or parentheses');
    }
  }
}

// 4. The plugin version follows the latest released version in the CHANGELOG,
// the agreement that a manual release lets drift first.
const manifest = JSON.parse(read('.claude-plugin/plugin.json'));
const released = read('CHANGELOG.md').match(/^## \[(\d+\.\d+\.\d+)\]/m);
if (!released) {
  report('CHANGELOG.md', null, 'no released version found');
} else if (manifest.version !== released[1]) {
  report(
    '.claude-plugin/plugin.json',
    null,
    `version ${manifest.version} differs from the latest released version ${released[1]} in the CHANGELOG`,
  );
}

if (errors.length > 0) {
  console.error(`${errors.length} invariant error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`Invariants checked over ${proseFiles.length} files: frontmatter, links, punctuation, version.`);
