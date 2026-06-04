export type CommerceSurface = 'instacart' | 'ubereats' | 'doordash' | 'unknown';

export interface BrowserState {
  ok?: boolean;
  url?: string;
  title?: string;
  error?: string;
  [key: string]: unknown;
}

export interface CommerceAppConfig {
  name: string;
  baseUrl: string;
}

export type CommerceApps = Record<string, CommerceAppConfig>;

export interface CartItem {
  name: string;
  price: number | null;
  quantityLabel?: string | null;
  halalTagged?: boolean;
  fatAnchor?: boolean;
  promotionTagged?: boolean;
}

export interface CommerceOffer {
  type: 'BOGO' | 'delivery_fee' | 'discount' | 'checkout_discount' | 'unknown';
  item?: string | null;
  description: string;
}

export interface BaseAnalysis {
  surface: CommerceSurface;
  url: string | null;
  title: string | null;
}

export interface UberEatsAnalysis extends BaseAnalysis {
  surface: 'ubereats';
  deliveryAddress: string | null;
  restaurant: string | null;
  cartCount: number | null;
  subtotal: number | null;
  subtotalLabel: string | null;
  rating: number | null;
  eta: string | null;
  distance: string | null;
  halalTagged: boolean;
  offers: CommerceOffer[];
  cartItems: CartItem[];
  checkoutVisible: boolean;
  loginVisible: boolean;
}

export interface InstacartAnalysis extends BaseAnalysis {
  surface: 'instacart';
  store: string | null;
  deliveryAddress: string | null;
  deliveryWindow: string | null;
  subtotal: number | null;
  subtotalLabel: string | null;
  itemSubtotal: number | null;
  itemSubtotalLabel: string | null;
  checkoutTotal: number | null;
  checkoutTotalLabel: string | null;
  cartItems: CartItem[];
  cartEmpty: boolean;
  checkoutVisible: boolean;
  promotions: CommerceOffer[];
  hasPromotions: boolean;
}

export interface UnknownAnalysis extends BaseAnalysis {
  surface: 'doordash' | 'unknown';
  lineCount: number;
}

export type CommerceAnalysis = InstacartAnalysis | UberEatsAnalysis | UnknownAnalysis;

export interface CartPlanConstraints {
  maxSubtotal?: number;
  requireHalal?: boolean;
  preferPromotions?: boolean;
  neverCheckout?: boolean;
  focus?: Array<'budget' | 'fat' | 'protein'>;
}

export interface CartPlanRecommendation {
  eligible: boolean;
  checkoutBlocked: boolean;
  summary: string;
  budget: {
    maxSubtotal: number | null;
    subtotal: number | null;
    remaining: number | null;
  };
  promotion: {
    required: boolean;
    usePromotion: boolean;
    offers: CommerceOffer[];
  };
  nutritionFocus: {
    requested: string[];
    fatFocused: boolean;
    fatAnchors: string[];
  };
  highlights: string[];
  warnings: string[];
  nextSafeActions: string[];
}
