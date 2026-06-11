---
name: instacart-phone-otp-login
description: Use the Instacart phone-number OTP login layer to handle not-logged-in browser sessions before grocery planning.
version: 1.0.0
tags: [instacart, login, phone-otp, session, browser-controller]
---

# Instacart Phone OTP Login

## Trigger

Use before cart planning when `/instacart/login/status` says `loggedIn: false`, the page shows Log in / Sign up, or the browser session is new for the user.

## Two-case model

1. **Case 1: not logged in** — most new users. Use phone-number OTP.
2. **Case 2: logged in** — continue directly to `/instacart/analysis`, store discovery, and cart planning.

## Preferred flow

```bash
curl -s http://127.0.0.1:7077/instacart/login/status
curl -s http://127.0.0.1:7077/instacart/login/start \
  -H 'content-type: application/json' \
  -d '{"phoneNumber":"+15555550123"}'
# User receives SMS code.
curl -s http://127.0.0.1:7077/instacart/login/otp \
  -H 'content-type: application/json' \
  -d '{"otpCode":"123456"}'
curl -s http://127.0.0.1:7077/instacart/login/status
```

## Rules

- Ask only for the phone number and SMS OTP code.
- Do not ask for passwords.
- Do not store phone numbers or OTPs in repo files, logs, or skills.
- Submit the phone number once, wait for the OTP state, submit the OTP once, then verify connection.
- If Instacart shows extra account/security prompts, stop and ask the user to complete them manually.
- Once `loggedIn: true`, use normal grocery planning endpoints.

## Endpoint meanings

- `GET /instacart/login/status` — returns `caseType`, `loggedIn`, `loginVisible`, `otpVisible`, and `nextAction`.
- `POST /instacart/login/start` — navigates to login and types/submits the phone number.
- `POST /instacart/login/otp` — types/submits the user-provided SMS OTP.
- Legacy aliases exist under `/apps/instacart/login/*`.
