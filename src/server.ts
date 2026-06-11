import { createApp } from './app.js';
import { loadEnvironment } from './config/environment.js';

const config = loadEnvironment();
const app = createApp({ controller: config.controller, timeoutMs: config.timeoutMs });

app.listen(config.port, '127.0.0.1', () => {
  console.log(`[instacart-api] listening http://127.0.0.1:${config.port}`);
  console.log(`[instacart-api] controller ${config.controller.baseUrl}`);
});
