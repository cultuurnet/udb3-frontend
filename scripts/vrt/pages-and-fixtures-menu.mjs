import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  BACK,
  selectFromList,
  selectFromSearchableList,
} from './interactive-picker.mjs';

const VRT_PAGES_DIR = 'src/test/vrt-pages';

const TEST_TITLE_PATTERN =
  /\btest(?:\.only|\.skip|\.fixme)?\(\s*['"](.+?)['"]/g;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const collectPages = () => {
  const specFiles = fs
    .readdirSync(VRT_PAGES_DIR)
    .filter((file) => file.endsWith('.spec.ts'))
    .sort();

  return specFiles.flatMap((file) => {
    const content = fs.readFileSync(path.join(VRT_PAGES_DIR, file), 'utf-8');
    return [...content.matchAll(TEST_TITLE_PATTERN)].map((match) => ({
      file,
      title: match[1],
    }));
  });
};

const runScript = (scriptPath, args) =>
  new Promise((resolve) => {
    const child = spawn('node', [scriptPath, ...args], { stdio: 'inherit' });
    child.on('exit', (code) => resolve(code ?? 1));
  });

const SCRIPTS = {
  pages: 'scripts/vrt/pages.mjs',
  fixtures: 'scripts/vrt/record-missing-fixtures.mjs',
};

const printPlainList = (pages) => {
  let currentFile = null;
  for (const { file, title } of pages) {
    if (file !== currentFile) {
      console.log(`\n${file}`);
      currentFile = file;
    }
    console.log(`  ${title}`);
  }
  console.log('\nRun a single page with: yarn vrt:pages:single "<title>"\n');
};

const MENU_PAGES = 'Pages...';
const MENU_FIXTURES = 'Fixtures...';
const MENU_EXIT = 'Exit';

const PAGES_COMPARE_ALL = 'Compare all pages';
const PAGES_COMPARE_SPECIFIC = 'Compare specific tests...';
const PAGES_UPDATE_ALL = 'Update all baselines';
const PAGES_UPDATE_SPECIFIC = 'Update specific tests...';

const FIXTURES_RECORD_ALL = 'Record all fixtures';
const FIXTURES_RECORD_SPECIFIC = 'Record fixtures for specific tests...';

const searchAndSelectPages = async (pages) => {
  const entries = pages.map(({ file, title }) => `${file} › ${title}`);
  const selection = await selectFromSearchableList(
    'Search VRT page tests:',
    entries,
  );
  if (selection === null) return null;
  if (selection === BACK) return BACK;
  return selection.all.map((entry) => pages[entries.indexOf(entry)]);
};

const buildScopeArgs = (selected) => {
  const filePaths = [
    ...new Set(selected.map((page) => path.join(VRT_PAGES_DIR, page.file))),
  ];
  const titlePattern = selected
    .map((page) => escapeRegExp(page.title))
    .join('|');
  const pattern =
    selected.length === 1 ? `${titlePattern}$` : `(?:${titlePattern})$`;
  return [...filePaths, '-g', pattern];
};

const pickPages = async (pages) => {
  while (true) {
    const choice = await selectFromList('Pages', [
      {
        label: PAGES_COMPARE_ALL,
        description: 'Run every VRT page test and diff against baselines.',
      },
      {
        label: PAGES_COMPARE_SPECIFIC,
        description: 'Search and pick specific test(s) to compare.',
      },
      {
        label: PAGES_UPDATE_ALL,
        description: 'Re-record baseline screenshots for every VRT page test.',
      },
      {
        label: PAGES_UPDATE_SPECIFIC,
        description:
          'Search and pick specific test(s) to update baselines for.',
      },
    ]);
    if (choice === null) return null;
    if (choice === BACK) return BACK;

    if (choice === PAGES_COMPARE_ALL) return { command: 'pages', args: [] };
    if (choice === PAGES_UPDATE_ALL) {
      return { command: 'pages', args: ['update'] };
    }

    const selected = await searchAndSelectPages(pages);
    if (selected === null) return null;
    if (selected === BACK) continue;

    const scopeArgs = buildScopeArgs(selected);
    return {
      command: 'pages',
      args:
        choice === PAGES_UPDATE_SPECIFIC ? ['update', ...scopeArgs] : scopeArgs,
    };
  }
};

const pickFixtures = async (pages) => {
  while (true) {
    const choice = await selectFromList('Fixtures', [
      {
        label: FIXTURES_RECORD_ALL,
        description:
          'Runs every VRT page test against the real backend and records any response that is not mocked yet, for review.',
      },
      {
        label: FIXTURES_RECORD_SPECIFIC,
        description:
          'Search and select specific test(s) to record fixtures for.',
      },
    ]);
    if (choice === null) return null;
    if (choice === BACK) return BACK;

    if (choice === FIXTURES_RECORD_ALL) {
      return { command: 'fixtures', args: [] };
    }

    const selected = await searchAndSelectPages(pages);
    if (selected === null) return null;
    if (selected === BACK) continue;

    return { command: 'fixtures', args: buildScopeArgs(selected) };
  }
};

const main = async () => {
  const pages = collectPages();
  if (pages.length === 0) {
    console.log(`No VRT page tests found in ${VRT_PAGES_DIR}.`);
    return;
  }

  if (!process.stdin.isTTY) {
    printPlainList(pages);
    return;
  }

  while (true) {
    const choice = await selectFromList(
      'What do you want to run?',
      [
        {
          label: MENU_PAGES,
          description: 'Compare or update screenshots for VRT page tests.',
        },
        {
          label: MENU_FIXTURES,
          description:
            'Record real backend responses for endpoints that are not mocked yet.',
        },
        MENU_EXIT,
      ],
      { canGoBack: false },
    );

    if (choice === null || choice === MENU_EXIT) {
      console.clear();
      return;
    }

    const result =
      choice === MENU_PAGES
        ? await pickPages(pages)
        : await pickFixtures(pages);
    if (result === BACK) continue;
    if (result === null) {
      console.clear();
      return;
    }

    console.clear();
    process.exitCode = await runScript(SCRIPTS[result.command], result.args);
    return;
  }
};

await main();
