import http from 'node:http';
import https from 'node:https';

const matchesFixture = (fixture, method, pathname, searchParams) => {
  if (fixture.method && fixture.method !== method) return false;
  if (typeof fixture.path === 'string' && fixture.path !== pathname)
    return false;
  if (fixture.path instanceof RegExp && !fixture.path.test(pathname))
    return false;
  if (fixture.query && !fixture.query(searchParams)) return false;
  return true;
};

const proxyRequest = (realUrl, req, res) => {
  const target = new URL(req.url, realUrl);
  const client = target.protocol === 'https:' ? https : http;
  const proxyReq = client.request(
    target,
    { method: req.method, headers: { ...req.headers, host: target.host } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on('error', (error) => {
    res.writeHead(502);
    res.end(`Mock proxy error: ${error.message}`);
  });
  req.pipe(proxyReq);
};

export const startMockServer = ({ port, upstreams }) => {
  if (upstreams.length === 0) {
    throw new Error(
      '\nstartMockServer requires at least one upstream to route unmatched requests to.\n',
    );
  }

  const byPrefixLengthDesc = [...upstreams].sort(
    (a, b) => b.pathPrefix.length - a.pathPrefix.length,
  );

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

    for (const upstream of upstreams) {
      const fixture = upstream.fixtures.find((candidate) =>
        matchesFixture(candidate, req.method, pathname, searchParams),
      );
      if (fixture) {
        res.writeHead(fixture.status ?? 200, {
          'content-type': 'application/json',
        });
        res.end(JSON.stringify(fixture.response));
        return;
      }
    }

    const matchedUpstream = byPrefixLengthDesc.find((upstream) =>
      pathname.startsWith(upstream.pathPrefix),
    );
    if (!matchedUpstream) {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(
        `Mock server: no upstream configured for ${pathname} — add it to MOCK_UPSTREAMS.`,
      );
      return;
    }
    const requestKey = `${req.method} ${pathname}`;
    if (!unmockedRequests.has(requestKey)) {
      unmockedRequests.set(requestKey, matchedUpstream.realUrl);
    }
    proxyRequest(matchedUpstream.realUrl, req, res);
  });

  server.unmockedRequests = unmockedRequests;

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, () => resolve(server));
  });
};
