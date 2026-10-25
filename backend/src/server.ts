import { createApp } from './app';
import { env } from './config/env';

/**
 * Entry point. On Vercel the platform imports the default export (via ../server.ts)
 * and serves it as a function; everywhere else (local dev, `npm start`) the app
 * listens on PORT.
 */
const app = createApp();

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

export default app;
