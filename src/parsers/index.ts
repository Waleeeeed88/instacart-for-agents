import type { BrowserState, CommerceAnalysis } from '../domain/types.js';
import { linesOf } from './text.js';
import { moneyToNumber } from './money.js';
import { detectSurface } from './surface.js';
import { parseInstacart } from './instacart.js';
import { parseUberEats } from './ubereats.js';

export { detectSurface } from './surface.js';
export { moneyToNumber } from './money.js';
export { parseInstacart } from './instacart.js';
export { parseUberEats } from './ubereats.js';
export { linesOf } from './text.js';

export function analyzeText(text: string, state: BrowserState = {}): CommerceAnalysis {
  const surface = detectSurface(text, state);
  if (surface === 'ubereats') return parseUberEats(text, state);
  if (surface === 'instacart') return parseInstacart(text, state);
  return { surface, url: state.url ?? null, title: state.title ?? null, lineCount: linesOf(text).length };
}
