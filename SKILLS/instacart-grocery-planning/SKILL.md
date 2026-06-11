---
name: instacart-grocery-planning
description: Plan and build economical Instacart.ca grocery carts from live prices while respecting halal, protein, budget, address/store availability, and no-checkout safety.
version: 1.0.0
tags: [instacart, grocery, halal, high-protein, budget, cart-planning]
---

# Instacart Grocery Planning

## Trigger

Use when asked to compare Instacart.ca stores, plan groceries, build carts, optimize for budget/protein/halal/diet constraints, or mutate a live Instacart cart through this API.

## Operating rules

1. Use **Instacart.ca** and the active saved browser profile/address.
2. Do not create a shared public browser link if the saved profile is already logged in.
3. Never check out, pay, or place an order without explicit user authorization.
4. Compare address-available stores before picking a retailer; do not default blindly to Food Basics or Costco.
5. Prefer one no-markup/low-fee store unless a split clearly beats added fees/complexity.
6. Verify final cart drawer text, item quantities, and subtotal before reporting.

## Store comparison scope

At minimum, consider visible grocery stores for the address, including:

- Food Basics
- Walmart
- No Frills
- Adonis
- FreshCo
- Metro
- Costco
- Costco Business Centre
- Iqbal Foods
- Real Canadian Superstore
- Wholesale Club
- Any additional visible Instacart grocery store for the address

Compare:

- No-markup / pricing-policy signal
- Delivery/service/long-distance/bag fee signals
- Item availability for the diet
- Protein-per-dollar and staple-per-dollar
- Promotions/discounts and delivery threshold
- Whether weighted item estimates can move subtotal later

## Halal high-protein defaults

For a 2-person, 2-week halal high-protein cart, build around:

- Halal/Zabiha/Mina/Sufra chicken as the meat anchor
- Eggs
- Plain Greek yogurt or cottage cheese when useful
- Tuna in water
- Tofu as cheap backup protein if acceptable
- Lentils, beans, chickpeas
- Rice, oats, potatoes, tortillas/pasta for bulk carbs
- Frozen vegetables, onions, carrots/cabbage for cheap volume

Use halal-labeled meats only for meat. Non-meat staples are usually acceptable unless ingredients visibly show pork/alcohol or the user requires certification for everything.

## Cart mutation pattern

1. Check `/instacart/login/status` first.
2. If `loggedIn: false`, use the phone OTP layer before cart work.
3. Open `/instacart/analysis`; confirm the browser is logged in and on Instacart.
4. Search available stores/products with store-specific Instacart.ca URLs.
5. Open the cart drawer and clear existing items if rebuilding.
6. Add first unit from the exact product card; for duplicates use the exact row/card increment control, not another broad add click.
7. Reopen cart drawer and verify `Family Cart`, quantities, `Item subtotal`, and checkout total/discount line.
8. Report item subtotal and any discounted/pre-checkout line separately. State checkout was not completed.

## Pitfalls

- Global `/store/s?k=` discovery can mix stores; lock to a chosen store before adding.
- Store slugs must be canonical, e.g. `food-basics-canada`, not `food-basics`.
- Product cards and Add buttons are often sibling elements; use geometry or exact labels.
- Cart parsers can lag/underreport; final verification should trust the live cart drawer text.
- Weighted meat/produce can change after shopper selection.
