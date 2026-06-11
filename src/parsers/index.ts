import type { BrowserState, InstacartAnalysisResult } from '../domain/types.js';
import { linesOf } from './text.js';
import { moneyToNumber } from './money.js';
import { detectSurface } from './surface.js';
import { parseInstacart } from './instacart.js';

export { detectSurface } from './surface.js';
export { moneyToNumber } from './money.js';
export { parseInstacart } from './instacart.js';
export { linesOf } from './text.js';

export function analyzeText(text: string, state: BrowserState = {}): InstacartAnalysisResult {
  const surface = detectSurface(text, state);
  if (surface === 'instacart') return parseInstacart(text, state);
  return {
    surface: 'unknown',
    url: state.url ?? null,
    title: state.title ?? null,
    lineCount: linesOf(text).length,
    warning: 'Text/state did not look like an Instacart.ca surface. This API is intentionally Instacart-native only.',
  };
}
