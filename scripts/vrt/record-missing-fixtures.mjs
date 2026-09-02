import fs from 'node:fs';
import path from 'node:path';

import {
  cleanup,
  ensureAppAndMockServer,
  ensureAuthSession,
  run,
} from './shared.mjs';

const MISSING_FIXTURES_DIR = '.vrt-pages/missing-fixtures';

const sanitizeForFilename = (value) =>
  value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const buildRecordedFixtureFilename = (method, pathname) =>
  `${method}__${sanitizeForFilename(pathname)}.mjs`;

const writeRecordedFixture = ({
  method,
  pathname,
  searchParams,
  realUrl,
  body,
}) => {
  fs.mkdirSync(MISSING_FIXTURES_DIR, { recursive: true });
  const query = searchParams.toString();
  const filePath = path.join(
    MISSING_FIXTURES_DIR,
    buildRecordedFixtureFilename(method, pathname),
  );

  let formattedBody;
  try {
    formattedBody = JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    formattedBody = JSON.stringify(body);
  }

  fs.writeFileSync(
    filePath,
    `// Recorded from ${realUrl} on ${new Date().toISOString()}
// Method: ${method}  Path: ${pathname}${query ? `  Query: ${query}` : ''}
//
// Review and redact this before using it — copy the object into
// scripts/vrt/fixtures/<domain>.mjs under a real name, then wire it into
// MOCK_UPSTREAMS in scripts/vrt/mock-upstreams.mjs:
//   { method: '${method}', path: '${pathname}', response: <name> }

export const recordedFixture = ${formattedBody};
`,
  );
  return filePath;
};

const recordedFixtures = new Map();

const onUnmockedResponse = ({
  method,
  pathname,
  searchParams,
  realUrl,
  body,
}) => {
  const recordKey = `${method} ${pathname}`;
  if (recordedFixtures.has(recordKey)) return;
  try {
    recordedFixtures.set(
      recordKey,
      writeRecordedFixture({ method, pathname, searchParams, realUrl, body }),
    );
  } catch (error) {
    console.warn(
      `\nRecording: failed to record ${recordKey}: ${error.message}\n`,
    );
  }
};

const allowServerReuse = process.argv.includes('--reuse-server');
const playwrightArgs = process.argv
  .slice(2)
  .filter((arg) => arg !== '--reuse-server');

const main = async () => {
  await ensureAppAndMockServer({ onUnmockedResponse, allowServerReuse });

  try {
    if (!(await ensureAuthSession())) {
      process.exitCode = 1;
      return;
    }

    console.log('Recording real backend responses for missing fixtures...');

    process.exitCode = await run(
      'npx',
      [
        'playwright',
        'test',
        '-c',
        'playwright.vrt-pages.config.ts',
        ...playwrightArgs,
      ],
      { env: { ...process.env, VRT_RECORD_MODE: 'true' } },
    );

    if (process.exitCode === 0) {
      console.log(
        '\nDone recording — no screenshots were taken or compared.\n',
      );
    }

    if (recordedFixtures.size) {
      const lines = [...recordedFixtures].map(
        ([recordKey, filePath]) =>
          `  - ${recordKey} recorded to file://${path.resolve(filePath)}`,
      );
      console.log(
        `\nMock server: recorded real responses for:\n${lines.join('\n')}\n\n` +
          'Review and redact each one, copy it into scripts/vrt/fixtures/<domain>.mjs,\n' +
          'then wire it into MOCK_UPSTREAMS in scripts/vrt/mock-upstreams.mjs.\n',
      );
    }
  } finally {
    cleanup();
  }
};

await main();
