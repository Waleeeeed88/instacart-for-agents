import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeText } from '../src/parsers/index.js';
import { buildCartPlan } from '../src/services/cart-planner.js';
import { instacartPromoCart } from './fixtures.js';

test('plans and validates a safe $100 cheap halal Instacart cart with promotions and fats/protein', () => {
  const analysis = analyzeText(instacartPromoCart, { title: 'Instacart', url: 'https://www.instacart.ca/store/adonis' });
  const plan = buildCartPlan(analysis, {
    maxSubtotal: 100,
    requireHalal: true,
    preferPromotions: true,
    focus: ['budget', 'fat', 'protein'],
    people: 2,
    days: 14,
  });

  assert.equal(plan.eligible, true);
  assert.equal(plan.checkoutBlocked, true);
  assert.equal(plan.budget.remaining, 11.04);
  assert.equal(plan.promotion.usePromotion, true);
  assert.equal(plan.nutritionFocus.fatFocused, true);
  assert.equal(plan.nutritionFocus.proteinFocused, true);
  assert.ok(plan.highlights.some((highlight) => highlight.includes('Halal Chicken Drumsticks')));
  assert.ok(plan.storeScope.compareStores.includes('Food Basics'));
  assert.ok(plan.storeScope.compareStores.includes('Costco'));
  assert.ok(plan.nextSafeActions.every((action) => !/payment|place order/i.test(action)));
});

test('cart planner fails closed when halal is required but no halal anchor is visible', () => {
  const analysis = analyzeText(`Family Cart
Food Basics
Butter
$5.99
Item subtotal
$5.99
Go to checkout`, { title: 'Instacart' });
  const plan = buildCartPlan(analysis, { maxSubtotal: 100, requireHalal: true });

  assert.equal(plan.eligible, false);
  assert.ok(plan.warnings.some((warning) => warning.includes('No clearly halal')));
});
