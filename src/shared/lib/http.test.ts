import { http as mswHttp, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';

import { buildUrl, http, HttpError, isHttpError } from './http';

describe('buildUrl', () => {
  it('resolves a relative base against the current origin', () => {
    expect(buildUrl('/questions')).toBe(`${window.location.origin}/api/questions`);
  });

  it('omits undefined and empty search params', () => {
    const url = new URL(buildUrl('questions', { q: 'hooks', category: undefined, page: '' }));
    expect(url.search).toBe('?q=hooks');
  });
});

describe('http', () => {
  it('returns the parsed JSON body on success', async () => {
    server.use(mswHttp.get('/api/ping', () => HttpResponse.json({ ok: true })));

    await expect(http<{ ok: boolean }>('/ping')).resolves.toEqual({ ok: true });
  });

  it('sends JSON bodies with the right content type', async () => {
    let received: { contentType: string | null; body: Record<string, unknown> } | undefined;
    server.use(
      mswHttp.post('/api/echo', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        received = { contentType: request.headers.get('content-type'), body };
        return HttpResponse.json(body, { status: 201 });
      }),
    );

    await http('/echo', { method: 'POST', body: { hello: 'world' } });

    expect(received?.contentType).toBe('application/json');
    expect(received?.body).toEqual({ hello: 'world' });
  });

  it('throws an HttpError carrying the status and body for non-2xx responses', async () => {
    server.use(
      mswHttp.get('/api/missing', () =>
        HttpResponse.json({ message: 'Nope' }, { status: 404, statusText: 'Not Found' }),
      ),
    );

    const error = await http('/missing').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect(isHttpError(error, 404)).toBe(true);
    expect(isHttpError(error, 500)).toBe(false);
    expect((error as HttpError).body).toEqual({ message: 'Nope' });
    expect((error as HttpError).message).toMatch(/404/);
  });

  it('resolves to undefined for 204 No Content', async () => {
    server.use(mswHttp.delete('/api/thing', () => new HttpResponse(null, { status: 204 })));

    await expect(http('/thing', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});
