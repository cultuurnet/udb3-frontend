import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import 'dotenv/config';

import { MOCK_PORT, MOCK_UPSTREAMS } from './mock-upstreams.mjs';
import { startMockServer } from './mock-server.mjs';

const BASE_URL = 'http://localhost:3000';
const READY_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 1_000;
const AUTH_STORAGE_STATE_PATH = 'playwright/.auth/user.json';
const AUTH_EXPIRY_BUFFER_SECONDS = 60;

const getPlaywrightImage = () => {
  const { version } = JSON.parse(
    fs.readFileSync('node_modules/@playwright/test/package.json', 'utf-8'),
  );
  return `mcr.microsoft.com/playwright:v${version}-jammy`;
};

const VRT_PAGES_OUTPUT_DIR = 'test-results-vrt-pages';

const findDiffImages = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findDiffImages(fullPath);
    return entry.name.endsWith('-diff.png') ? [fullPath] : [];
  });
};

const FEATURE_FLAGS = {
  boa: false,
  shadcn_migration: false,
};

const buildFeatureFlagEnv = () =>
  Object.fromEntries(
    Object.entries(FEATURE_FLAGS).map(([flag, enabled]) => [
      `NEXT_PUBLIC_FF_${flag.toUpperCase()}`,
      String(enabled),
    ]),
  );

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

const isLinux = os.platform() === 'linux';
const HOST_IP = isLinux ? 'localhost' : getHostIp();
if (!isLinux) {
  console.log(
    `Using ${HOST_IP} as the address the mock server and app bind to for the app <-> mock server connection.`,
  );
}

const APP_HOST = isLinux ? 'localhost' : 'host.docker.internal';

const hasValidStoredSession = () => {
  try {
    const storageState = JSON.parse(
      fs.readFileSync(AUTH_STORAGE_STATE_PATH, 'utf-8'),
    );
    const tokenCookie = storageState.cookies.find((c) => c.name === 'token');
    if (!tokenCookie) return false;

    const payload = tokenCookie.value.split('.')[1];
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Date.now() / 1000 < exp - AUTH_EXPIRY_BUFFER_SECONDS;
  } catch {
    return false;
  }
};

const configuredUpstreams = () =>
  MOCK_UPSTREAMS.map(({ envVar, fixtures }) => {
    const realUrl = process.env[envVar];
    if (!realUrl) {
      throw new Error(
        `\n${envVar} is not set — its API calls would hit the real backend and make baselines unreliable.\n`,
      );
    }

    const { origin, pathname } = new URL(realUrl);
    const mockUrl = `http://${HOST_IP}:${MOCK_PORT}${realUrl.slice(origin.length)}`;

    return { envVar, realUrl, mockUrl, pathPrefix: pathname, fixtures };
  });

const buildMockEnv = (upstreams) =>
  Object.fromEntries(upstreams.map(({ envVar, mockUrl }) => [envVar, mockUrl]));

const isUpdate = process.argv.includes('update');
const allowServerReuse = process.argv.includes('--reuse-server');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isServerUp = async () => {
  try {
    const response = await fetch(BASE_URL);
    return response.status < 500;
  } catch {
    return false;
  }
};

const waitForServer = async () => {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await isServerUp()) return true;
    await sleep(POLL_INTERVAL_MS);
  }
  return false;
};

const run = (command, args, options = {}, onSpawn) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    onSpawn?.(child);
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', reject);
  });

const isDockerAvailable = async () => {
  try {
    return (await run('docker', ['info'], { stdio: 'ignore' })) === 0;
  } catch {
    return false;
  }
};

let server;
let mockServer;
let dockerRun;

const cleanup = () => {
  if (server) {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {}
  }
  dockerRun?.kill('SIGTERM');
  if (mockServer) {
    if (mockServer.unmockedRequests?.size) {
      const lines = [...mockServer.unmockedRequests].map(
        ([requestKey, realUrl]) =>
          `  - ${requestKey} using real data from ${realUrl}`,
      );
      console.warn(
        `\nMock server: no fixtures were set for:\n${lines.join('\n')}\n`,
      );
    } else {
      console.log(
        '\nMock server: all requests were served from fixtures, no real data was used.\n',
      );
    }
    mockServer.closeAllConnections();
    mockServer.close();
  }
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    cleanup();
    process.exit(1);
  });
}

const main = async () => {
  if (!(await isDockerAvailable())) {
    console.error(
      '\nDocker is required to run this — is it installed and running?\n',
    );
    process.exit(1);
  }

  const serverAlreadyRunning = await isServerUp();

  if (!serverAlreadyRunning) {
    const upstreams = configuredUpstreams();

    console.log(`Starting mock server on port ${MOCK_PORT}...`);
    mockServer = await startMockServer({ port: MOCK_PORT, upstreams });

    console.log(`No app detected at ${BASE_URL}, starting one now...`);
    const startCommand = process.env.CI
      ? 'yarn start'
      : 'yarn build && yarn start';
    server = spawn(startCommand, {
      stdio: 'inherit',
      shell: true,
      detached: true,
      env: {
        ...process.env,
        ...buildMockEnv(upstreams),
        ...buildFeatureFlagEnv(),
      },
    });

    let exitCode = null;
    const serverExited = new Promise((resolve) =>
      server.once('exit', (code) => {
        exitCode = code ?? 1;
        resolve(exitCode);
      }),
    );

    const ready = await Promise.race([
      waitForServer(),
      serverExited.then(() => false),
    ]);
    if (!ready) {
      console.error(
        `\n${
          exitCode !== null
            ? `App process exited with code ${exitCode} before becoming reachable at ${BASE_URL} — see build/start output above.`
            : `App never became reachable at ${BASE_URL}`
        }\n`,
      );
      cleanup();
      process.exit(1);
    }
  } else if (allowServerReuse) {
    console.log(
      `Reusing app already running at ${BASE_URL} — mock data and feature flags will NOT apply unless that server was itself started with those env vars.`,
    );
  } else {
    console.error(
      `\nAn app is already running at ${BASE_URL}. Refusing to reuse it: mock data and feature flags would NOT apply, so screenshots would be taken against live acceptance data instead of fixtures. Stop that server, or pass --reuse-server to reuse it anyway.\n`,
    );
    process.exit(1);
  }

  try {
    if (hasValidStoredSession()) {
      console.log('Reusing still-valid authenticated storage state.');
    } else {
      console.log('Stored session missing or expired, logging in...');
      const authExitCode = await run(
        'npx',
        ['playwright', 'test', '--project=setup-user', '--reporter=list'],
        { env: { ...process.env, VRT_REUSE_SERVER: 'true' } },
      );
      if (authExitCode !== 0) {
        console.error('\nFailed to refresh authenticated storage state\n');
        process.exitCode = authExitCode;
        return;
      }
    }

    console.log(
      isUpdate
        ? 'Updating page baselines...'
        : 'Comparing page shots against baselines...',
    );
    const cwd = process.cwd();
    const dockerArgs = [
      'run',
      '--rm',
      '--ipc=host',
      ...(isLinux ? ['--network', 'host'] : []),
      '-v',
      `${cwd}:${cwd}`,
      '-w',
      cwd,
      '-e',
      `VRT_APP_HOST=${APP_HOST}`,
      getPlaywrightImage(),
      'npx',
      'playwright',
      'test',
      '-c',
      'playwright.vrt-pages.config.ts',
      ...(isUpdate ? ['--update-snapshots'] : []),
    ];
    process.exitCode = await run(
      'docker',
      dockerArgs,
      { env: { ...process.env, DOCKER_DEFAULT_PLATFORM: 'linux/amd64' } },
      (child) => {
        dockerRun = child;
      },
    );

    if (process.exitCode === 0) {
      console.log(
        isUpdate
          ? '\nBaselines updated.\n'
          : '\nNo visual differences found — all page shots match their baselines.\n',
      );
    } else {
      const diffImages = findDiffImages(VRT_PAGES_OUTPUT_DIR);
      if (diffImages.length > 0) {
        console.log('\nVisual differences found — click to view:');
        for (const image of diffImages) {
          console.log(`  file://${path.resolve(image)}`);
        }
        console.log();
      }
    }
  } finally {
    cleanup();
  }
};

await main();
