export type InstacartSurface = 'instacart' | 'unknown';

export interface BrowserState {
  ok?: boolean;
  url?: string;
  title?: string;
  error?: string;
  [key: string]: unknown;
}

export interface InstacartControllerConfig {
  name: 'instacart';
  baseUrl: string;
}

export interface CartItem {
  name: string;
  price: number | null;
  quantityLabel?: string | null;
  halalTagged?: boolean;
  proteinAnchor?: boolean;
  fatAnchor?: boolean;
  promotionTagged?: boolean;
}

export interface InstacartOffer {
  type: 'BOGO' | 'delivery_fee' | 'discount' | 'checkout_discount' | 'unknown';
  item?: string | null;
  description: string;
}

export interface BaseInstacartAnalysis {
  surface: InstacartSurface;
  url: string | null;
  title: string | null;
}

export interface InstacartAnalysis extends BaseInstacartAnalysis {
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
  promotions: InstacartOffer[];
  hasPromotions: boolean;
}

export interface UnknownInstacartAnalysis extends BaseInstacartAnalysis {
  surface: 'unknown';
  lineCount: number;
  warning: string;
}

export type InstacartAnalysisResult = InstacartAnalysis | UnknownInstacartAnalysis;

export interface InstacartLoginStatus {
  caseType: 'not-logged-in' | 'logged-in';
  loggedIn: boolean;
  loginVisible: boolean;
  otpVisible: boolean;
  phoneOtpPreferred: true;
  loginUrl: string;
  homeUrl: string;
  deliveryAddress: string | null;
  nextAction: 'phone_required' | 'otp_required' | 'verify_connection' | 'ready';
  instructions: string;
}

export interface InstacartLoginStartRequest {
  phoneNumber?: string;
  loginUrl?: string;
  submit?: boolean;
}

export interface InstacartLoginSubmitOtpRequest {
  otpCode?: string;
  submit?: boolean;
}

export interface CartPlanConstraints {
  maxSubtotal?: number;
  requireHalal?: boolean;
  preferPromotions?: boolean;
  neverCheckout?: boolean;
  focus?: Array<'budget' | 'fat' | 'protein'>;
  people?: number;
  days?: number;
  addressHint?: string;
  candidateStores?: string[];
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
  storeScope: {
    selectedStore: string | null;
    compareStores: string[];
    addressHint: string | null;
  };
  promotion: {
    required: boolean;
    usePromotion: boolean;
    offers: InstacartOffer[];
  };
  nutritionFocus: {
    requested: string[];
    proteinFocused: boolean;
    fatFocused: boolean;
    proteinAnchors: string[];
    fatAnchors: string[];
  };
  highlights: string[];
  warnings: string[];
  nextSafeActions: string[];
}
