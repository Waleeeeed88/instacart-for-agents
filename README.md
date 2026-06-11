# Instacart API

TypeScript backend for safe, agent-friendly Instacart.ca grocery planning over a user-authorized shared-browser controller. This service is intentionally **Instacart-native only**: the public API is `/instacart/*`, the parser is Instacart-specific, and the planner compares address-available Instacart grocery stores before recommending or mutating a cart.

## What this is / is not

- This is a local wrapper around a logged-in Instacart browser session.
- It is not the official Instacart Developer Platform and does not bypass login, pricing, substitutions, checkout review, or user authorization.
- It does not expose checkout/payment/place-order endpoints.
- Legacy `/apps/instacart/*` aliases are kept only so existing dashboards do not break; non-Instacart apps return 404.

## Safety model

- No checkout, payment, or place-order endpoint exists.
- Browser actions are limited to inspection/navigation/safe interaction helpers.
- Cart planning returns `checkoutBlocked: true` by default.
- Final ordering still requires explicit user action/authorization.
- Use Instacart.ca routes and Canadian address/store context unless explicitly changed.

## Architecture

```txt
src/
  app.ts                         # Express app factory for tests and production
  server.ts                      # Process entrypoint
  config/environment.ts          # Instacart controller env parsing
  domain/types.ts                # Instacart-native TypeScript contracts
  middleware/                    # Error and not-found handlers
  parsers/                       # Pure Instacart DOM-text parsers
  routes/instacart.routes.ts     # Native /instacart API + legacy alias
  services/                      # Controller proxy + Instacart cart planner
  utils/                         # Timeout and error helpers
SKILLS/
  instacart-grocery-planning/    # Agent grocery-planning skill
  instacart-api/                 # API operation skill
  instacart-store-discovery/     # Address-aware store comparison skill
test/
  *.test.ts                      # Node test runner + tsx
```

## Requirements

- Node.js 20+
- npm
- A local shared-browser controller for the saved Instacart profile, usually `127.0.0.1:6082`

## Install

```bash
npm ci
```

## Configure

```bash
cp .env.example .env
```

Environment variables:

- `PORT` default: `7077`
- `INSTACART_API_TIMEOUT_MS` default: `10000`
- `INSTACART_CONTROLLER_URL` default: `http://127.0.0.1:6082`

`COMMERCE_APPS=instacart=http://...` is still accepted as a transitional fallback, but the service itself is Instacart-only.

## Run

```bash
npm run build
npm start
```

Development:

```bash
npm run dev
```

## Native endpoints

- `GET /health`
- `GET /instacart/state`
- `GET /instacart/text`
- `GET /instacart/screenshot.jpg`
- `GET /instacart/vision`
- `GET /instacart/analysis`
- `GET /instacart/elements`
- `POST /instacart/goto` body `{ "url": "https://www.instacart.ca/..." }`
- `POST /instacart/click` body `{ "x": 100, "y": 200 }`
- `POST /instacart/type` body `{ "text": "hello" }`
- `POST /instacart/press` body `{ "key": "Enter" }`
- `POST /instacart/scroll` body `{ "dy": 700 }`
- `POST /instacart/reload`
- `POST /instacart/nav`
- `POST /instacart/click-near-text`
- `POST /instacart/cart-plan`

Example cart-plan request:

```bash
curl -s http://127.0.0.1:7077/instacart/cart-plan \
  -H 'content-type: application/json' \
  -d '{"maxSubtotal":250,"requireHalal":true,"preferPromotions":true,"focus":["budget","protein"],"people":2,"days":14}'
```

## Store scope

The planner scope is not hard-coded to one retailer. Before cart mutation, compare all relevant stores available for the active Instacart address, including Food Basics, Walmart, No Frills, Adonis, FreshCo, Metro, Costco, Costco Business Centre, Iqbal Foods, Real Canadian Superstore, Wholesale Club, and any other visible grocery stores for that address.

Prefer one no-markup/low-fee store unless a multi-store split clearly beats the extra fee/service complexity.

## Tests

```bash
npm test
npm run build
npm run check
```

The test suite verifies:

- Non-Instacart surfaces are rejected as `unknown` instead of parsed as another app.
- `/instacart/*` routes proxy a controller and return structured Instacart analysis.
- `/apps/instacart/*` legacy aliases still work.
- Non-Instacart `/apps/:app` routes return 404.
- Cart planning stays checkout-blocked and includes broad address-aware store scope.
