import type { BrowserState, CommerceSurface } from '../domain/types.js';

export function detectSurface(text: string | null | undefined, state: BrowserState = {}): CommerceSurface {
  const haystack = `${state.url ?? ''}
${state.title ?? ''}
${text ?? ''}`.toLowerCase();
  if (haystack.includes('ubereats') || haystack.includes('uber eats') || haystack.includes('search uber eats')) return 'ubereats';
  if (haystack.includes('instacart') || haystack.includes('family cart')) return 'instacart';
  if (haystack.includes('go to checkout') && haystack.includes('restaurant')) return 'ubereats';
  if (haystack.includes('item subtotal')) return 'instacart';
  if (haystack.includes('doordash')) return 'doordash';
  return 'unknown';
}
