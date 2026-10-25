import { setupServer } from 'msw/node';

/** Mock API for component tests. Each test registers its own handlers with server.use(). */
export const server = setupServer();
