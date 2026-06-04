# Commerce API

TypeScript backend for safe, agent-friendly shopping automation over shared-browser controllers. It wraps real browser sessions for Instacart, Uber Eats, and similar commerce surfaces with structured state, parsing, screenshots, and safe browser actions.

## Why this exists

Shopping sites keep cart/session state in the browser. This API does **not** pretend to be an official Instacart or Uber Eats API. It is a local, typed service that wraps a user-authorized browser controller so agents can inspect and mutate carts more reliably while the user can still watch the same session.

## Safety model

- No checkout, payment, or place-order endpoint exists.
- Browser actions are limited to inspection/navigation/safe interaction helpers.
- Cart planning always returns `checkoutBlocked: true` unless explicitly configured otherwise by the caller.
- Secrets stay in `.env`; use `.env.example` for committed configuration shape.

## Architecture

```txt
src/
  app.ts                         # Express app factory for tests and production
  server.ts                      # Process entrypoint
  config/environment.ts          # Env parsing and app-controller mapping
  domain/types.ts                # Shared TypeScript domain contracts
  middleware/                    # Error and not-found handlers
  parsers/                       # Pure DOM-text parsers for each commerce surface
  routes/                        # HTTP route composition
  services/                      # Controller proxy + cart planner
  utils/                         # Timeout and error helpers
test/
  *.test.ts                      # Node test runner + tsx
  fixtures.ts                    # Cart fixtures, including $100 halal/fat/promo case
```

## Requirements

- Node.js 20+
- npm
- One or more local shared-browser controllers, usually on `127.0.0.1:6080`

## Install

```bash
npm ci
```

## Configure

Copy the example env if needed:

```bash
cp .env.example .env
```

Environment variables:

- `PORT` default: `7077`
- `COMMERCE_API_TIMEOUT_MS` default: `10000`
- `COMMERCE_APPS` default: `shared=http://127.0.0.1:6080,instacart=http://127.0.0.1:6080,ubereats=http://127.0.0.1:6080`

`COMMERCE_APPS` format:

```txt
appName=http://controller-host:port,anotherApp=http://controller-host:port
```

## Run

```bash
npm run build
npm start
```

Development:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `GET /apps`
- `GET /apps/:app/state`
- `GET /apps/:app/text`
- `GET /apps/:app/screenshot.jpg`
- `GET /apps/:app/vision`
- `GET /apps/:app/analysis`
- `GET /apps/:app/elements`
- `POST /apps/:app/goto` body `{ "url": "https://..." }`
- `POST /apps/:app/click` body `{ "x": 100, "y": 200 }`
- `POST /apps/:app/type` body `{ "text": "hello" }`
- `POST /apps/:app/press` body `{ "key": "Enter" }`
- `POST /apps/:app/scroll` body `{ "dy": 700 }`
- `POST /apps/:app/reload`
- `POST /apps/:app/nav`
- `POST /apps/:app/click-near-text`
- `POST /apps/:app/cart-plan`

Example cart-plan request:

```bash
curl -s http://127.0.0.1:7077/apps/instacart/cart-plan   -H 'content-type: application/json'   -d '{"maxSubtotal":100,"requireHalal":true,"preferPromotions":true,"focus":["budget","fat"]}'
```

## Tests

```bash
npm test
npm run build
npm run check
```

The test suite includes a verified fixture for a **sub-$100 cheap halal Instacart cart with promotions and fat-focused anchors**:

- Halal chicken drumsticks sale anchor
- Zabiha halal ground chicken promotion
- Eggs, butter, olive oil, avocado, and full-fat yogurt as fat-focused items
- Checkout discount parsing
- Safe cart-plan response with order placement blocked

## GitHub Actions

`.github/workflows/ci.yml` runs:

```bash
npm ci
npm run check
```
