import { Router } from 'express';
import type { InstacartControllerConfig } from '../domain/types.js';

export function createHealthRouter(controller: InstacartControllerConfig): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'instacart-api', app: controller.name, controller: controller.baseUrl });
  });
  return router;
}
