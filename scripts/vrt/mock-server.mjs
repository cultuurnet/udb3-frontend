import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';

const matchesFixture = (fixture, method, pathname, searchParams) => {
  if (fixture.method && fixture.method !== method) return false;
  if (typeof fixture.path === 'string' && fixture.path !== pathname)
    return false;
  if (fixture.path instanceof RegExp && !fixture.path.test(pathname))
    return false;
  if (fixture.query && !fixture.query(searchParams)) return false;
  return true;
};

const decodeBody = (buffer, contentEncoding) => {
  switch (contentEncoding) {
    case 'gzip':
      return zlib.gunzipSync(buffer);
    case 'br':
      return zlib.brotliDecompressSync(buffer);
    case 'deflate':
      return zlib.inflateSync(buffer);
    default:
      return buffer;
  }
};

const proxyRequest = (target, req, res, onBody) => {
  const client = target.protocol === 'https:' ? https : http;
  const proxyReq = client.request(
    target,
    { method: req.method, headers: { ...req.headers, host: target.host } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
      if (onBody) {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          const body = decodeBody(
            Buffer.concat(chunks),
            proxyRes.headers['content-encoding'],
          );
          onBody(body.toString('utf-8'));
        });
      }
    },
  );
  proxyReq.on('error', (error) => {
    res.writeHead(502);
    res.end(`Mock proxy error: ${error.message}`);
  });
  req.pipe(proxyReq);
};

export const startMockServer = ({ port, upstreams, onUnmockedResponse }) => {
  if (upstreams.length === 0) {
    throw new Error(
      '\nstartMockServer requires at least one upstream to route unmatched requests to.\n',
    );
  }

  const unmockedRequests = new Map();

  const server = http.createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');
    res.setHeader('access-control-allow-origin', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': '*',
      });
      res.end();
      return;
    }

    const upstream = upstreams.find(
      ({ mockPathPrefix }) =>
        pathname === mockPathPrefix ||
        pathname.startsWith(`${mockPathPrefix}/`),
    );
    if (!upstream) {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(
        `Mock server: ${pathname} was not rewritten from any upstream in MOCK_UPSTREAMS.`,
      );
      return;
    }

    const upstreamPathname = pathname.slice(upstream.mockPathPrefix.length);

    const fixture = upstream.fixtures.find((candidate) =>
      matchesFixture(candidate, req.method, upstreamPathname, searchParams),
    );
    if (fixture) {
      res.writeHead(fixture.status ?? 200, {
        'content-type': fixture.contentType ?? 'application/json',
      });
      res.end(
        fixture.contentType && typeof fixture.response === 'string'
          ? fixture.response
          : JSON.stringify(fixture.response),
      );
      return;
    }

    const requestKey = `${req.method} ${upstreamPathname} (${upstream.envVar})`;
    if (!unmockedRequests.has(requestKey)) {
      unmockedRequests.set(requestKey, upstream.realUrl);
    }

    const target = new URL(
      `${upstream.realOrigin}${req.url.slice(upstream.mockPathPrefix.length)}`,
    );

    if (!onUnmockedResponse) {
      proxyRequest(target, req, res);
      return;
    }

    proxyRequest(target, req, res, (body) => {
      onUnmockedResponse({
        method: req.method,
        pathname: upstreamPathname,
        searchParams,
        envVar: upstream.envVar,
        realUrl: upstream.realUrl,
        body,
      });
    });
  });

  server.unmockedRequests = unmockedRequests;

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, () => resolve(server));
  });
};
