import fs from 'node:fs';
import path from 'node:path';

import {
  APP_HOST,
  cleanup,
  ensureAppAndMockServer,
  ensureAuthSession,
  isDockerAvailable,
  isLinux,
  registerCleanupTask,
  run,
} from './shared.mjs';

const VRT_PAGES_OUTPUT_DIR = '.vrt-pages/test-results';

const getPlaywrightImage = () => {
  const { version } = JSON.parse(
    fs.readFileSync('node_modules/@playwright/test/package.json', 'utf-8'),
  );
  return `mcr.microsoft.com/playwright:v${version}-jammy`;
};

const findDiffImages = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findDiffImages(fullPath);
    return entry.name.endsWith('-diff.png') ? [fullPath] : [];
  });
};

const isUpdate = process.argv.includes('update');
const allowServerReuse = process.argv.includes('--reuse-server');
const playwrightArgs = process.argv
  .slice(2)
  .filter((arg) => arg !== 'update' && arg !== '--reuse-server');

let dockerRun;
registerCleanupTask(() => dockerRun?.kill('SIGTERM'));

const main = async () => {
  if (!(await isDockerAvailable())) {
    console.error(
      '\nDocker is required to run this — is it installed and running?\n',
    );
    process.exit(1);
  }

  await ensureAppAndMockServer({ allowServerReuse });

  try {
    if (!(await ensureAuthSession())) {
      process.exitCode = 1;
      return;
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
      ...playwrightArgs,
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
      if (isUpdate) {
        console.log(
          '\nUpdate complete — baselines were only rewritten where the capture actually differed.\n',
        );
      } else {
        console.log(
          '\nNo visual differences found — all page shots match their baselines.\n',
        );
      }
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
