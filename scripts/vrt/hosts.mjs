import os from 'node:os';

// Never import from anything Playwright loads: in the container getHostIp()
// sees container interfaces, not this machine's.

export const MOCK_PORT = 4010;

const PRIVATE_IPV4_RANGES = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

const getHostIp = () => {
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (
        entry.family === 'IPv4' &&
        !entry.internal &&
        PRIVATE_IPV4_RANGES.some((range) => range.test(entry.address))
      ) {
        return entry.address;
      }
    }
  }
  throw new Error(
    '\nCould not determine a private, non-internal IPv4 address for this host\n',
  );
};

export const isLinux = os.platform() === 'linux';

const HOST_IP = isLinux ? 'localhost' : getHostIp();
if (!isLinux) {
  console.log(
    `Using ${HOST_IP} as the address the mock server and app bind to for the app <-> mock server connection.`,
  );
}

export const MOCK_ORIGIN = `http://${HOST_IP}:${MOCK_PORT}`;

export const APP_HOST = isLinux ? 'localhost' : 'host.docker.internal';

export const toMockPathPrefix = (envVar) =>
  `/__vrt/${envVar
    .replace(/^NEXT_PUBLIC_/, '')
    .replace(/_URL$/, '')
    .toLowerCase()
    .replace(/_/g, '-')}`;
