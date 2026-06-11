import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8')) as T;
}

test('Codex plugin manifest follows the expected installable shape', async () => {
  const plugin = await readJson<{
    name?: string;
    version?: string;
    description?: string;
    skills?: string;
    interface?: { displayName?: string; category?: string };
  }>('.codex-plugin/plugin.json');

  assert.equal(plugin.name, 'instacart-for-agents');
  assert.match(plugin.version ?? '', /^\d+\.\d+\.\d+/);
  assert.match(plugin.description ?? '', /Instacart/i);
  assert.equal(plugin.skills, './skills/');
  assert.equal(plugin.interface?.displayName, 'Instacart for Agents');
  assert.equal(plugin.interface?.category, 'Productivity');

  const codexPluginFiles = await readdir(path.join(root, '.codex-plugin'));
  assert.deepEqual(codexPluginFiles.sort(), ['plugin.json']);

  const pluginSkill = await readFile(path.join(root, 'skills/instacart-for-agents/SKILL.md'), 'utf8');
  assert.match(pluginSkill, /phone-number OTP/i);
  assert.match(pluginSkill, /Never check out/i);
  assert.match(pluginSkill, /SKILLS\/instacart-phone-otp-login\/SKILL.md/);
});

test('repo marketplace exposes the Codex plugin from the repository root', async () => {
  const marketplace = await readJson<{
    name?: string;
    interface?: { displayName?: string };
    plugins?: Array<{
      name?: string;
      source?: { source?: string; path?: string };
      policy?: { installation?: string; authentication?: string };
      category?: string;
    }>;
  }>('.agents/plugins/marketplace.json');

  assert.equal(marketplace.name, 'instacart-for-agents-marketplace');
  assert.equal(marketplace.interface?.displayName, 'Instacart for Agents');
  assert.equal(marketplace.plugins?.length, 1);

  const entry = marketplace.plugins?.[0];
  assert.equal(entry?.name, 'instacart-for-agents');
  assert.equal(entry?.source?.source, 'local');
  assert.equal(entry?.source?.path, './');
  assert.equal(entry?.policy?.installation, 'AVAILABLE');
  assert.equal(entry?.policy?.authentication, 'ON_INSTALL');
  assert.equal(entry?.category, 'Productivity');
});
