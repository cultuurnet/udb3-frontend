import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

import 'dotenv/config';

import { MOCK_PORT, MOCK_UPSTREAMS } from './mock-upstreams.mjs';
import { startMockServer } from './mock-server.mjs';

const BASE_URL = 'http://localhost:3000';
const READY_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 1_000;
const LOST_PIXEL_IMAGE = 'lostpixel/lost-pixel:v3.22.0';
const AUTH_STORAGE_STATE_PATH = 'playwright/.auth/user.json';
const AUTH_EXPIRY_BUFFER_SECONDS = 60;

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

const getHostIp = () => {
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family === 'IPv4' && !entry.internal) {
        return entry.address;
      }
    }
  }
  throw new Error(
    'Could not determine a non-internal IPv4 address for this host',
  );
};

const isLinux = os.platform() === 'linux';
const HOST_IP = isLinux ? 'localhost' : getHostIp();

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
  MOCK_UPSTREAMS.flatMap(({ envVar, fixtures }) => {
    const realUrl = process.env[envVar];
    if (!realUrl) {
      console.warn(`${envVar} is not set, skipping mock for it`);
      return [];
    }

    const { origin, pathname } = new URL(realUrl);
    const mockUrl = `http://${HOST_IP}:${MOCK_PORT}${realUrl.slice(origin.length)}`;

    return [{ envVar, realUrl, mockUrl, pathPrefix: pathname, fixtures }];
  });

const buildMockEnv = (upstreams) =>
  Object.fromEntries(upstreams.map(({ envVar, mockUrl }) => [envVar, mockUrl]));

const isUpdate = process.argv.includes('update');

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

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
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

const main = async () => {
  if (!(await isDockerAvailable())) {
    console.error('Docker is required to run this — is it installed and running?');
    process.exit(1);
  }

  const serverAlreadyRunning = await isServerUp();
  let server;
  let mockServer;

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

    const ready = await waitForServer();
    if (!ready) {
      console.error(`App never became reachable at ${BASE_URL}`);
      process.kill(-server.pid, 'SIGTERM');
      mockServer.close();
      process.exit(1);
    }
  } else {
    console.log(
      `Reusing app already running at ${BASE_URL} — mock data and feature flags will NOT apply unless that server was itself started with those env vars.`,
    );
  }

  try {
    if (hasValidStoredSession()) {
      console.log('Reusing still-valid authenticated storage state.');
    } else {
      console.log('Stored session missing or expired, logging in...');
      const authEnv = { ...process.env };
      delete authEnv.CI;
      const authExitCode = await run(
        'npx',
        ['playwright', 'test', '--project=setup-user'],
        { env: authEnv },
      );
      if (authExitCode !== 0) {
        console.error('Failed to refresh authenticated storage state');
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
      ...(isLinux ? ['--network', 'host'] : []),
      '-v',
      `${cwd}:${cwd}`,
      '-e',
      `WORKSPACE=${cwd}`,
      '-e',
      'DOCKER=1',
      '-e',
      `HOST_IP=${HOST_IP}`,
      '-e',
      'LOST_PIXEL_PAGES_ONLY=true',
      ...(isUpdate ? ['-e', 'LOST_PIXEL_MODE=update'] : []),
      LOST_PIXEL_IMAGE,
    ];
    process.exitCode = await run('docker', dockerArgs, {
      env: { ...process.env, DOCKER_DEFAULT_PLATFORM: 'linux/amd64' },
    });
  } finally {
    if (server) {
      process.kill(-server.pid, 'SIGTERM');
    }
    if (mockServer) {
      mockServer.close();
    }
  }
};

await main();
