import {
  FeatureFlags,
  isFeatureFlagEnabledInCookies,
} from '@/hooks/useFeatureFlag';

class ConsoleDebugger {
  /* eslint-disable no-console */
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private getCookies() {
    if (typeof document === 'undefined') return {};

    return document.cookie.split('; ').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=');
      cookies[name] = value === 'true' ? true : value;
      return cookies;
    }, {} as any);
  }

  private shouldLog(): boolean {
    const showDebugging =
      typeof window !== 'undefined'
        ? isFeatureFlagEnabledInCookies(
            FeatureFlags.SHOW_CONSOLE_DEBUGGING,
            this.getCookies(),
          )
        : false;

    return this.isDevelopment || showDebugging;
  }

  log(...args: any[]): void {
    if (this.shouldLog()) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog()) {
      console.info(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog()) {
      console.debug(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog()) {
      console.error(...args);
    }
  }
}

const consoleDebugger = new ConsoleDebugger();

export default consoleDebugger;
