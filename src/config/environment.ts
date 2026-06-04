import type { CommerceApps } from '../domain/types.js';

const DEFAULT_APPS = 'shared=http://127.0.0.1:6080,instacart=http://127.0.0.1:6080,ubereats=http://127.0.0.1:6080';

export interface EnvironmentConfig {
  port: number;
  timeoutMs: number;
  apps: CommerceApps;
}

export function parseCommerceApps(raw = DEFAULT_APPS): CommerceApps {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<CommerceApps>((apps, part) => {
      const [name, ...rest] = part.split('=');
      const baseUrl = rest.join('=').replace(/\/$/, '');
      if (name && baseUrl) {
        apps[name] = { name, baseUrl };
      }
      return apps;
    }, {});
}

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadEnvironment(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  return {
    port: numberFromEnv(env.PORT, 7077),
    timeoutMs: numberFromEnv(env.COMMERCE_API_TIMEOUT_MS, 10_000),
    apps: parseCommerceApps(env.COMMERCE_APPS ?? DEFAULT_APPS),
  };
}
