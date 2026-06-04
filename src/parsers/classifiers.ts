const HALAL_TERMS = /\b(halal|zabiha|mina|sufra|al safa|ta'?aam)\b/i;
const FAT_ANCHOR_TERMS = /\b(drumstick|thigh|leg quarter|ground chicken|butter|olive oil|avocado|egg|10%|full fat|whole milk|cream|cheese|yogurt)\b/i;
const PROMOTION_TERMS = /\b(\d+%\s*off|sale|deal|promotion|promo|unlocked offers|applies at checkout|original price|buy 1, get 1 free)\b/i;

export function isHalalText(value: string): boolean {
  return HALAL_TERMS.test(value);
}

export function isFatAnchor(value: string): boolean {
  return FAT_ANCHOR_TERMS.test(value);
}

export function isPromotionText(value: string): boolean {
  return PROMOTION_TERMS.test(value);
}
