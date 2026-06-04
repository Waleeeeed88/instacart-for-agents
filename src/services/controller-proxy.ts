import type { BrowserState, CommerceAppConfig } from '../domain/types.js';
import { HttpError } from '../utils/http-error.js';
import { withTimeout } from '../utils/timeout.js';

export interface ControllerProxyOptions {
  timeoutMs: number;
}

export class ControllerProxy {
  constructor(private readonly options: ControllerProxyOptions) {}

  async getState(target: CommerceAppConfig): Promise<BrowserState> {
    return this.proxyJson<BrowserState>(target, '/state');
  }

  async getText(target: CommerceAppConfig): Promise<string> {
    return this.proxyText(target, '/text');
  }

  async getScreenshot(target: CommerceAppConfig): Promise<Buffer> {
    return withTimeout(async (signal) => {
      const upstream = await fetch(`${target.baseUrl}/screenshot.jpg`, { signal });
      if (!upstream.ok) throw new HttpError(`Controller ${target.name} screenshot failed: HTTP ${upstream.status}`, 502);
      return Buffer.from(await upstream.arrayBuffer());
    }, this.options.timeoutMs, `Controller ${target.name} screenshot`);
  }

  async postJson<T>(target: CommerceAppConfig, path: string, body: unknown): Promise<T> {
    return this.proxyJson<T>(target, path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  }

  async proxyJson<T>(target: CommerceAppConfig, path: string, init: RequestInit = {}): Promise<T> {
    const text = await this.request(target, path, init);
    try {
      return JSON.parse(text || '{}') as T;
    } catch (error) {
      throw new HttpError(`Controller ${target.name} ${path} returned invalid JSON`, 502, error);
    }
  }

  async proxyText(target: CommerceAppConfig, path: string, init: RequestInit = {}): Promise<string> {
    return this.request(target, path, init);
  }

  private async request(target: CommerceAppConfig, path: string, init: RequestInit): Promise<string> {
    return withTimeout(async (signal) => {
      const response = await fetch(`${target.baseUrl}${path}`, { ...init, signal });
      const text = await response.text();
      if (!response.ok) {
        throw new HttpError(`Controller ${target.name} ${path} failed: HTTP ${response.status} ${text.slice(0, 300)}`, 502);
      }
      return text;
    }, this.options.timeoutMs, `Controller ${target.name} ${path}`);
  }
}
