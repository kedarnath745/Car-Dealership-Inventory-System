import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../src/middleware/errorHandler';

/** A tiny app whose only route throws the given error. */
function appThrowing(error: unknown) {
  const app = express();
  app.use(express.json({ limit: '1kb' }));
  app.post('/boom', () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  it('turns unexpected errors into a generic 500 without leaking details', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await request(appThrowing(new Error('db password is hunter2'))).post('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
    });
    expect(JSON.stringify(res.body)).not.toContain('hunter2');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('returns 413 PAYLOAD_TOO_LARGE for an oversized JSON body', async () => {
    const res = await request(appThrowing(new Error('unreachable')))
      .post('/boom')
      .send({ blob: 'x'.repeat(2048) });

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it.each([
    ['charset.unsupported', 415],
    ['encoding.unsupported', 415],
    ['request.aborted', 400],
  ])('passes through the client status of the "%s" body-parser error', async (type, status) => {
    const res = await request(appThrowing({ type, status })).post('/boom');

    expect(res.status).toBe(status);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('still treats a body-parser error with a server status as a 500', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await request(appThrowing({ type: 'stream.encoding.set', status: 500 })).post(
      '/boom',
    );

    expect(res.status).toBe(500);
    consoleError.mockRestore();
  });
});
