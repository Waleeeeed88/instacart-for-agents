import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import assert from 'node:assert/strict';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const cli = path.join(root, 'bin/instacart-for-agents.js');

async function tempRepo(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'instacart-agents-install-'));
}

test('installer CLI exposes npm/npx-friendly help text', async () => {
  const { stdout } = await execFileAsync(process.execPath, [cli, '--help'], { cwd: root });

  assert.match(stdout, /npx instacart-for-agents add <target>/);
  assert.match(stdout, /codex plugin marketplace add Waleeeeed88\/instacart-for-agents --ref main/);
  assert.match(stdout, /Targets:/);
});

test('installer CLI writes Codex, Claude, Cursor, and Copilot repo files', async () => {
  const repo = await tempRepo();
  try {
    const { stdout } = await execFileAsync(process.execPath, [cli, 'add', 'all', '--repo', repo], { cwd: root });
    assert.match(stdout, /Installed Instacart for Agents for all/);

    const marketplacePath = path.join(repo, '.agents/plugins/marketplace.json');
    const marketplace = JSON.parse(await readFile(marketplacePath, 'utf8')) as {
      plugins: Array<{ name: string; source: { source: string; path: string } }>;
    };
    assert.equal(marketplace.plugins[0]?.name, 'instacart-for-agents');
    assert.equal(marketplace.plugins[0]?.source.source, 'local');
    assert.equal(marketplace.plugins[0]?.source.path, './plugins/instacart-for-agents');

    assert.equal(existsSync(path.join(repo, 'plugins/instacart-for-agents/.codex-plugin/plugin.json')), true);
    assert.equal(existsSync(path.join(repo, 'plugins/instacart-for-agents/.claude-plugin/plugin.json')), true);
    assert.equal(existsSync(path.join(repo, '.claude/skills/instacart-for-agents/SKILL.md')), true);
    assert.equal(existsSync(path.join(repo, '.cursor/rules/instacart-for-agents.mdc')), true);
    const cursorRule = await readFile(path.join(repo, '.cursor/rules/instacart-for-agents.mdc'), 'utf8');
    const canonicalCursorRule = await readFile(path.join(root, '.cursor/rules/instacart-for-agents.mdc'), 'utf8');
    assert.equal(cursorRule, canonicalCursorRule);
    assert.match(cursorRule, /alwaysApply: false/);
    assert.match(cursorRule, /Never implement or trigger checkout/);

    const copilot = await readFile(path.join(repo, '.github/copilot-instructions.md'), 'utf8');
    const canonicalCopilot = await readFile(path.join(root, '.github/copilot-instructions.md'), 'utf8');
    assert.equal(copilot, canonicalCopilot);
    assert.match(copilot, /instacart-for-agents:start/);
    assert.match(copilot, /instacart-for-agents@1\.1\.0/);
    assert.match(copilot, /phone-number OTP/);
    assert.match(copilot, /Never implement checkout/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test('installer CLI supports dry-run without creating files', async () => {
  const repo = await tempRepo();
  try {
    const { stdout } = await execFileAsync(process.execPath, [cli, 'add', 'codex', '--repo', repo, '--dry-run'], { cwd: root });
    assert.match(stdout, /Dry run:/);
    assert.equal(existsSync(path.join(repo, '.agents/plugins/marketplace.json')), false);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});
