import express, { type Express } from 'express';
import type { CommerceApps } from './domain/types.js';
import { createAppsRouter } from './routes/apps.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { ControllerProxy } from './services/controller-proxy.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

export interface CreateAppOptions {
  apps: CommerceApps;
  timeoutMs: number;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const controllerProxy = new ControllerProxy({ timeoutMs: options.timeoutMs });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '4mb' }));
  app.use(createHealthRouter(options.apps));
  app.use(createAppsRouter(options.apps, controllerProxy));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
