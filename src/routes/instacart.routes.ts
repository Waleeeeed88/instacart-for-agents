import { Router, type Request, type Response, type NextFunction } from 'express';
import { analyzeText } from '../parsers/index.js';
import { buildCartPlan } from '../services/cart-planner.js';
import { ControllerProxy } from '../services/controller-proxy.js';
import { InstacartLoginService } from '../services/instacart-login.js';
import type { CartPlanConstraints, InstacartControllerConfig, InstacartLoginStartRequest, InstacartLoginSubmitOtpRequest } from '../domain/types.js';
import { HttpError } from '../utils/http-error.js';

const SAFE_ACTIONS = ['click', 'type', 'press', 'scroll', 'reload', 'nav', 'click-near-text'] as const;
const INSTACART_BASES = ['/instacart', '/apps/instacart'] as const;

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

function asyncRoute(handler: Handler): Handler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createInstacartRouter(controller: InstacartControllerConfig, controllerProxy: ControllerProxy): Router {
  const router = Router();
  const loginService = new InstacartLoginService(controller, controllerProxy);

  router.get('/apps', (_req, res) => {
    res.json({ apps: [{ name: controller.name, baseUrl: controller.baseUrl }], native: '/instacart' });
  });

  router.use('/apps/:app', (req, _res, next) => {
    if (req.params.app !== 'instacart') {
      next(new HttpError("Only the native Instacart API is enabled. Use '/instacart/*'.", 404));
      return;
    }
    next();
  });

  for (const base of INSTACART_BASES) {
    router.get(`${base}/state`, asyncRoute(async (_req, res) => {
      res.json(await controllerProxy.getState(controller));
    }));

    router.get(`${base}/text`, asyncRoute(async (_req, res) => {
      res.type('text/plain').send(await controllerProxy.getText(controller));
    }));

    router.get(`${base}/screenshot.jpg`, asyncRoute(async (_req, res) => {
      const screenshot = await controllerProxy.getScreenshot(controller);
      res.set('cache-control', 'no-store').type('jpg').send(screenshot);
    }));

    router.get(`${base}/elements`, asyncRoute(async (_req, res) => {
      res.json(await controllerProxy.proxyJson<unknown>(controller, '/elements'));
    }));

    router.get(`${base}/analysis`, asyncRoute(async (_req, res) => {
      const [state, text] = await Promise.all([
        controllerProxy.getState(controller).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) })),
        controllerProxy.getText(controller),
      ]);
      res.json({ analyzedAt: new Date().toISOString(), app: controller.name, controller: controller.baseUrl, analysis: analyzeText(text, state) });
    }));

    router.get(`${base}/login`, asyncRoute(async (_req, res) => {
      res.json({ checkedAt: new Date().toISOString(), app: controller.name, status: await loginService.getStatus() });
    }));

    router.get(`${base}/login/status`, asyncRoute(async (_req, res) => {
      res.json({ checkedAt: new Date().toISOString(), app: controller.name, status: await loginService.getStatus() });
    }));

    router.post(`${base}/login/start`, asyncRoute(async (req, res) => {
      const request = (req.body ?? {}) as InstacartLoginStartRequest;
      res.json({ app: controller.name, status: await loginService.startPhoneLogin(request) });
    }));

    router.post(`${base}/login/otp`, asyncRoute(async (req, res) => {
      const request = (req.body ?? {}) as InstacartLoginSubmitOtpRequest;
      res.json({ app: controller.name, status: await loginService.submitOtp(request) });
    }));

    router.get(`${base}/vision`, asyncRoute(async (_req, res) => {
      const [state, text] = await Promise.all([
        controllerProxy.getState(controller).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) })),
        controllerProxy.getText(controller),
      ]);
      res.json({
        analyzedAt: new Date().toISOString(),
        app: controller.name,
        mode: 'dom-plus-screenshot',
        screenshot: `${base}/screenshot.jpg`,
        state,
        analysis: analyzeText(text, state),
        hints: {
          purpose: 'Use screenshot for pixel-level CV and analysis for structured Instacart cart/deal context.',
          safeActions: ['goto', ...SAFE_ACTIONS],
          hardRule: 'Never checkout/place orders without explicit user authorization.',
        },
      });
    }));

    router.post(`${base}/goto`, asyncRoute(async (req, res) => {
      res.json(await controllerProxy.postJson(controller, '/goto', { url: req.body?.url }));
    }));

    for (const action of SAFE_ACTIONS) {
      router.post(`${base}/${action}`, asyncRoute(async (req, res) => {
        res.json(await controllerProxy.postJson(controller, `/${action}`, req.body ?? {}));
      }));
    }

    router.post(`${base}/cart-plan`, asyncRoute(async (req, res) => {
      const [state, text] = await Promise.all([
        controllerProxy.getState(controller).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) })),
        controllerProxy.getText(controller),
      ]);
      const analysis = analyzeText(text, state);
      const constraints = (req.body ?? {}) as CartPlanConstraints;
      res.json({ app: controller.name, constraints, analysis, recommendation: buildCartPlan(analysis, constraints) });
    }));
  }

  return router;
}
