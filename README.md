# 🛒 Instacart API

<p align="center">
  <img src="https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif" width="430" alt="Instacart API Banner GIF" />
</p>

<h3 align="center">
  A safe, agent-friendly API layer for Instacart grocery planning.
</h3>

<p align="center">
  Browse smarter. Plan faster. Checkout stays in your hands.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Checkout-Blocked-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Safety-First-blue?style=for-the-badge" />
</p>

---

## 🚀 What is Instacart API?

**Instacart API** is a TypeScript backend that connects to a user-authorized Instacart browser session and exposes a clean API for grocery planning, store discovery, page analysis, and cart recommendations.

It is built for agent workflows where an AI assistant can help inspect Instacart pages, compare grocery stores, understand visible products, and generate a safe shopping plan.

> ⚠️ This project does **not** place orders or process payments.
> The final checkout always stays under the user's control.

---

## ✨ Why This Exists

<p align="center">
  <img src="https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif" width="360" alt="Planning GIF" />
</p>

Grocery shopping online can get messy fast:

* Too many stores
* Too many fees
* Confusing promotions
* Hard-to-compare prices
* Dietary restrictions
* Budget limits
* Repeated manual searching

This API gives agents a safer way to help with the planning side without touching the actual purchase step.

---

## 🧠 What It Can Do

```txt
🛒 Read visible Instacart page content
📸 Capture screenshots
🧾 Analyze products and cart state
🏬 Compare available grocery stores
🥩 Support halal-aware planning
💸 Respect budget limits
🧠 Generate cart plans
🔒 Keep checkout blocked
```

---

## 🔥 Features

| Feature                  | Status                  |
| ------------------------ | ----------------------- |
| Instacart page analysis  | ✅                       |
| Browser controller proxy | ✅                       |
| Screenshot endpoint      | ✅                       |
| Text extraction          | ✅                       |
| Store discovery          | ✅                       |
| Cart planning            | ✅                       |
| Checkout safety block    | ✅                       |
| TypeScript contracts     | ✅                       |
| Test coverage            | ✅                       |
| Payment/order automation | ❌ Intentionally blocked |

---

## 🛡️ Safety First

<p align="center">
  <img src="https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif" width="360" alt="Safety GIF" />
</p>

This project is designed around one core rule:

> **Agents can help plan groceries, but they cannot buy groceries.**

### Blocked by design

```txt
❌ No checkout endpoint
❌ No payment endpoint
❌ No place-order endpoint
❌ No bypassing login
❌ No unauthorized scraping
❌ No hidden purchases
```

### Allowed

```txt
✅ Read page state
✅ Analyze visible items
✅ Compare stores
✅ Suggest products
✅ Build a cart plan
✅ Let the user make the final choice
```

---

## 🏗️ How It Works

```txt
User opens Instacart.ca
        ↓
Shared browser controller sees the page
        ↓
Instacart API exposes safe endpoints
        ↓
Agent reads, analyzes, and plans
        ↓
User reviews and controls checkout
```

---

## 📦 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=ts,nodejs,express,npm,git,github" />
</p>

| Layer        | Tool                      |
| ------------ | ------------------------- |
| Language     | TypeScript                |
| Runtime      | Node.js                   |
| Server       | Express                   |
| Testing      | Node test runner + tsx    |
| API Style    | REST                      |
| Safety Model | Checkout-blocked planning |

---

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Waleeeeed88/instacart-api.git
cd instacart-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

```bash
cp .env.example .env
```

Example `.env`:

```env
PORT=7077
INSTACART_API_TIMEOUT_MS=10000
INSTACART_CONTROLLER_URL=http://127.0.0.1:6082
```

### 4. Run the dev server

```bash
npm run dev
```

### 5. Check health

```bash
curl http://127.0.0.1:7077/health
```

Expected response:

```json
{
  "ok": true
}
```

---

## 🧭 API Routes

### Health

```http
GET /health
```

Returns API status.

---

### Browser State

```http
GET /instacart/state
```

Returns the current browser/page state.

---

### Visible Text

```http
GET /instacart/text
```

Returns visible page text from the active Instacart session.

---

### Screenshot

```http
GET /instacart/screenshot.jpg
```

Returns a screenshot of the current browser view.

---

### Page Analysis

```http
GET /instacart/analysis
```

Returns structured analysis of the current Instacart page.

---

### Interactive Elements

```http
GET /instacart/elements
```

Returns visible interactive page elements.

---

### Navigate

```http
POST /instacart/goto
```

Navigate the controlled browser to an Instacart URL.

---

### Click

```http
POST /instacart/click
```

Click a coordinate in the browser.

---

### Type

```http
POST /instacart/type
```

Type into the active browser page.

---

### Scroll

```http
POST /instacart/scroll
```

Scroll through the page.

---

### Cart Plan

```http
POST /instacart/cart-plan
```

Generate a safe grocery cart plan.

---

## 🛒 Example Cart Plan

```bash
curl -s http://127.0.0.1:7077/instacart/cart-plan \
  -H "content-type: application/json" \
  -d '{
    "maxSubtotal": 250,
    "requireHalal": true,
    "preferPromotions": true,
    "focus": ["budget", "protein"],
    "people": 2,
    "days": 14
  }'
```

Example request:

```json
{
  "maxSubtotal": 250,
  "requireHalal": true,
  "preferPromotions": true,
  "focus": ["budget", "protein"],
  "people": 2,
  "days": 14
}
```

Example planning logic:

```txt
🥩 Prioritize halal-friendly proteins
💸 Stay under the target subtotal
🏷️ Prefer promotions where possible
🧺 Build a useful cart structure
🛑 Keep checkout blocked
```

---

## 🏬 Store Discovery

<p align="center">
  <img src="https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif" width="360" alt="Store GIF" />
</p>

The API can help compare visible stores available to the active Instacart address.

Possible stores include:

```txt
🏬 Walmart
🏬 Food Basics
🏬 No Frills
🏬 FreshCo
🏬 Metro
🏬 Costco
🏬 Costco Business Centre
🏬 Real Canadian Superstore
🏬 Iqbal Foods
🏬 Adonis
🏬 Wholesale Club
🏬 Other visible Instacart stores
```

The planner usually prefers a single low-fee or no-markup store unless splitting across stores clearly makes sense.

---

## 📂 Project Structure

```txt
instacart-api/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   └── environment.ts
│   │
│   ├── domain/
│   │   └── types.ts
│   │
│   ├── middleware/
│   │   ├── error.ts
│   │   └── not-found.ts
│   │
│   ├── parsers/
│   │   └── instacart.parser.ts
│   │
│   ├── routes/
│   │   └── instacart.routes.ts
│   │
│   ├── services/
│   │   ├── controller.service.ts
│   │   └── cart-planner.service.ts
│   │
│   └── utils/
│       ├── errors.ts
│       └── timeout.ts
│
├── test/
│   └── *.test.ts
│
├── SKILLS/
│   ├── instacart-api/
│   ├── instacart-grocery-planning/
│   └── instacart-store-discovery/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing

Run all tests:

```bash
npm test
```

Build the project:

```bash
npm run build
```

Run checks:

```bash
npm run check
```

The test suite checks that:

```txt
✅ Instacart routes behave correctly
✅ Non-Instacart apps are rejected
✅ Controller proxy calls work
✅ Cart planning stays safe
✅ Checkout remains blocked
✅ Store discovery stays address-aware
```

---

## 🧑‍🍳 Example Agent Flow

```txt
1. User opens Instacart.ca
2. API reads visible stores
3. Agent compares grocery options
4. Agent builds a budget-aware cart plan
5. User reviews suggestions
6. User manually decides what to buy
```

---

## 🧠 Use Cases

```txt
🛒 AI grocery planning
🥩 Halal-aware cart building
💰 Budget grocery optimization
🏬 Store comparison
📸 Browser screenshot analysis
🧾 Cart review tools
🤖 Agent-commerce experiments
🇨🇦 Instacart.ca grocery workflows
```

---

## 🌱 Roadmap

```txt
✅ Instacart-native API routes
✅ Shared browser controller integration
✅ Page text and screenshot support
✅ Safe cart planner
✅ Store discovery logic
🚧 Better nutrition-aware recommendations
🚧 Smarter promotion detection
🚧 Improved product categorization
🚧 More structured cart summaries
🚧 Better agent skill documentation
```

---

## ⚠️ Important Disclaimer

This is an independent project and is not affiliated with, endorsed by, or sponsored by Instacart.

It is designed for user-authorized browsing and safe grocery planning only.

---

## 👤 Author

Built by **Mohammad Waliduddin**

<p>
  <a href="https://github.com/Waleeeeed88">
    <img src="https://img.shields.io/badge/GitHub-Waleeeeed88-181717?style=for-the-badge&logo=github" />
  </a>
</p>

---

## ⭐ Show Support

If this project helped you, inspired you, or made grocery planning feel more futuristic, drop a star.

<p align="center">
  <img src="https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" width="330" alt="Star GIF" />
</p>

<p align="center">
  <b>Plan smarter. Shop safer. Stay in control.</b>
</p>

<p align="center">
  🛒 ⚡ 🧠 🔒 🇨🇦
</p>
