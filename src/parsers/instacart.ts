import type { BrowserState, CartItem, CommerceOffer, InstacartAnalysis } from '../domain/types.js';
import { isFatAnchor, isHalalText, isPromotionText } from './classifiers.js';
import { moneyToNumber } from './money.js';
import { linesOf, nearestLine } from './text.js';

const STORE_PATTERN = /^(Food Basics|Walmart|Adonis|Costco|FreshCo|No Frills|Maxi|Metro|Super C)$/i;

export function parseInstacart(text: string, state: BrowserState = {}): InstacartAnalysis {
  const lines = linesOf(text);
  const lower = lines.map((line) => line.toLowerCase());
  const subtotalIdx = lower.findIndex((line) => line === 'item subtotal');
  const subtotalLines = subtotalIdx >= 0 ? lines.slice(subtotalIdx + 1, subtotalIdx + 6).filter((line) => /\$/.test(line)) : [];
  const itemSubtotalLine = subtotalLines[0] ?? null;
  const discountedSubtotalLine = subtotalLines[1] ?? null;
  const checkoutIdx = lower.findIndex((line) => line === 'go to checkout' || /^go to checkout\b/i.test(line));
  const checkoutLine = checkoutIdx >= 0 ? (lines[checkoutIdx]?.match(/\$/) ? (lines[checkoutIdx] ?? null) : nearestLine(lines, checkoutIdx, 1, (line) => /\$/.test(line), 2)) : null;
  const itemSubtotal = moneyToNumber(itemSubtotalLine);
  const checkoutTotal = moneyToNumber(checkoutLine);
  const discountedSubtotal = moneyToNumber(discountedSubtotalLine);
  const subtotal = checkoutTotal ?? discountedSubtotal ?? itemSubtotal;
  const subtotalLabel = checkoutLine ?? discountedSubtotalLine ?? itemSubtotalLine;
  const cartEmpty = lower.some((line) => /your family cart is empty|cart is empty/i.test(line));
  const promotions = parsePromotions(lines);

  if (cartEmpty) {
    return {
      surface: 'instacart',
      url: state.url ?? null,
      title: state.title ?? null,
      store: findStore(lines),
      deliveryAddress: findDeliveryAddress(lines),
      deliveryWindow: findDeliveryWindow(lines),
      subtotal: null,
      subtotalLabel: null,
      itemSubtotal: null,
      itemSubtotalLabel: null,
      checkoutTotal: null,
      checkoutTotalLabel: null,
      cartItems: [],
      cartEmpty: true,
      checkoutVisible: false,
      promotions,
      hasPromotions: promotions.length > 0,
    };
  }

  return {
    surface: 'instacart',
    url: state.url ?? null,
    title: state.title ?? null,
    store: findStore(lines),
    deliveryAddress: findDeliveryAddress(lines),
    deliveryWindow: findDeliveryWindow(lines),
    subtotal,
    subtotalLabel,
    itemSubtotal,
    itemSubtotalLabel: itemSubtotalLine,
    checkoutTotal,
    checkoutTotalLabel: checkoutLine,
    cartItems: parseCartItems(lines, lower, subtotalIdx),
    cartEmpty: false,
    checkoutVisible: lower.some((line) => /checkout|go to checkout/.test(line)),
    promotions,
    hasPromotions: promotions.length > 0,
  };
}

function findStore(lines: string[]): string | null {
  return lines.find((line) => STORE_PATTERN.test(line)) ?? null;
}

function findDeliveryWindow(lines: string[]): string | null {
  return lines.find((line) => /delivery by|delivery in|pickup/i.test(line)) ?? null;
}

function findDeliveryAddress(lines: string[]): string | null {
  return lines.find((line) => /Honeycrisp|Cres|H3A|L4K/i.test(line)) ?? null;
}

function isBogusCartLine(line: string): boolean {
  const value = line.trim();
  return /^(family cart|current price:?|original price:?|quantity:?|\d+\s*(ct|kg|g)|today,?|make this order a gift|add|remove|unlocked offers.*)$/i.test(value)
    || /^\$/.test(value)
    || /subtotal|delivery|service|fee|skip|store|shopping|checkout/i.test(value)
    || isPromotionText(value);
}

function parseCartItems(lines: string[], lower: string[], subtotalIdx: number): CartItem[] {
  const cartIdx = lower.findIndex((line) => line === 'family cart' || line.includes('cart'));
  if (cartIdx < 0) return [];

  const suggestedIdx = lower.findIndex((line, idx) => idx > cartIdx && /suggested items|complete your cart/.test(line));
  const endIdx = subtotalIdx >= 0 ? subtotalIdx : (suggestedIdx >= 0 ? suggestedIdx : Math.min(lines.length, cartIdx + 140));
  const items: CartItem[] = [];

  for (let i = cartIdx; i < endIdx; i += 1) {
    const line = lines[i] ?? '';
    const next = lines[i + 1] ?? '';
    const next2 = lines[i + 2] ?? '';
    if (!(/\$/.test(next) || /\$/.test(next2))) continue;
    if (isBogusCartLine(line) || /^\d+$/.test(line)) continue;

    const context = lines.slice(i, Math.min(endIdx, i + 8)).join(' ');
    items.push({
      name: line,
      price: moneyToNumber(next) ?? moneyToNumber(next2),
      quantityLabel: findQuantityLabel(lines, i, endIdx),
      halalTagged: isHalalText(context),
      fatAnchor: isFatAnchor(line),
      promotionTagged: isPromotionText(context),
    });
  }
  return items.slice(0, 50);
}

function findQuantityLabel(lines: string[], start: number, end: number): string | null {
  for (let i = start + 1; i < Math.min(end, start + 6); i += 1) {
    const line = lines[i] ?? '';
    if (/^\d+(?:\.\d+)?\s*(ct|kg|g)$/i.test(line)) return line;
  }
  return null;
}

function parsePromotions(lines: string[]): CommerceOffer[] {
  const promotions: CommerceOffer[] = [];
  lines.forEach((line, index) => {
    if (/\d+%\s*off/i.test(line)) {
      promotions.push({
        type: 'discount',
        item: nearestLine(lines, index, -1, (candidate) => !/^\$|current price|original price|quantity/i.test(candidate) && !isPromotionText(candidate), 6),
        description: line,
      });
    }
    if (/unlocked offers|applies at checkout/i.test(line)) {
      promotions.push({ type: 'checkout_discount', description: line });
    }
  });
  return promotions.slice(0, 30);
}
