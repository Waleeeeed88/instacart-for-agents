import express, { type Express } from 'express';
import type { InstacartControllerConfig } from './domain/types.js';
import { createInstacartRouter } from './routes/instacart.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { ControllerProxy } from './services/controller-proxy.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

export interface CreateAppOptions {
  controller: InstacartControllerConfig;
  timeoutMs: number;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const controllerProxy = new ControllerProxy({ timeoutMs: options.timeoutMs });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '4mb' }));
  app.use(createHealthRouter(options.controller));
  app.use(createInstacartRouter(options.controller, controllerProxy));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
