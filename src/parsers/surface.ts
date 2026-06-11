import type { BrowserState, InstacartSurface } from '../domain/types.js';

export function detectSurface(text: string | null | undefined, state: BrowserState = {}): InstacartSurface {
  const haystack = `${state.url ?? ''}
${state.title ?? ''}
${text ?? ''}`.toLowerCase();
  if (haystack.includes('instacart') || haystack.includes('family cart') || haystack.includes('item subtotal')) return 'instacart';
  return 'unknown';
}
