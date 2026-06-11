# 🛒 Instacart API Layer

<p align="center">
  <img src="https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif" width="420" alt="Agent planning groceries gif" />
</p>

<h3 align="center">
  A safe grocery-planning layer for browser agents.
</h3>

<p align="center">
  Built for agents that can read, reason, compare stores, and help users plan groceries — without ever checking out.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Agent_Layer-Instacart-43B02A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Checkout-Blocked-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Hermes-Supported-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OpenClaw-Supported-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Nanobot-Supported-00AEEF?style=for-the-badge" />
</p>

---

## 🧠 What This Is

**Instacart API Layer** is not a normal app for people to manually run.

It is a **tool layer for agents**.

Agents can use this layer to understand the active Instacart browsing session, read page state, inspect visible grocery options, compare stores, and build safer grocery plans for the user.

The goal is simple:

```txt
Let agents help users plan groceries.
Never let agents complete purchases.
```

---

## 🤖 Supported Agents

For now, this layer is designed for:

| Agent        |                          Status | Purpose                                           |
| ------------ | ------------------------------: | ------------------------------------------------- |
| 🧠 Hermes    |                     ✅ Supported | Grocery planning, page reasoning, cart analysis   |
| 🦞 OpenClaw  |                     ✅ Supported | Browser-control workflows and store comparison    |
| 🤖 Nanobot   |                     ✅ Supported | Lightweight task execution and grocery assistance |
| Other agents | 🚧 Not officially supported yet | May work later                                    |

---

## 🛒 What Agents Can Use This For

<p align="center">
  <img src="https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif" width="360" alt="Planning gif" />
</p>

Agents can use this layer to:

| Capability               | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| 🧾 Read Instacart pages  | Understand visible page text, products, stores, and cart details |
| 📸 Inspect screenshots   | Use browser screenshots for visual reasoning                     |
| 🏬 Discover stores       | Compare Instacart stores available to the user’s address         |
| 🛍️ Analyze carts        | Understand what is already in the cart                           |
| 🥩 Respect dietary needs | Support halal-aware or restriction-aware grocery planning        |
| 💸 Follow budgets        | Build cart suggestions around a target subtotal                  |
| 🧠 Generate plans        | Suggest what to add, avoid, replace, or compare                  |
| 🔒 Keep checkout safe    | Block purchase completion by design                              |

---

## 🚫 What Agents Must Not Do

This layer is intentionally restricted.

Agents must **not**:

```txt
❌ Place orders
❌ Start checkout
❌ Submit payment
❌ Confirm delivery
❌ Save or change payment methods
❌ Bypass login
❌ Pretend to be the user
❌ Buy items without review
```

The user must always remain in control of the final purchase.

---

## 🧭 Agent Mental Model

```txt
Instacart browser session
        ↓
Agent reads current grocery context
        ↓
Agent compares stores/products/cart
        ↓
Agent creates a safe grocery plan
        ↓
User reviews and decides
        ↓
Checkout remains manual
```

Agents should treat this layer as a **planning and reasoning interface**, not as a shopping automation system.

---

## 🧩 How Agents Should Think About the Layer

This layer exists to answer questions like:

```txt
What store is the user currently viewing?
What products are visible?
What is already in the cart?
Are prices, promotions, or fees visible?
Is the cart within budget?
Are there halal-friendly options?
Would another visible store be better?
What should the user review before checkout?
```

It should not be used to answer:

```txt
Can I complete the order?
Can I pay for this?
Can I skip user confirmation?
Can I bypass Instacart restrictions?
```

The answer to all of those is **no**.

---

## 🧠 Agent Workflow

<p align="center">
  <img src="https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif" width="360" alt="Agent thinking gif" />
</p>

Recommended flow:

| Step | Agent Action                      | Goal                                                 |
| ---: | --------------------------------- | ---------------------------------------------------- |
|    1 | Read current page state           | Understand where the user is                         |
|    2 | Inspect visible text and elements | Identify stores, products, cart, or search results   |
|    3 | Analyze grocery context           | Determine what matters for the user’s goal           |
|    4 | Compare options                   | Look at price, dietary fit, quantity, and store fees |
|    5 | Build a cart plan                 | Suggest what to add, replace, or avoid               |
|    6 | Return clear reasoning            | Explain tradeoffs to the user                        |
|    7 | Stop before checkout              | User remains responsible for purchase                |

---

## 🛡️ Safety Rules for Agents

Agents using this layer must follow these rules:

| Rule                       | Meaning                                              |
| -------------------------- | ---------------------------------------------------- |
| 🔒 Checkout is blocked     | Do not place or finalize orders                      |
| 🧍 User stays in control   | The user must review all final choices               |
| 🧾 Explain recommendations | Do not silently mutate carts without context         |
| 💳 No payment actions      | Never interact with payment confirmation             |
| 🛑 Stop at risky screens   | If checkout, payment, or confirmation appears, pause |
| 🌐 Stay Instacart-scoped   | Do not use this layer for unrelated websites         |

---

## 🛒 Grocery Planning Priorities

When planning groceries, agents should consider:

```txt
1. User budget
2. Dietary requirements
3. Store availability
4. Product price
5. Quantity and serving size
6. Promotions and discounts
7. Delivery or service fees
8. Cart balance
9. User review before purchase
```

---

## 🥩 Dietary and Preference Handling

Agents may use the layer to support preferences such as:

| Preference       | Agent Behavior                                        |
| ---------------- | ----------------------------------------------------- |
| Halal            | Prefer clearly halal-friendly products when visible   |
| Budget           | Prioritize lower-cost staples and avoid luxury extras |
| High protein     | Suggest protein-dense items                           |
| Family groceries | Balance bulk items, staples, and variety              |
| Promotions       | Prefer sale items when they still fit the goal        |
| Store preference | Respect the store the user wants when possible        |

Agents should **not guess sensitive dietary requirements** unless the user says them.

---

## 🏬 Store Discovery

<p align="center">
  <img src="https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif" width="360" alt="Store discovery gif" />
</p>

Agents may compare visible Instacart stores available for the active address.

Examples may include:

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

Store comparison should focus on:

| Factor               | Why It Matters                                         |
| -------------------- | ------------------------------------------------------ |
| Product availability | Some stores may not have required items                |
| Price                | Same item may vary across stores                       |
| Fees                 | A cheaper cart can become expensive with fees          |
| Promotions           | Discounts may change the best choice                   |
| Dietary fit          | Some stores may be better for halal or specialty items |
| Simplicity           | One good store is often better than many stores        |

---

## 🧾 Cart Planning Behavior

Agents should produce cart plans like this:

```txt
Suggested cart plan:
- Add budget protein options
- Add staple carbs
- Add vegetables and fruit
- Avoid duplicate expensive items
- Prefer sale items where visible
- Keep estimated subtotal under user budget
- Ask user to review before checkout
```

Agents should avoid vague outputs like:

```txt
I added everything.
You are ready to checkout.
Order confirmed.
```

Those are not acceptable.

---

## 🔥 Good Agent Output Example

```txt
I found a budget-friendly plan from the visible Instacart options.

Best direction:
- Use Food Basics because the visible prices look lower than the other stores.
- Prioritize chicken, eggs, rice, yogurt, frozen vegetables, and fruit.
- Avoid adding snacks until the core groceries are covered.
- Keep the cart under the requested subtotal.
- Review substitutions before checkout.

Checkout is not handled by me. You should review the cart manually before placing any order.
```

---

## 🚫 Bad Agent Output Example

```txt
I completed checkout for you.
```

Never do this.

---

## 🧱 Layer Responsibilities

This layer is responsible for:

| Responsibility               | Included |
| ---------------------------- | -------: |
| Instacart page understanding |        ✅ |
| Visible text reading         |        ✅ |
| Screenshot support           |        ✅ |
| Store comparison support     |        ✅ |
| Cart planning support        |        ✅ |
| Safety boundaries            |        ✅ |
| Checkout automation          |        ❌ |
| Payment automation           |        ❌ |
| Order placement              |        ❌ |

---

## 🧠 Agent Capability Matrix

| Capability               | Hermes | OpenClaw |    Nanobot |
| ------------------------ | -----: | -------: | ---------: |
| Read Instacart state     |      ✅ |        ✅ |          ✅ |
| Analyze visible products |      ✅ |        ✅ |          ✅ |
| Compare stores           |      ✅ |        ✅ |   ⚠️ Basic |
| Build grocery plan       |      ✅ |        ✅ |          ✅ |
| Handle complex reasoning |      ✅ |        ✅ | ⚠️ Limited |
| Checkout                 |      ❌ |        ❌ |          ❌ |
| Payment                  |      ❌ |        ❌ |          ❌ |

---

## 🧭 Recommended Agent Instructions

Agents should follow this internal instruction style:

```txt
You are using the Instacart API Layer.

Use it only for grocery planning, store comparison, cart inspection, and safe recommendations.

Do not place orders.
Do not complete checkout.
Do not submit payment.
Do not bypass user review.

When making recommendations, explain:
- what you observed
- what you suggest
- why it fits the user's goal
- what the user should review manually
```

---

## 📸 Visual Reasoning

Agents can use screenshots to understand pages when text is not enough.

Useful for:

```txt
📸 Product cards
📸 Store tiles
📸 Cart views
📸 Promotion labels
📸 Price comparisons
📸 Out-of-stock notices
📸 Delivery fee screens
```

When using visual information, agents should describe uncertainty clearly.

Example:

```txt
The screenshot appears to show a discounted item, but the exact final price should be reviewed before checkout.
```

---

## 🧪 Testing Philosophy

<p align="center">
  <img src="https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" width="320" alt="Success gif" />
</p>

This layer should be tested around:

| Test Area       | Goal                                     |
| --------------- | ---------------------------------------- |
| Route safety    | Ensure dangerous actions are not exposed |
| Instacart scope | Reject unrelated app contexts            |
| Cart planning   | Keep recommendations safe and reviewable |
| Store discovery | Support address-aware grocery comparison |
| Agent behavior  | Make sure outputs stop before checkout   |

---

## ⚠️ Important Agent Warnings

Agents should pause or refuse when they encounter:

```txt
⚠️ Checkout confirmation pages
⚠️ Payment method screens
⚠️ Delivery confirmation screens
⚠️ Tip confirmation screens
⚠️ Final order buttons
⚠️ Account security prompts
⚠️ Login or password screens
```

The correct action is to stop and ask the user to continue manually.

---

## 🛣️ Roadmap

```txt
✅ Hermes support
✅ OpenClaw support
✅ Nanobot support
✅ Grocery page analysis
✅ Safe cart planning
✅ Store discovery support

🚧 Better product categorization
🚧 More structured grocery plans
🚧 Better dietary reasoning
🚧 Smarter promotion detection
🚧 Better cart diff summaries
🚧 More agent adapters
```

---

## 🧑‍💻 Maintainer

Built by **Mohammad Waliduddin**

<p>
  <a href="https://github.com/Waleeeeed88">
    <img src="https://img.shields.io/badge/GitHub-Waleeeeed88-181717?style=for-the-badge&logo=github" />
  </a>
</p>

---

## 📜 Disclaimer

This project is independent and is not affiliated with, sponsored by, or endorsed by Instacart.

It is intended for user-authorized grocery planning and agent reasoning only.

---

## ⭐ Final Note for Agents

<p align="center">
  <img src="https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif" width="380" alt="Grocery gif" />
</p>

```txt
Help the user think.
Help the user compare.
Help the user plan.

Do not buy.
Do not checkout.
Do not take control away from the user.
```

<p align="center">
  <b>Plan smarter. Shop safer. Let the user decide.</b>
</p>

<p align="center">
  🛒 🤖 🧠 🔒 🏬
</p>

