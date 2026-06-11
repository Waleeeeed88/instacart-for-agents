# Install Instacart for Agents

This repo can be used as:

1. a local TypeScript Instacart API,
2. a Codex plugin marketplace repo,
3. an npm/npx installer for Codex, Claude Code, Cursor, and GitHub Copilot repo setup.

## Fastest commands

### npm / npx

After the package is published to npm:

```bash
npx instacart-for-agents add all --repo .
```

Until it is published, use the GitHub repo directly:

```bash
npx github:Waleeeeed88/instacart-for-agents add all --repo .
```

Individual targets:

```bash
npx instacart-for-agents add codex --repo .
npx instacart-for-agents add claude --repo .
npx instacart-for-agents add cursor --repo .
npx instacart-for-agents add copilot --repo .
```

Personal/global targets where supported:

```bash
npx instacart-for-agents add codex --personal
npx instacart-for-agents add claude --personal
```

Preview without writing:

```bash
npx instacart-for-agents add all --repo . --dry-run
```

## Codex

Native Codex marketplace install:

```bash
codex plugin marketplace add Waleeeeed88/instacart-for-agents --ref main
codex /plugins
```

Then install/enable **Instacart for Agents** and invoke:

```txt
@instacart-for-agents
```

Repo-scoped npx install:

```bash
npx instacart-for-agents add codex --repo .
```

This writes:

```txt
plugins/instacart-for-agents/
.agents/plugins/marketplace.json
```

Personal Codex install:

```bash
npx instacart-for-agents add codex --personal
```

This writes:

```txt
~/.codex/plugins/instacart-for-agents/
~/.agents/plugins/marketplace.json
```

## Claude Code

This repo now includes a Claude Code plugin manifest:

```txt
.claude-plugin/plugin.json
skills/instacart-for-agents/SKILL.md
```

Load directly as a local Claude plugin while developing:

```bash
claude --plugin-dir .
```

Or install the skill into a project:

```bash
npx instacart-for-agents add claude --repo .
```

This writes:

```txt
.claude/skills/instacart-for-agents/SKILL.md
```

Personal Claude Code skill install:

```bash
npx instacart-for-agents add claude --personal
```

This writes:

```txt
~/.claude/skills/instacart-for-agents/SKILL.md
```

Use `/instacart-for-agents` in Claude Code or let Claude auto-load it when the task involves Instacart login, store discovery, or grocery planning.

## Cursor

```bash
npx instacart-for-agents add cursor --repo .
```

This writes:

```txt
.cursor/rules/instacart-for-agents.mdc
```

The rule is intentionally not `alwaysApply`; Cursor should load it for Instacart/grocery/API work.

## GitHub Copilot

```bash
npx instacart-for-agents add copilot --repo .
```

This writes or updates a managed section in:

```txt
.github/copilot-instructions.md
```

Copilot also reads `AGENTS.md` in repositories that support agent instructions, so this repo keeps both `AGENTS.md` and `.github/copilot-instructions.md` guidance.

## What the installer does not do

- It does not publish the npm package automatically.
- It does not log into Instacart.
- It does not start checkout, payment, or order placement.
- It does not store phone numbers, OTPs, API keys, or browser profiles.

## Publishing to npm

When ready, publish from a clean release commit:

```bash
npm login
npm publish --access public
```

Then users can run:

```bash
npx instacart-for-agents add all --repo .
```
