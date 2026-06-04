import { createApp } from './app.js';
import { loadEnvironment } from './config/environment.js';

const config = loadEnvironment();
const app = createApp({ apps: config.apps, timeoutMs: config.timeoutMs });

app.listen(config.port, '127.0.0.1', () => {
  const appSummary = Object.values(config.apps).map(({ name, baseUrl }) => `${name}=${baseUrl}`).join(', ');
  console.log(`[commerce-api] listening http://127.0.0.1:${config.port}`);
  console.log(`[commerce-api] apps ${appSummary}`);
});
