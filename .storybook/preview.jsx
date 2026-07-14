import '@/styles/tailwind.css';

import { CookiesProvider } from 'react-cookie';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n/index';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { ThemeProvider } from '@/ui/ThemeProvider';

import { CustomCanvas } from './CustomCanvas';

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Introduction', 'Primitives', 'Components'],
    },
  },

  actions: { argTypesRegex: '^on.*' },

  controls: {
    sort: 'alpha',
    exclude: ['as'],
  },

  docs: {
    components: {
      Canvas: CustomCanvas,
    },
  },

  a11y: {
    // 'todo' - show a11y violations in the test UI only
    // 'error' - fail CI on a11y violations
    // 'off' - skip a11y checks entirely
    test: 'todo',
  },
};

export const BACKGROUND_CLASSES = {
  White: 'tw:bg-background',
  Grey: 'tw:bg-grey-background',
  Accent: 'tw:bg-accent',
};

export const globalTypes = {
  shadcnMigration: {
    name: 'UI',
    defaultValue: true,
    toolbar: {
      icon: 'switchalt',
      items: [
        { value: false, title: 'Legacy' },
        { value: true, title: 'shadcn' },
      ],
      dynamicTitle: true,
    },
  },

  background: {
    name: 'Background',
    defaultValue: 'White',
    toolbar: {
      icon: 'paintbrush',
      items: Object.keys(BACKGROUND_CLASSES),
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story, context) => {
    const isShadcn = context.globals.shadcnMigration;
    document.cookie = `ff_shadcn_migration=${isShadcn}; path=/`;

    const backgroundName = context.globals.background ?? 'White';

    return (
      <CookiesProvider>
        <GlobalStyle />
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
            <div className={BACKGROUND_CLASSES[backgroundName]}>
              <Story />
            </div>
          </I18nextProvider>
        </ThemeProvider>
      </CookiesProvider>
    );
  },
];
export const tags = ['autodocs'];
