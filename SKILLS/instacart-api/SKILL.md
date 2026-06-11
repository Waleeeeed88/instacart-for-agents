---
name: instacart-api
description: Operate and extend the Instacart-native TypeScript API wrapper over a local shared-browser controller.
version: 1.0.0
tags: [instacart, api, typescript, express, browser-controller]
---

# Instacart API Operations

## Purpose

This repository is an Instacart-native API, not a generic commerce API. It wraps a logged-in Instacart.ca browser controller and exposes typed, safe endpoints for state, text, screenshots, analysis, and cart planning.

## Controller setup

Default controller:

```bash
PORT=6082 \
START_URL='https://www.instacart.ca/store/?categoryFilter=homeTabForYou' \
USER_DATA_DIR='/home/hermes/shared-browser/profile-instacart' \
HEADLESS=true \
NODE_PATH=/home/hermes/shared-browser/node_modules:/home/hermes/.hermes/hermes-agent/node_modules \
node /home/hermes/shared-browser/server.js
```

API server:

```bash
cd /home/hermes/commerce-api
INSTACART_CONTROLLER_URL=http://127.0.0.1:6082 npm run dev
```

## Native endpoints

Use `/instacart/*`:

- `GET /health`
- `GET /instacart/state`
- `GET /instacart/text`
- `GET /instacart/screenshot.jpg`
- `GET /instacart/elements`
- `GET /instacart/analysis`
- `GET /instacart/vision`
- `POST /instacart/goto`
- `POST /instacart/click`, `/type`, `/press`, `/scroll`, `/reload`, `/nav`, `/click-near-text`
- `POST /instacart/cart-plan`

Legacy `/apps/instacart/*` aliases exist only for old dashboards. Do not add other app adapters here.

## Safety invariants

- No checkout/payment/place-order route.
- `cart-plan` must default to `checkoutBlocked: true`.
- Non-Instacart surfaces should analyze as `unknown` instead of falling through to another parser.
- Keep user credentials inside the browser profile, never in API logs or repo files.

## Verification

Run:

```bash
npm run check
```

Before reporting a cart task complete, also hit a live controller if available:

```bash
curl -s http://127.0.0.1:7077/health
curl -s http://127.0.0.1:7077/instacart/analysis
```
