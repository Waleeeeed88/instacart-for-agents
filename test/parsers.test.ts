import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeText, detectSurface, moneyToNumber } from '../src/parsers/index.js';

import { instacartPromoCart } from './fixtures.js';

test('moneyToNumber parses dollar values safely', () => {
  assert.equal(moneyToNumber('$15.99'), 15.99);
  assert.equal(moneyToNumber('Current price $1,234.50'), 1234.5);
  assert.equal(moneyToNumber('free'), null);
});

test('detectSurface recognizes Instacart and rejects non-Instacart surfaces', () => {
  assert.equal(detectSurface(`Family Cart\nItem subtotal`, { title: 'Instacart' }), 'instacart');
  assert.equal(detectSurface(`Search Uber Eats\nGo to checkout`, { url: 'https://www.ubereats.com/ca/store/x' }), 'unknown');
});

test('non-Instacart text analyzes as an unknown Instacart-native result', () => {
  const result = analyzeText('Search Uber Eats\nGo to checkout', { url: 'https://www.ubereats.com/ca/store/x', title: 'Uber Eats' });

  assert.equal(result.surface, 'unknown');
  assert.match(result.warning, /Instacart-native only/);
});

test('analyzes a $100 cheap halal Instacart cart with promotions and protein/fat anchors', () => {
  const result = analyzeText(instacartPromoCart, {
    url: 'https://www.instacart.ca/store/adonis/s?k=halal%20chicken',
    title: 'Instacart',
  });

  assert.equal(result.surface, 'instacart');
  assert.equal(result.store, 'Adonis');
  assert.equal(result.subtotal, 88.96);
  assert.equal(result.itemSubtotal, 96.96);
  assert.equal(result.checkoutTotal, 88.96);
  assert.equal(result.hasPromotions, true);
  assert.ok(result.promotions.some((promotion) => promotion.description.includes('50% off')));
  assert.ok(result.cartItems.some((item) => item.name === 'Halal Chicken Drumsticks' && item.halalTagged && item.proteinAnchor));
  assert.ok(result.cartItems.some((item) => item.name.includes('Butter') && item.fatAnchor));
  assert.ok(result.cartItems.some((item) => item.name.includes('Olive Oil') && item.fatAnchor));
});
