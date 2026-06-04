import { Router } from 'express';
import { analyzeText } from '../parsers/index.js';
import { buildCartPlan } from '../services/cart-planner.js';
import { ControllerProxy } from '../services/controller-proxy.js';
import type { CartPlanConstraints, CommerceAppConfig, CommerceApps } from '../domain/types.js';
import { HttpError } from '../utils/http-error.js';

const SAFE_ACTIONS = ['click', 'type', 'press', 'scroll', 'reload', 'nav', 'click-near-text'] as const;

export function createAppsRouter(apps: CommerceApps, controllerProxy: ControllerProxy): Router {
  const router = Router();

  const getTarget = (name: string): CommerceAppConfig => {
    const target = apps[name];
    if (!target) throw new HttpError(`Unknown app '${name}'. Known apps: ${Object.keys(apps).join(', ')}`, 404);
    return target;
  };

  router.get('/apps', (_req, res) => {
    res.json({ apps: Object.values(apps).map(({ name, baseUrl }) => ({ name, baseUrl })) });
  });

  router.get('/apps/:app/state', async (req, res, next) => {
    try { res.json(await controllerProxy.getState(getTarget(req.params.app))); } catch (error) { next(error); }
  });

  router.get('/apps/:app/text', async (req, res, next) => {
    try { res.type('text/plain').send(await controllerProxy.getText(getTarget(req.params.app))); } catch (error) { next(error); }
  });

  router.get('/apps/:app/screenshot.jpg', async (req, res, next) => {
    try {
      const screenshot = await controllerProxy.getScreenshot(getTarget(req.params.app));
      res.set('cache-control', 'no-store').type('jpg').send(screenshot);
    } catch (error) { next(error); }
  });

  router.get('/apps/:app/elements', async (req, res, next) => {
    try { res.json(await controllerProxy.proxyJson<unknown>(getTarget(req.params.app), '/elements')); } catch (error) { next(error); }
  });

  router.get('/apps/:app/analysis', async (req, res, next) => {
    try {
      const target = getTarget(req.params.app);
      const [state, text] = await Promise.all([
        controllerProxy.getState(target).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) })),
        controllerProxy.getText(target),
      ]);
      res.json({ analyzedAt: new Date().toISOString(), app: target.name, controller: target.baseUrl, analysis: analyzeText(text, state) });
    } catch (error) { next(error); }
  });

  router.get('/apps/:app/vision', async (req, res, next) => {
    try {
      const target = getTarget(req.params.app);
      const [state, text] = await Promise.all([
        controllerProxy.getState(target).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) })),
        controllerProxy.getText(target),
      ]);
      res.json({
        analyzedAt: new Date().toISOString(),
        app: target.name,
        mode: 'dom-plus-screenshot',
        screenshot: `/apps/${target.name}/screenshot.jpg`,
        state,
        analysis: analyzeText(text, state),
        hints: {
          purpose: 'Use screenshot for pixel-level CV and analysis for structured cart/deal context.',
          safeActions: ['goto', ...SAFE_ACTIONS],
          hardRule: 'Never checkout/place orders without explicit user authorization.',
        },
      });
    } catch (error) { next(error); }
  });

  router.post('/apps/:app/goto', async (req, res, next) => {
    try { res.json(await controllerProxy.postJson(getTarget(req.params.app), '/goto', { url: req.body?.url })); } catch (error) { next(error); }
  });

  for (const action of SAFE_ACTIONS) {
    router.post(`/apps/:app/${action}`, async (req, res, next) => {
      try { res.json(await controllerProxy.postJson(getTarget(req.params.app), `/${action}`, req.body ?? {})); } catch (error) { next(error); }
    });
  }

  router.post('/apps/:app/cart-plan', async (req, res, next) => {
    try {
      const target = getTarget(req.params.app);
      const [state, text] = await Promise.all([
        controllerProxy.getState(target).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) })),
        controllerProxy.getText(target),
      ]);
      const analysis = analyzeText(text, state);
      const constraints = (req.body ?? {}) as CartPlanConstraints;
      res.json({ app: target.name, constraints, analysis, recommendation: buildCartPlan(analysis, constraints) });
    } catch (error) { next(error); }
  });

  return router;
}
