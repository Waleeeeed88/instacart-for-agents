<!-- instacart-for-agents:start -->
# Instacart for Agents — GitHub Copilot Instructions

Use these instructions when reviewing, editing, or generating code in this repository.

## Repository purpose

This repository is a safe Instacart.ca agent layer and TypeScript API for browser-assisted grocery planning. It is also an installable agent package published on npm as `instacart-for-agents@1.1.0`.

## Core safety rules

- Never implement checkout, payment, place-order, delivery-confirmation, or purchase-submission automation.
- Never ask for or store Instacart passwords. Use phone-number OTP only when login is required.
- Never commit phone numbers, OTP codes, API tokens, cookies, browser profiles, screenshots with sensitive account data, or `.env` secrets.
- Keep all purchase-finalization actions user-controlled and outside the automation boundary.

## Instacart workflow expectations

- First classify the browsing session: already logged in vs not logged in.
- Verify `GET /instacart/login/status` before store discovery, cart analysis, or cart planning.
- For not-logged-in users, use the phone OTP flow through `/instacart/login/start` and `/instacart/login/otp`.
- Compare all visible address-available Instacart.ca stores before choosing a retailer, including Costco when available.
- Prefer cheap, high-protein, halal-aware grocery planning unless the user gives different constraints.
- Treat weighted items, substitutions, service fees, tips, taxes, deposits, and delivery fees as estimates unless verified live.

## Relevant API endpoints

- `GET /instacart/login/status`
- `POST /instacart/login/start`
- `POST /instacart/login/otp`
- `POST /instacart/analysis`
- `POST /instacart/cart-plan`

## Development standards

- Keep the framework Instacart-native; avoid generic commerce abstractions unless there is a clear compatibility reason.
- Update tests when changing installer behavior, plugin manifests, rules, or safety semantics.
- Run `npm run check` before proposing a merge.
- If changing package contents, also run `npm pack --dry-run --json` and verify expected integration files are included.
<!-- instacart-for-agents:end -->
