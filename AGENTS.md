# Instacart for Agents — Codex Instructions

This repository is a Codex plugin and TypeScript API for safe Instacart.ca grocery planning over a user-authorized local browser controller.

## Load order for Codex

When a task touches Instacart login, store discovery, cart analysis, cart mutation, grocery planning, or API operations, use the plugin skill:

1. `instacart-for-agents`
2. `SKILLS/instacart-phone-otp-login/SKILL.md` for not-logged-in users
3. `SKILLS/instacart-store-discovery/SKILL.md` before choosing a retailer
4. `SKILLS/instacart-grocery-planning/SKILL.md` before mutating carts
5. `SKILLS/instacart-api/SKILL.md` for endpoint details

## Hard rules

- Do not create public/shared browser links unless the user explicitly asks.
- Do not check out, place orders, submit payment, or confirm delivery.
- Do not ask for Instacart passwords. Use phone-number OTP only.
- Do not commit phone numbers, OTP codes, tokens, browser profiles, screenshots with sensitive information, or `.env` secrets.
- Before claiming a cart is ready, verify live `/instacart/analysis` or cart drawer text.

## Development commands

```bash
npm ci
npm run check
npm run build
npm test
```

## Git workflow

Use a feature branch, run `npm run check`, open a PR to `main`, and leave merging to the user unless they explicitly request merge.
