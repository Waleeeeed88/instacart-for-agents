import type { CartItem, CartPlanConstraints, CartPlanRecommendation, InstacartAnalysis, InstacartAnalysisResult } from '../domain/types.js';

const DEFAULT_STORE_SCOPE = ['Food Basics', 'Walmart', 'No Frills', 'Adonis', 'FreshCo', 'Metro', 'Costco', 'Costco Business Centre', 'Iqbal Foods', 'Real Canadian Superstore', 'Wholesale Club'];

export function buildCartPlan(analysis: InstacartAnalysisResult, constraints: CartPlanConstraints = {}): CartPlanRecommendation {
  if (analysis.surface === 'instacart') return buildInstacartPlan(analysis, constraints);
  return basePlan(analysis, constraints, ['Unknown surface; inspect Instacart state/text/screenshot before acting.'], false, []);
}

function buildInstacartPlan(analysis: InstacartAnalysis, constraints: CartPlanConstraints): CartPlanRecommendation {
  const warnings: string[] = [];
  const maxSubtotal = constraints.maxSubtotal ?? null;
  const subtotal = analysis.subtotal;
  const halalAnchors = analysis.cartItems.filter((item) => item.halalTagged);
  const proteinAnchors = analysis.cartItems.filter((item) => item.proteinAnchor);
  const fatAnchors = analysis.cartItems.filter((item) => item.fatAnchor);
  const promotionRequired = constraints.preferPromotions === true;

  if (maxSubtotal !== null && subtotal !== null && subtotal > maxSubtotal) warnings.push(`Subtotal ${subtotal.toFixed(2)} exceeds maxSubtotal ${maxSubtotal.toFixed(2)}.`);
  if (constraints.requireHalal && halalAnchors.length === 0) warnings.push('No clearly halal cart anchor is visible.');
  if (promotionRequired && !analysis.hasPromotions) warnings.push('No visible promotion or checkout discount was parsed.');
  if (constraints.focus?.includes('protein') && proteinAnchors.length < 2) warnings.push('Protein-focused cart requested, but fewer than two protein anchors are visible.');
  if (constraints.focus?.includes('fat') && fatAnchors.length < 2) warnings.push('Fat-focused cart requested, but fewer than two fat anchors are visible.');
  if (analysis.cartEmpty) warnings.push('Cart is empty.');

  const eligible = warnings.length === 0 && subtotal !== null;
  const highlights = [
    ...halalAnchors.slice(0, 3).map(formatItemHighlight),
    ...proteinAnchors.filter((item) => !halalAnchors.includes(item)).slice(0, 4).map(formatItemHighlight),
    ...fatAnchors.filter((item) => !halalAnchors.includes(item) && !proteinAnchors.includes(item)).slice(0, 2).map(formatItemHighlight),
  ];

  return {
    ...basePlan(analysis, constraints, warnings, eligible, highlights),
    promotion: {
      required: promotionRequired,
      usePromotion: analysis.hasPromotions,
      offers: analysis.promotions,
    },
    nutritionFocus: {
      requested: constraints.focus ?? [],
      proteinFocused: proteinAnchors.length >= 2,
      fatFocused: fatAnchors.length >= 2,
      proteinAnchors: proteinAnchors.map((item) => item.name),
      fatAnchors: fatAnchors.map((item) => item.name),
    },
    summary: eligible
      ? `Safe candidate: ${analysis.store ?? 'Instacart'} cart is under budget, has required visible anchors, and checkout remains blocked.`
      : `Not ready: ${warnings.join(' ')}`,
  };
}

function basePlan(
  analysis: InstacartAnalysisResult,
  constraints: CartPlanConstraints,
  warnings: string[],
  eligible: boolean,
  highlights: string[],
): CartPlanRecommendation {
  const maxSubtotal = constraints.maxSubtotal ?? null;
  const subtotal = 'subtotal' in analysis ? analysis.subtotal : null;
  const remaining = maxSubtotal !== null && subtotal !== null ? roundCurrency(maxSubtotal - subtotal) : null;
  const selectedStore = analysis.surface === 'instacart' ? analysis.store : null;
  const addressHint = constraints.addressHint ?? (analysis.surface === 'instacart' ? analysis.deliveryAddress ?? undefined : undefined) ?? null;
  return {
    eligible,
    checkoutBlocked: constraints.neverCheckout !== false,
    summary: eligible ? 'Safe Instacart candidate.' : 'Not ready.',
    budget: { maxSubtotal, subtotal, remaining },
    storeScope: {
      selectedStore,
      compareStores: constraints.candidateStores?.length ? constraints.candidateStores : DEFAULT_STORE_SCOPE,
      addressHint,
    },
    promotion: { required: constraints.preferPromotions === true, usePromotion: false, offers: [] },
    nutritionFocus: { requested: constraints.focus ?? [], proteinFocused: false, fatFocused: false, proteinAnchors: [], fatAnchors: [] },
    highlights,
    warnings: [...warnings, 'Safe mode: checkout/order placement is blocked by policy.'],
    nextSafeActions: [
      'Compare all address-available Instacart.ca grocery stores before choosing the active retailer.',
      'Verify cart drawer text and subtotal again before reporting.',
      'Compare substitutions only if they preserve halal and budget constraints.',
      'Ask the user for explicit authorization before any final order step.',
    ],
  };
}

function formatItemHighlight(item: CartItem): string {
  const price = item.price === null ? 'price unknown' : `$${item.price.toFixed(2)}`;
  return `${item.name} (${price}${item.quantityLabel ? `, ${item.quantityLabel}` : ''})`;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
