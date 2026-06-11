import http from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { instacartPromoCart } from './fixtures.js';

async function listen(server: http.Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return `http://127.0.0.1:${address.port}`;
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body ? JSON.parse(body) as Record<string, unknown> : {}));
  });
}

test('native Instacart HTTP API proxies a controller, analyzes cart, and returns safe cart-plan guidance', async (t) => {
  const controller = http.createServer((req, res) => {
    if (req.url === '/state') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ ok: true, url: 'https://www.instacart.ca/store/adonis', title: 'Instacart' }));
      return;
    }
    if (req.url === '/text') {
      res.setHeader('content-type', 'text/plain');
      res.end(instacartPromoCart);
      return;
    }
    if (req.url === '/screenshot.jpg') {
      res.setHeader('content-type', 'image/jpeg');
      res.end(Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
      return;
    }
    res.statusCode = 404;
    res.end('not found');
  });
  const controllerBaseUrl = await listen(controller);
  t.after(() => controller.close());

  const app = createApp({
    controller: { name: 'instacart', baseUrl: controllerBaseUrl },
    timeoutMs: 2_000,
  });
  const api = http.createServer(app);
  const apiBaseUrl = await listen(api);
  t.after(() => api.close());

  const healthResponse = await fetch(`${apiBaseUrl}/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).service, 'instacart-api');

  const analysisResponse = await fetch(`${apiBaseUrl}/instacart/analysis`);
  assert.equal(analysisResponse.status, 200);
  const analysisPayload = await analysisResponse.json();
  assert.equal(analysisPayload.analysis.surface, 'instacart');
  assert.equal(analysisPayload.analysis.subtotal, 88.96);

  const legacyAliasResponse = await fetch(`${apiBaseUrl}/apps/instacart/analysis`);
  assert.equal(legacyAliasResponse.status, 200);

  const unknownAppResponse = await fetch(`${apiBaseUrl}/apps/ubereats/analysis`);
  assert.equal(unknownAppResponse.status, 404);

  const planResponse = await fetch(`${apiBaseUrl}/instacart/cart-plan`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ maxSubtotal: 100, requireHalal: true, preferPromotions: true, focus: ['budget', 'fat', 'protein'], people: 2, days: 14 }),
  });
  assert.equal(planResponse.status, 200);
  const planPayload = await planResponse.json();
  assert.equal(planPayload.recommendation.eligible, true);
  assert.equal(planPayload.recommendation.checkoutBlocked, true);
  assert.ok(planPayload.recommendation.storeScope.compareStores.includes('Costco'));
});

test('phone OTP login layer models not-logged-in and verified logged-in cases', async (t) => {
  const previousDelay = process.env.INSTACART_LOGIN_DELAY_MS;
  process.env.INSTACART_LOGIN_DELAY_MS = '0';
  t.after(() => {
    if (previousDelay === undefined) delete process.env.INSTACART_LOGIN_DELAY_MS;
    else process.env.INSTACART_LOGIN_DELAY_MS = previousDelay;
  });

  const calls: Array<{ path: string; body?: Record<string, unknown> }> = [];
  let text = 'Instacart\nLog in\nContinue with phone\nPhone number';
  let state = { ok: true, url: 'https://www.instacart.ca/login', title: 'Log in | Instacart' };

  const controller = http.createServer(async (req, res) => {
    const path = req.url?.split('?')[0] ?? '';
    if (path === '/state') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(state));
      return;
    }
    if (path === '/text') {
      res.setHeader('content-type', 'text/plain');
      res.end(text);
      return;
    }
    if (path === '/elements') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({
        ok: true,
        elements: [
          { tag: 'input', placeholder: text.includes('Verification') ? 'Verification code' : 'Phone number', rect: { x: 100, y: 100, width: 240, height: 44 } },
          { tag: 'button', text: 'Continue', rect: { x: 360, y: 100, width: 100, height: 44 } },
        ],
      }));
      return;
    }
    if (['/goto', '/click', '/type', '/press'].includes(path)) {
      const body = await readJsonBody(req);
      calls.push({ path, body });
      if (path === '/goto') {
        state = { ok: true, url: String(body.url), title: 'Log in | Instacart' };
        text = 'Instacart\nLog in\nContinue with phone\nPhone number';
      }
      if (path === '/type' && body.text === '+15555550123') text = 'Verification code\nWe sent a text message\nEnter code';
      if (path === '/type' && body.text === '123456') {
        state = { ok: true, url: 'https://www.instacart.ca/store/?categoryFilter=homeTabForYou', title: 'Instacart - Home' };
        text = 'Instacart\n10 Honeycrisp Cres\nSpend $10.00 for $0 delivery fee\nAccount\nFood Basics';
      }
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.statusCode = 404;
    res.end('not found');
  });
  const controllerBaseUrl = await listen(controller);
  t.after(() => controller.close());

  const app = createApp({ controller: { name: 'instacart', baseUrl: controllerBaseUrl }, timeoutMs: 2_000 });
  const api = http.createServer(app);
  const apiBaseUrl = await listen(api);
  t.after(() => api.close());

  const initialStatusResponse = await fetch(`${apiBaseUrl}/instacart/login/status`);
  assert.equal(initialStatusResponse.status, 200);
  const initialStatus = await initialStatusResponse.json();
  assert.equal(initialStatus.status.loggedIn, false);
  assert.equal(initialStatus.status.nextAction, 'phone_required');

  const startResponse = await fetch(`${apiBaseUrl}/instacart/login/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '+1 (555) 555-0123' }),
  });
  assert.equal(startResponse.status, 200);
  const startPayload = await startResponse.json();
  assert.equal(startPayload.status.nextAction, 'otp_required');
  assert.ok(calls.some((call) => call.path === '/goto' && String(call.body?.url).includes('/login')));
  assert.ok(calls.some((call) => call.path === '/type' && call.body?.text === '+15555550123'));

  const otpResponse = await fetch(`${apiBaseUrl}/instacart/login/otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ otpCode: '123-456' }),
  });
  assert.equal(otpResponse.status, 200);
  const otpPayload = await otpResponse.json();
  assert.equal(otpPayload.status.loggedIn, true);
  assert.equal(otpPayload.status.nextAction, 'verify_connection');

  const verifiedResponse = await fetch(`${apiBaseUrl}/apps/instacart/login/status`);
  assert.equal(verifiedResponse.status, 200);
  const verifiedPayload = await verifiedResponse.json();
  assert.equal(verifiedPayload.status.loggedIn, true);
  assert.equal(verifiedPayload.status.nextAction, 'ready');
});
