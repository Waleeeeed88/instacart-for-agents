import type { InstacartControllerConfig } from '../domain/types.js';

const DEFAULT_INSTACART_CONTROLLER_URL = 'http://127.0.0.1:6082';

export interface EnvironmentConfig {
  port: number;
  timeoutMs: number;
  controller: InstacartControllerConfig;
}

function parseLegacyCommerceApps(raw: string | undefined): string | null {
  if (!raw) return null;
  for (const part of raw.split(',')) {
    const [name, ...rest] = part.trim().split('=');
    const baseUrl = rest.join('=').replace(/\/$/, '');
    if (name === 'instacart' && baseUrl) return baseUrl;
  }
  return null;
}

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function instacartControllerUrl(env: NodeJS.ProcessEnv): string {
  return (env.INSTACART_CONTROLLER_URL
    ?? parseLegacyCommerceApps(env.COMMERCE_APPS)
    ?? DEFAULT_INSTACART_CONTROLLER_URL).replace(/\/$/, '');
}

export function loadEnvironment(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  return {
    port: numberFromEnv(env.PORT, 7077),
    timeoutMs: numberFromEnv(env.INSTACART_API_TIMEOUT_MS ?? env.COMMERCE_API_TIMEOUT_MS, 10_000),
    controller: { name: 'instacart', baseUrl: instacartControllerUrl(env) },
  };
}
