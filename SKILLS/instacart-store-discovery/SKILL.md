---
name: instacart-store-discovery
description: Discover and compare all address-available Instacart.ca grocery stores before selecting the cheapest viable store for a cart.
version: 1.0.0
tags: [instacart, store-discovery, price-comparison, costco, food-basics]
---

# Instacart Store Discovery

## Trigger

Use before building a cart or when the user asks to expand beyond Food Basics/Costco/default stores.

## Discovery workflow

1. Load the Instacart.ca home/store page for the active saved profile.
2. Parse visible store cards and pricing-policy text.
3. Keep the address/postal-code context in the analysis (`deliveryAddress` or request `addressHint`).
4. Search key staple categories in multiple candidate stores before choosing one.
5. Choose a store based on whole-basket value, not a single cheap item.

## Candidate store baseline

Always include visible versions of:

- Food Basics
- Costco
- Costco Business Centre
- Walmart
- No Frills
- Adonis
- FreshCo
- Metro
- Iqbal Foods
- Real Canadian Superstore
- Wholesale Club

Then add any other visible grocery stores for the active address.

## Ranking criteria

Rank stores by:

1. Carries diet-critical items, especially halal/Zabiha/Mina/Sufra meat when required.
2. No-markup or low-markup signal.
3. Whole-basket staple prices: eggs, yogurt/cottage cheese, tuna, lentils/beans, rice/oats/potatoes, frozen vegetables.
4. Delivery threshold/promotions and long-distance fees.
5. Substitution risk and in-stock/Add-button visibility.

## Reporting

Report the chosen store and the reason briefly. If Costco is skipped, say whether it lost due to membership/bulk mismatch, delivery fees, weak halal selection, or whole-basket price rather than ignoring it.
