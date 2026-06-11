import type { BrowserState, InstacartControllerConfig, InstacartLoginStartRequest, InstacartLoginSubmitOtpRequest, InstacartLoginStatus } from '../domain/types.js';
import { ControllerProxy } from './controller-proxy.js';

interface ControllerElement {
  tag?: string;
  role?: string;
  text?: string;
  aria?: string;
  placeholder?: string;
  href?: string;
  rect?: { x: number; y: number; width: number; height: number };
}

interface ControllerElementsResponse {
  ok?: boolean;
  elements?: ControllerElement[];
}

const LOGIN_URL = 'https://www.instacart.ca/login?next=%2Fstore%2F';
const HOME_URL = 'https://www.instacart.ca/store/?categoryFilter=homeTabForYou';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function loginDelay(defaultMs: number): number {
  const parsed = Number(process.env.INSTACART_LOGIN_DELAY_MS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultMs;
}

export class InstacartLoginService {
  constructor(
    private readonly controller: InstacartControllerConfig,
    private readonly controllerProxy: ControllerProxy,
  ) {}

  async getStatus(): Promise<InstacartLoginStatus> {
    const [state, text] = await Promise.all([
      this.controllerProxy.getState(this.controller).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) } as BrowserState)),
      this.controllerProxy.getText(this.controller).catch(() => ''),
    ]);
    return classifyLoginState(text, state);
  }

  async startPhoneLogin(request: InstacartLoginStartRequest = {}): Promise<InstacartLoginStatus> {
    const phoneNumber = normalizePhoneNumber(request.phoneNumber);
    await this.controllerProxy.postJson(this.controller, '/goto', { url: request.loginUrl ?? LOGIN_URL });
    await sleep(loginDelay(1_200));

    if (!phoneNumber) {
      return {
        ...(await this.getStatus()),
        nextAction: 'phone_required',
        instructions: 'Ask the user for their Instacart phone number, then call POST /instacart/login/start with { "phoneNumber": "+1..." }.',
      };
    }

    await this.ensureLoginFormOpen();
    const phoneInput = await this.findInput(['phone', 'mobile', 'email or phone', 'email']);
    if (phoneInput?.rect) {
      await this.clickElement(phoneInput);
    }
    await this.controllerProxy.postJson(this.controller, '/type', { text: phoneNumber });
    if (request.submit !== false) {
      await this.controllerProxy.postJson(this.controller, '/press', { key: 'Enter' });
    }
    await sleep(loginDelay(1_500));

    return {
      ...(await this.getStatus()),
      nextAction: 'otp_required',
      instructions: 'Instacart should send an SMS OTP. The user enters that code via POST /instacart/login/otp, then verifies /instacart/login/status.',
    };
  }

  async submitOtp(request: InstacartLoginSubmitOtpRequest = {}): Promise<InstacartLoginStatus> {
    const otpCode = normalizeOtpCode(request.otpCode);
    if (!otpCode) {
      return {
        ...(await this.getStatus()),
        nextAction: 'otp_required',
        instructions: 'Ask the user for the Instacart SMS verification code, then call POST /instacart/login/otp with { "otpCode": "123456" }.',
      };
    }

    const otpInput = await this.findInput(['code', 'otp', 'verification', 'one-time', 'one time']);
    if (otpInput?.rect) {
      await this.clickElement(otpInput);
    }
    await this.controllerProxy.postJson(this.controller, '/type', { text: otpCode });
    if (request.submit !== false) {
      await this.controllerProxy.postJson(this.controller, '/press', { key: 'Enter' });
    }
    await sleep(loginDelay(2_000));

    return {
      ...(await this.getStatus()),
      nextAction: 'verify_connection',
      instructions: 'Verify the connection with GET /instacart/login/status or GET /instacart/analysis. If loggedIn is false, ask the user to retry the code or complete any visible Instacart prompt.',
    };
  }

  private async ensureLoginFormOpen(): Promise<void> {
    const elements = await this.getElements();
    if (findInputElement(elements, ['phone', 'mobile', 'email or phone', 'email'])) return;

    const loginButton = elements.find((element) => {
      const label = elementLabel(element);
      return /^(log in|login|continue|continue with phone|phone)$/i.test(label) || /log in|continue with phone/i.test(label);
    });
    if (loginButton?.rect) {
      await this.clickElement(loginButton);
      await sleep(loginDelay(1_000));
    }
  }

  private async findInput(keywords: string[]): Promise<ControllerElement | null> {
    const elements = await this.getElements();
    return findInputElement(elements, keywords)
      ?? elements.find((element) => element.tag === 'input' && element.rect && isVisibleRect(element.rect))
      ?? null;
  }

  private async getElements(): Promise<ControllerElement[]> {
    const response = await this.controllerProxy.proxyJson<ControllerElementsResponse>(this.controller, '/elements');
    return response.elements ?? [];
  }

  private async clickElement(element: ControllerElement): Promise<void> {
    if (!element.rect) return;
    await this.controllerProxy.postJson(this.controller, '/click', {
      x: element.rect.x + element.rect.width / 2,
      y: element.rect.y + element.rect.height / 2,
    });
    await sleep(loginDelay(300));
  }
}

export function classifyLoginState(text: string, state: BrowserState = {}): InstacartLoginStatus {
  const haystack = `${state.url ?? ''}\n${state.title ?? ''}\n${text ?? ''}`.toLowerCase();
  const otpVisible = /verification code|enter code|security code|one-time|one time|\botp\b|text message|sms|we sent/.test(haystack);
  const loginVisible = /\blog in\b|\bsign up\b|continue with phone|phone number|email or phone/.test(haystack);
  const loggedInSignals = /family cart|account|delivery by|pickup|spend \$|shopping in|\d+\s+honeycrisp|store\/?\?categoryfilter/i.test(haystack);
  const loggedOutSignals = /instacart\.ca\/login|instacart\.ca\/accounts|log in to continue|continue with phone|sign up/i.test(haystack);
  const loggedIn = loggedInSignals && !otpVisible && !(loggedOutSignals && !/family cart|account|spend \$/i.test(haystack));

  let caseType: InstacartLoginStatus['caseType'] = loggedIn ? 'logged-in' : 'not-logged-in';
  let nextAction: InstacartLoginStatus['nextAction'] = loggedIn ? 'ready' : 'phone_required';
  if (otpVisible) {
    caseType = 'not-logged-in';
    nextAction = 'otp_required';
  } else if (!loggedIn && loginVisible) {
    nextAction = 'phone_required';
  }

  return {
    caseType,
    loggedIn,
    loginVisible,
    otpVisible,
    phoneOtpPreferred: true,
    loginUrl: LOGIN_URL,
    homeUrl: HOME_URL,
    deliveryAddress: findAddress(text),
    nextAction,
    instructions: loggedIn
      ? 'Instacart is already logged in. Continue with /instacart/analysis and cart planning.'
      : 'Instacart is not verified as logged in. Preferred flow: POST /instacart/login/start with a phone number, user receives SMS OTP, POST /instacart/login/otp with the code, then verify status.',
  };
}

function findInputElement(elements: ControllerElement[], keywords: string[]): ControllerElement | null {
  return elements.find((element) => {
    if (element.tag !== 'input' && element.tag !== 'textarea') return false;
    if (!element.rect || !isVisibleRect(element.rect)) return false;
    const label = elementLabel(element);
    return keywords.some((keyword) => label.includes(keyword.toLowerCase()));
  }) ?? null;
}

function elementLabel(element: ControllerElement): string {
  return `${element.text ?? ''} ${element.aria ?? ''} ${element.placeholder ?? ''}`.toLowerCase().replace(/\s+/g, ' ').trim();
}

function isVisibleRect(rect: { width: number; height: number }): boolean {
  return rect.width > 0 && rect.height > 0;
}

function normalizePhoneNumber(value: string | undefined): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  return trimmed.replace(/[^+\d]/g, '');
}

function normalizeOtpCode(value: string | undefined): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  return trimmed.replace(/\D/g, '');
}

function findAddress(text: string): string | null {
  return text.split(/\n+/).map((line) => line.trim()).find((line) => /Honeycrisp|Cres|H\d[A-Z]|L\d[A-Z]|[A-Z]\d[A-Z]\s?\d[A-Z]\d/i.test(line)) ?? null;
}
