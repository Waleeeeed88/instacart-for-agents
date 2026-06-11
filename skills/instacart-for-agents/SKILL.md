---
name: instacart-for-agents
description: Operate the Instacart for Agents Codex plugin for phone OTP login, session verification, store discovery, cart analysis, and safe grocery planning.
version: 0.1.0
tags: [instacart, grocery, codex-plugin, phone-otp, cart-planning]
---

# Instacart for Agents

## Trigger

Use this skill when the user asks Codex to log into Instacart, verify an Instacart session, compare grocery stores, plan a cart, inspect a cart, or safely mutate a cart through the local Instacart API.

## What this plugin provides

- A Codex-installable plugin manifest in `.codex-plugin/plugin.json`.
- A repo marketplace entry in `.agents/plugins/marketplace.json`.
- Project skills for Instacart phone OTP login, store discovery, grocery planning, and API operation.
- A local TypeScript API that wraps a user-authorized browser controller.

## Required local services

1. Start the private Instacart browser controller with the user's saved profile:

```bash
PORT=6082 \
START_URL='https://www.instacart.ca/store/?categoryFilter=homeTabForYou' \
USER_DATA_DIR='/home/hermes/shared-browser/profile-instacart' \
HEADLESS=true \
NODE_PATH=/home/hermes/shared-browser/node_modules:/home/hermes/.hermes/hermes-agent/node_modules \
node /home/hermes/shared-browser/server.js
```

2. Start the Instacart API:

```bash
cd /home/hermes/commerce-api
INSTACART_CONTROLLER_URL=http://127.0.0.1:6082 npm run dev
```

3. Verify:

```bash
curl -fsS http://127.0.0.1:7077/health
curl -fsS http://127.0.0.1:7077/instacart/login/status
```

## Two login cases

### Case 1: user is not logged in

Most new users start here. Prefer phone-number OTP; do not ask for passwords.

```bash
curl -s http://127.0.0.1:7077/instacart/login/start \
  -H 'content-type: application/json' \
  -d '{"phoneNumber":"+15555550123"}'

# User receives the SMS OTP and gives it to the agent.
curl -s http://127.0.0.1:7077/instacart/login/otp \
  -H 'content-type: application/json' \
  -d '{"otpCode":"123456"}'

curl -s http://127.0.0.1:7077/instacart/login/status
```

After OTP submission, verify `loggedIn: true` before planning or mutating a cart. If Instacart shows extra account-security prompts, stop and ask the user to complete them manually.

### Case 2: user is already logged in

If `/instacart/login/status` returns `loggedIn: true`, continue directly:

```bash
curl -s http://127.0.0.1:7077/instacart/analysis
curl -s http://127.0.0.1:7077/instacart/cart-plan \
  -H 'content-type: application/json' \
  -d '{"maxSubtotal":250,"requireHalal":true,"preferPromotions":true,"focus":["budget","protein"],"people":2,"days":14}'
```

## Store discovery rule

Before building a cart, compare all visible Instacart.ca grocery stores for the active address. Include Food Basics, Costco, Costco Business Centre, Walmart, No Frills, Adonis, FreshCo, Metro, Iqbal Foods, Real Canadian Superstore, Wholesale Club, and any additional visible grocery store.

## Safety rules

- Never expose a public browser link unless the user explicitly asks.
- Never check out, submit payment, or place an order.
- Never store phone numbers or OTP codes in repo files.
- Treat weighted-item prices and promotions as estimates until the final cart drawer is verified.
- Report item subtotal and discount/checkout lines separately.

## Related project-local skills

If you need more detail, read:

- `SKILLS/instacart-phone-otp-login/SKILL.md`
- `SKILLS/instacart-grocery-planning/SKILL.md`
- `SKILLS/instacart-store-discovery/SKILL.md`
- `SKILLS/instacart-api/SKILL.md`
