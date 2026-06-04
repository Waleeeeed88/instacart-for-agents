import type { CartItem, CartPlanConstraints, CartPlanRecommendation, CommerceAnalysis, InstacartAnalysis, UberEatsAnalysis } from '../domain/types.js';

export function buildCartPlan(analysis: CommerceAnalysis, constraints: CartPlanConstraints = {}): CartPlanRecommendation {
  if (analysis.surface === 'instacart') return buildInstacartPlan(analysis, constraints);
  if (analysis.surface === 'ubereats') return buildUberEatsPlan(analysis, constraints);
  return basePlan(analysis, constraints, ['Unknown surface; inspect state/text/screenshot before acting.'], false, []);
}

function buildInstacartPlan(analysis: InstacartAnalysis, constraints: CartPlanConstraints): CartPlanRecommendation {
  const warnings: string[] = [];
  const maxSubtotal = constraints.maxSubtotal ?? null;
  const subtotal = analysis.subtotal;
  const halalAnchors = analysis.cartItems.filter((item) => item.halalTagged);
  const fatAnchors = analysis.cartItems.filter((item) => item.fatAnchor);
  const promotionRequired = constraints.preferPromotions === true;

  if (maxSubtotal !== null && subtotal !== null && subtotal > maxSubtotal) warnings.push(`Subtotal ${subtotal.toFixed(2)} exceeds maxSubtotal ${maxSubtotal.toFixed(2)}.`);
  if (constraints.requireHalal && halalAnchors.length === 0) warnings.push('No clearly halal cart anchor is visible.');
  if (promotionRequired && !analysis.hasPromotions) warnings.push('No visible promotion or checkout discount was parsed.');
  if (constraints.focus?.includes('fat') && fatAnchors.length < 2) warnings.push('Fat-focused cart requested, but fewer than two fat anchors are visible.');
  if (analysis.cartEmpty) warnings.push('Cart is empty.');

  const eligible = warnings.length === 0 && subtotal !== null;
  const highlights = [
    ...halalAnchors.slice(0, 3).map(formatItemHighlight),
    ...fatAnchors.filter((item) => !halalAnchors.includes(item)).slice(0, 3).map(formatItemHighlight),
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
      fatFocused: fatAnchors.length >= 2,
      fatAnchors: fatAnchors.map((item) => item.name),
    },
    summary: eligible
      ? `Safe candidate: ${analysis.store ?? 'Instacart'} cart is under budget, has visible halal anchors, and checkout remains blocked.`
      : `Not ready: ${warnings.join(' ')}`,
  };
}

function buildUberEatsPlan(analysis: UberEatsAnalysis, constraints: CartPlanConstraints): CartPlanRecommendation {
  const warnings: string[] = [];
  const maxSubtotal = constraints.maxSubtotal ?? null;
  if (maxSubtotal !== null && analysis.subtotal !== null && analysis.subtotal > maxSubtotal) warnings.push(`Subtotal ${analysis.subtotal.toFixed(2)} exceeds maxSubtotal ${maxSubtotal.toFixed(2)}.`);
  if (constraints.requireHalal && !analysis.halalTagged) warnings.push('Current Uber Eats surface is not clearly halal-tagged.');
  const eligible = warnings.length === 0 && analysis.subtotal !== null;
  return {
    ...basePlan(analysis, constraints, warnings, eligible, analysis.cartItems.slice(0, 4).map(formatItemHighlight)),
    promotion: {
      required: constraints.preferPromotions === true,
      usePromotion: analysis.offers.length > 0,
      offers: analysis.offers,
    },
    nutritionFocus: {
      requested: constraints.focus ?? [],
      fatFocused: false,
      fatAnchors: [],
    },
    summary: eligible ? 'Safe candidate: Uber Eats cart satisfies current constraints; checkout remains blocked.' : `Not ready: ${warnings.join(' ')}`,
  };
}

function basePlan(
  analysis: CommerceAnalysis,
  constraints: CartPlanConstraints,
  warnings: string[],
  eligible: boolean,
  highlights: string[],
): CartPlanRecommendation {
  const maxSubtotal = constraints.maxSubtotal ?? null;
  const subtotal = 'subtotal' in analysis ? analysis.subtotal : null;
  const remaining = maxSubtotal !== null && subtotal !== null ? roundCurrency(maxSubtotal - subtotal) : null;
  return {
    eligible,
    checkoutBlocked: constraints.neverCheckout !== false,
    summary: eligible ? 'Safe candidate.' : 'Not ready.',
    budget: { maxSubtotal, subtotal, remaining },
    promotion: { required: constraints.preferPromotions === true, usePromotion: false, offers: [] },
    nutritionFocus: { requested: constraints.focus ?? [], fatFocused: false, fatAnchors: [] },
    highlights,
    warnings: [...warnings, 'Safe mode: checkout/order placement is blocked by policy.'],
    nextSafeActions: [
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
