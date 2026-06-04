import type { BrowserState, CommerceOffer, UberEatsAnalysis, CartItem } from '../domain/types.js';
import { isHalalText } from './classifiers.js';
import { moneyToNumber } from './money.js';
import { linesOf, nearestLine } from './text.js';

export function parseUberEats(text: string, state: BrowserState = {}): UberEatsAnalysis {
  const lines = linesOf(text);
  const lower = lines.map((line) => line.toLowerCase());
  const searchIdx = lower.findIndex((line) => line === 'search uber eats');
  const maybeCartCount = searchIdx >= 0 ? lines[searchIdx + 1] : null;
  const cartCount = /^\d+$/.test(maybeCartCount ?? '') ? Number(maybeCartCount) : null;

  const restaurant = findRestaurant(lines, state);
  const itemSubtotalIdx = lower.findIndex((line) => line === 'item subtotal' || line === 'subtotal');
  const subtotalLine = itemSubtotalIdx >= 0 ? nearestLine(lines, itemSubtotalIdx, 1, (line) => /\$/.test(line), 12) : null;
  const ratingLine = lines.find((line) => /^\d\.\d$/.test(line)) ?? null;
  const etaIdx = lower.findIndex((line) => line.includes('earliest arrival'));
  const eta = etaIdx > 0 && /min|pm|am/i.test(lines[etaIdx - 1] ?? '') ? (lines[etaIdx - 1] ?? null) : null;
  const offers = parseOffers(lines);

  return {
    surface: 'ubereats',
    url: state.url ?? null,
    title: state.title ?? null,
    deliveryAddress: lines.find((line) => /Honeycrisp|Cres|H3A|L4K/i.test(line)) ?? null,
    restaurant,
    cartCount,
    subtotal: moneyToNumber(subtotalLine),
    subtotalLabel: subtotalLine,
    rating: ratingLine ? Number(ratingLine) : null,
    eta,
    distance: lines.find((line) => /\b\d+(?:\.\d+)?\s*mi\b/i.test(line)) ?? null,
    halalTagged: lower.some((line) => isHalalText(line)),
    offers,
    cartItems: parseCartItems(lines, lower, itemSubtotalIdx),
    checkoutVisible: lower.some((line) => /go to checkout/.test(line)),
    loginVisible: lower.includes('log in'),
  };
}

function findRestaurant(lines: string[], state: BrowserState): string | null {
  const fromTitle = String(state.title ?? '').match(/^Order\s+(.+?)\s+-\s+Menu/i);
  if (fromTitle?.[1]) return fromTitle[1];
  const skip = new Set(['skip to content', 'search uber eats', 'log in', 'sign up', 'delivery', 'pickup', 'group order', '•']);
  for (const line of lines) {
    const normalized = line.toLowerCase();
    if (skip.has(normalized) || /^\d+$/.test(line) || /Honeycrisp|Now/.test(line)) continue;
    if (lines.filter((candidate) => candidate === line).length >= 2 || /shawarma|grill|cuisine|kabob|restaurant|kitchen|burger|chicken|ottoman|mehfill|moussa|paradise/i.test(line)) {
      return line;
    }
  }
  return null;
}

function parseOffers(lines: string[]): CommerceOffer[] {
  const offers: CommerceOffer[] = [];
  lines.forEach((line, index) => {
    if (/buy 1, get 1 free/i.test(line)) {
      offers.push({
        type: 'BOGO',
        item: nearestLine(lines, index, -1, (candidate) => !/\$|#|liked|popular|featured|offer/i.test(candidate), 5),
        description: line,
      });
    }
    if (/\$0 delivery fee/i.test(line)) offers.push({ type: 'delivery_fee', description: line });
  });
  return offers.slice(0, 20);
}

function parseCartItems(lines: string[], lower: string[], itemSubtotalIdx: number): CartItem[] {
  const cartItems: CartItem[] = [];
  const windowEnd = itemSubtotalIdx >= 0 ? Math.min(itemSubtotalIdx, Math.max(0, lower.findIndex((line) => line === 'offers for you'))) || itemSubtotalIdx : lines.length;
  const window = lines.slice(0, windowEnd);
  window.forEach((line, index) => {
    const next = window[index + 1] ?? '';
    const next2 = window[index + 2] ?? '';
    if (!(/\$/.test(next) || /\$/.test(next2))) return;
    if (/subtotal|remove|offers|group order|request utensils|add an order note|utensils|choose|delivery/i.test(line) || /^\d+$/.test(line) || /^\$/.test(line)) return;
    cartItems.push({ name: line, price: moneyToNumber(next) ?? moneyToNumber(next2), halalTagged: isHalalText(line) });
  });
  return cartItems.slice(0, 20);
}
