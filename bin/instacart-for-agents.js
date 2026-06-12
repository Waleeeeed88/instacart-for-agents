#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN_NAME = 'instacart-for-agents';
const DISPLAY_NAME = 'Instacart for Agents';
const REPO_SLUG = 'Waleeeeed88/instacart-for-agents';
const MARKER_START = '<!-- instacart-for-agents:start -->';
const MARKER_END = '<!-- instacart-for-agents:end -->';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

function usage() {
  console.log(`Instacart for Agents installer

Usage:
  npx instacart-for-agents add <target> [options]
  npx instacart-for-agents install <target> [options]

Targets:
  codex     Add Codex plugin marketplace metadata
  claude    Add Claude Code skill
  cursor    Add Cursor rule
  copilot   Add GitHub Copilot repository instructions
  all       Add codex + claude + cursor + copilot repo files

Options:
  --repo <path>       Target repository path (default: current directory)
  --personal          Install personal/global targets where supported (Codex, Claude)
  --dry-run           Print planned writes without changing files
  --force             Overwrite existing managed files
  --help              Show this help

Examples:
  npx instacart-for-agents add codex --repo .
  npx instacart-for-agents add all --repo .
  npx instacart-for-agents add codex --personal
  npx instacart-for-agents add claude --personal

Native Codex marketplace command after this repo is merged:
  codex plugin marketplace add ${REPO_SLUG} --ref main
  codex /plugins
`);
}

if (command === 'help' || command === '--help' || command === '-h') {
  usage();
  process.exit(0);
}

if (!['add', 'install'].includes(command)) {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(2);
}

const target = args[1] ?? 'all';
const options = parseOptions(args.slice(2));
if (options.help) {
  usage();
  process.exit(0);
}

const repoRoot = resolve(options.repo ?? process.cwd());
const dryRun = options.dryRun;
const force = options.force;
const planned = [];

if (!['all', 'codex', 'claude', 'cursor', 'copilot'].includes(target)) {
  console.error(`Unknown target: ${target}`);
  usage();
  process.exit(2);
}

if (target === 'all' || target === 'codex') addCodex();
if (target === 'all' || target === 'claude') addClaude();
if (target === 'all' || target === 'cursor') addCursor();
if (target === 'all' || target === 'copilot') addCopilot();

if (dryRun) {
  console.log(`Dry run: ${planned.length} planned write(s).`);
} else {
  console.log(`Installed ${DISPLAY_NAME} for ${target}.`);
}
for (const item of planned) console.log(`${dryRun ? 'would write' : 'wrote'} ${item}`);

function parseOptions(values) {
  const parsed = { repo: undefined, personal: false, dryRun: false, force: false, help: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--repo') {
      parsed.repo = values[index + 1];
      index += 1;
    } else if (value?.startsWith('--repo=')) {
      parsed.repo = value.slice('--repo='.length);
    } else if (value === '--personal' || value === '--global') {
      parsed.personal = true;
    } else if (value === '--dry-run') {
      parsed.dryRun = true;
    } else if (value === '--force') {
      parsed.force = true;
    } else if (value === '--help' || value === '-h') {
      parsed.help = true;
    } else {
      console.error(`Unknown option: ${value}`);
      process.exit(2);
    }
  }
  return parsed;
}

function addCodex() {
  if (options.personal) {
    const home = homedir();
    const pluginDir = join(home, '.codex/plugins', PLUGIN_NAME);
    copyPluginBundle(pluginDir);
    const marketplacePath = join(home, '.agents/plugins/marketplace.json');
    mergeMarketplace(marketplacePath, `./.codex/plugins/${PLUGIN_NAME}`);
    return;
  }

  const pluginDir = join(repoRoot, 'plugins', PLUGIN_NAME);
  copyPluginBundle(pluginDir);
  const marketplacePath = join(repoRoot, '.agents/plugins/marketplace.json');
  mergeMarketplace(marketplacePath, `./plugins/${PLUGIN_NAME}`);
}

function addClaude() {
  const baseDir = options.personal ? homedir() : repoRoot;
  const claudeSkillDir = join(baseDir, '.claude/skills', PLUGIN_NAME);
  const skill = renderClaudeSkill();
  writeManaged(join(claudeSkillDir, 'SKILL.md'), skill);
}

function addCursor() {
  if (options.personal) throw new Error('Cursor install is repository-scoped. Use --repo <path> without --personal.');
  writeManaged(join(repoRoot, '.cursor/rules/instacart-for-agents.mdc'), renderCursorRule());
}

function addCopilot() {
  if (options.personal) throw new Error('GitHub Copilot instructions are repository-scoped. Use --repo <path> without --personal.');
  const file = join(repoRoot, '.github/copilot-instructions.md');
  upsertMarkedSection(file, renderCopilotInstructions());
}

function copyPluginBundle(destination) {
  const entries = [
    ['.codex-plugin', '.codex-plugin'],
    ['.claude-plugin', '.claude-plugin'],
    ['.cursor', '.cursor'],
    ['skills', 'skills'],
    ['SKILLS', 'SKILLS'],
    ['AGENTS.md', 'AGENTS.md'],
    ['README.md', 'README.md'],
    ['package.json', 'package.json'],
  ];
  for (const [from, to] of entries) {
    const source = join(PACKAGE_ROOT, from);
    if (!existsSync(source)) continue;
    copyManaged(source, join(destination, to));
  }
}

function mergeMarketplace(marketplacePath, sourcePath) {
  const marketplace = existsSync(marketplacePath)
    ? JSON.parse(readFileSync(marketplacePath, 'utf8'))
    : { name: 'local-agent-plugins', interface: { displayName: 'Local Agent Plugins' }, plugins: [] };

  marketplace.name ??= 'local-agent-plugins';
  marketplace.interface ??= { displayName: 'Local Agent Plugins' };
  marketplace.plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];

  const entry = {
    name: PLUGIN_NAME,
    source: { source: 'local', path: sourcePath },
    policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
    category: 'Productivity',
  };
  const index = marketplace.plugins.findIndex((plugin) => plugin?.name === PLUGIN_NAME);
  if (index >= 0) marketplace.plugins[index] = entry;
  else marketplace.plugins.push(entry);

  writeManaged(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`);
}

function renderClaudeSkill() {
  const source = readFileSync(join(PACKAGE_ROOT, 'skills/instacart-for-agents/SKILL.md'), 'utf8');
  return `${source.trim()}\n\n## Claude Code install note\n\nThis skill was installed by \`npx instacart-for-agents add claude\`. Invoke it with \`/instacart-for-agents\` or let Claude load it when the task involves Instacart login, grocery planning, or cart analysis.\n`;
}

function renderCursorRule() {
  const cursorRulePath = join(PACKAGE_ROOT, '.cursor/rules/instacart-for-agents.mdc');
  if (existsSync(cursorRulePath)) return readFileSync(cursorRulePath, 'utf8');

  return `---\ndescription: Use Instacart for Agents for Instacart login, store discovery, cart analysis, and safe grocery planning.\nglobs:\nalwaysApply: false\n---\n\n# Instacart for Agents\n\nUse this rule when working on Instacart login, grocery planning, cart analysis, store comparison, or the Instacart API layer.\n\n- Preferred login path: phone-number OTP only. Do not ask for passwords.\n- First classify the session: not logged in vs already logged in.\n- For not-logged-in users, use phone OTP and verify connection before planning.\n- Compare all visible address-available Instacart.ca grocery stores before choosing a store.\n- Never check out, place orders, submit payment, or confirm delivery.\n- Relevant endpoints: /instacart/login/status, /instacart/login/start, /instacart/login/otp, /instacart/analysis, /instacart/cart-plan.\n`;
}

function renderCopilotInstructions() {
  return `${MARKER_START}\n# Instacart for Agents\n\nWhen working in this repository, treat it as a safe Instacart.ca agent layer and Codex plugin.\n\n- Use phone-number OTP for login; never ask for Instacart passwords.\n- Separate the two login cases: not logged in vs already logged in.\n- Verify /instacart/login/status before store discovery or cart planning.\n- Compare all visible address-available Instacart.ca grocery stores, including Costco when available.\n- Never implement checkout, payment, place-order, or delivery-confirmation automation.\n- Run npm run check before proposing merge.\n${MARKER_END}\n`;
}

function upsertMarkedSection(file, section) {
  let next = section;
  if (existsSync(file)) {
    const current = readFileSync(file, 'utf8');
    const pattern = new RegExp(`${escapeRegExp(MARKER_START)}[\\s\\S]*?${escapeRegExp(MARKER_END)}\\n?`, 'm');
    next = pattern.test(current)
      ? current.replace(pattern, section)
      : `${current.trimEnd()}\n\n${section}`;
  }
  writeManaged(file, next);
}

function copyManaged(source, destination) {
  if (dryRun) {
    planned.push(destination);
    return;
  }
  if (existsSync(destination) && !force) {
    // Directories are refreshed file-by-file by cpSync; for individual files, keep idempotent overwrite for managed plugin content.
  }
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true, errorOnExist: false });
  planned.push(destination);
}

function writeManaged(file, content) {
  if (dryRun) {
    planned.push(file);
    return;
  }
  if (existsSync(file) && !force) {
    const existing = readFileSync(file, 'utf8');
    if (existing === content) {
      planned.push(file);
      return;
    }
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
  planned.push(file);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
