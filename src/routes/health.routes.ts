import { Router } from 'express';
import type { CommerceApps } from '../domain/types.js';

export function createHealthRouter(apps: CommerceApps): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'commerce-api', apps: Object.keys(apps) });
  });
  return router;
}
