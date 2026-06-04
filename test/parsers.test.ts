import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeText, detectSurface, moneyToNumber } from '../src/parsers/index.js';

import { instacartPromoCart } from './fixtures.js';

test('moneyToNumber parses dollar values safely', () => {
  assert.equal(moneyToNumber('$15.99'), 15.99);
  assert.equal(moneyToNumber('Current price $1,234.50'), 1234.5);
  assert.equal(moneyToNumber('free'), null);
});

test('detectSurface recognizes Instacart and Uber Eats surfaces', () => {
  assert.equal(detectSurface(`Family Cart\nItem subtotal`, { title: 'Instacart' }), 'instacart');
  assert.equal(detectSurface(`Search Uber Eats\nGo to checkout`, { url: 'https://www.ubereats.com/ca/store/x' }), 'ubereats');
});

test('analyzes Uber Eats halal BOGO cart without treating offers as cart items', () => {
  const text = `Skip to content
10 Honeycrisp Cres
Now
Search Uber Eats
2
Moussa’s Shawarma & Grill
Moussa’s Shawarma & Grill
4.3
Middle Eastern
Halal
$0 delivery fee (new users)
28 min
Earliest arrival
4.4 mi
Chicken Shawarma Wrap
$15.99
$31.98
Offers for you
Chicken leg Mandi
$19.99
Buy 1, get 1 free
Item Subtotal
$15.99
Go to checkout`;

  const result = analyzeText(text, { url: 'https://www.ubereats.com/ca/store/x', title: 'Uber Eats' });

  assert.equal(result.surface, 'ubereats');
  assert.equal(result.deliveryAddress, '10 Honeycrisp Cres');
  assert.equal(result.cartCount, 2);
  assert.equal(result.subtotal, 15.99);
  assert.equal(result.halalTagged, true);
  assert.equal(result.checkoutVisible, true);
  assert.equal(result.eta, '28 min');
  assert.ok(result.offers.some((offer) => offer.type === 'BOGO'));
  assert.equal(result.cartItems.some((item) => item.name.includes('Chicken leg Mandi')), false);
});

test('analyzes a $100 cheap halal Instacart cart with promotions and fat-focused anchors', () => {
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
  assert.ok(result.cartItems.some((item) => item.name === 'Halal Chicken Drumsticks' && item.halalTagged));
  assert.ok(result.cartItems.some((item) => item.name.includes('Butter') && item.fatAnchor));
  assert.ok(result.cartItems.some((item) => item.name.includes('Olive Oil') && item.fatAnchor));
});

