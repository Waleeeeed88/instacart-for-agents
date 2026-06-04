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

test('HTTP API proxies a controller, analyzes Instacart, and returns safe cart-plan guidance', async (t) => {
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
    apps: { instacart: { name: 'instacart', baseUrl: controllerBaseUrl } },
    timeoutMs: 2_000,
  });
  const api = http.createServer(app);
  const apiBaseUrl = await listen(api);
  t.after(() => api.close());

  const analysisResponse = await fetch(`${apiBaseUrl}/apps/instacart/analysis`);
  assert.equal(analysisResponse.status, 200);
  const analysisPayload = await analysisResponse.json();
  assert.equal(analysisPayload.analysis.surface, 'instacart');
  assert.equal(analysisPayload.analysis.subtotal, 88.96);

  const planResponse = await fetch(`${apiBaseUrl}/apps/instacart/cart-plan`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ maxSubtotal: 100, requireHalal: true, preferPromotions: true, focus: ['budget', 'fat'] }),
  });
  assert.equal(planResponse.status, 200);
  const planPayload = await planResponse.json();
  assert.equal(planPayload.recommendation.eligible, true);
  assert.equal(planPayload.recommendation.checkoutBlocked, true);
});
