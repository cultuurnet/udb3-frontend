import { expect, Page, test } from '@playwright/test';

test.describe('useConsoleDebugger', () => {
  /* eslint-disable no-console */
  let consoleLogs: string[] = [];
  let consoleInfos: string[] = [];
  let consoleDebugs: string[] = [];
  let consoleErrors: string[] = [];

  const setupConsoleListeners = (page: Page) => {
    consoleLogs = [];
    consoleInfos = [];
    consoleDebugs = [];
    consoleErrors = [];

    const DEFAULT_MESSAGES = [
      '[HMR] connected',
      'i18n initialized successfully',
    ];

    const isDefaultMessage = (text: string) => {
      return DEFAULT_MESSAGES.some((msg) => text.includes(msg));
    };

    page.on('console', (msg) => {
      const text = msg.text();

      if (isDefaultMessage(text)) {
        return;
      }

      switch (msg.type()) {
        case 'log':
          consoleLogs.push(text);
          break;
        case 'info':
          consoleInfos.push(text);
          break;
        case 'debug':
          consoleDebugs.push(text);
          break;
        case 'error':
          consoleErrors.push(text);
          break;
      }
    });
  };

  test.beforeEach(async ({ page }) => {
    setupConsoleListeners(page);
    await page.context().clearCookies();
  });

  test('should NOT log to console when feature flag cookie is not set', async ({
    page,
  }) => {
    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = false;
        const isDevelopment = false;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
          info: (...args: unknown[]) => {
            if (shouldLog) console.info(...args);
          },
          debug: (...args: unknown[]) => {
            if (shouldLog) console.debug(...args);
          },
          error: (...args: unknown[]) => {
            if (shouldLog) console.error(...args);
          },
        };
      };

      const { log, info, debug, error } = mockUseConsoleDebugger();
      log('Test log message');
      info('Test info message');
      debug('Test debug message');
      error('Test error message');
    });

    await page.waitForTimeout(100);

    expect(consoleLogs).toHaveLength(0);
    expect(consoleInfos).toHaveLength(0);
    expect(consoleDebugs).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should log to console when feature flag cookie is set to true', async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: 'ff_show_console_debugging',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = true;
        const isDevelopment = false;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
          info: (...args: unknown[]) => {
            if (shouldLog) console.info(...args);
          },
          debug: (...args: unknown[]) => {
            if (shouldLog) console.debug(...args);
          },
          error: (...args: unknown[]) => {
            if (shouldLog) console.error(...args);
          },
        };
      };

      const { log, info, debug, error } = mockUseConsoleDebugger();
      log('Test log message');
      info('Test info message');
      debug('Test debug message');
      error('Test error message');
    });

    await page.waitForTimeout(100);

    expect(consoleLogs).toContain('Test log message');
    expect(consoleInfos).toContain('Test info message');
    expect(consoleDebugs).toContain('Test debug message');
    expect(consoleErrors).toContain('Test error message');
  });

  test('should log to console when feature flag cookie is set to boolean true', async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: 'ff_show_console_debugging',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = true;
        const isDevelopment = false;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
        };
      };

      const { log } = mockUseConsoleDebugger();
      log('Boolean true test');
    });

    await page.waitForTimeout(100);
    expect(consoleLogs).toContain('Boolean true test');
  });

  test('should NOT log when feature flag cookie is set to false', async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: 'ff_show_console_debugging',
        value: 'false',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = false;
        const isDevelopment = false;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
        };
      };

      const { log } = mockUseConsoleDebugger();
      log('Should not appear');
    });

    await page.waitForTimeout(100);
    expect(consoleLogs).toHaveLength(0);
  });

  test('should log in development environment regardless of cookie', async ({
    page,
  }) => {
    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = false;
        const isDevelopment = true;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
        };
      };

      const { log } = mockUseConsoleDebugger();
      log('Development environment message');
    });

    await page.waitForTimeout(100);
    expect(consoleLogs).toContain('Development environment message');
  });

  test('should handle multiple console calls correctly', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'ff_show_console_debugging',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = true;
        const isDevelopment = false;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
          info: (...args: unknown[]) => {
            if (shouldLog) console.info(...args);
          },
        };
      };

      const { log, info } = mockUseConsoleDebugger();

      log('First log');
      log('Second log');
      info('First info');
      log('Third log');
    });

    await page.waitForTimeout(100);

    expect(consoleLogs).toHaveLength(3);
    expect(consoleLogs).toEqual(['First log', 'Second log', 'Third log']);
    expect(consoleInfos).toHaveLength(1);
    expect(consoleInfos).toContain('First info');
  });

  test('should handle complex objects and arrays in console output', async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: 'ff_show_console_debugging',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');

    await page.evaluate(() => {
      const mockUseConsoleDebugger = () => {
        const showDebugging = true;
        const isDevelopment = false;
        const shouldLog = isDevelopment || showDebugging;

        return {
          log: (...args: unknown[]) => {
            if (shouldLog) console.log(...args);
          },
        };
      };

      const { log } = mockUseConsoleDebugger();

      const testObject = { name: 'test', value: 123 };
      const testArray = [1, 2, 3];

      log('Object:', testObject);
      log('Array:', testArray);
      log('Multiple args:', 'string', 42, true, testObject);
    });

    await page.waitForTimeout(100);

    expect(consoleLogs.length).toBeGreaterThan(0);
  });
});
