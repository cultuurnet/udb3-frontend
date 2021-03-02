import { ThemeProvider } from '@/ui/ThemeProvider';
import '@/styles/global.scss';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { CustomCanvas } from './CustomCanvas';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Introduction', 'Primitives', 'Components'],
    },
  },
  docs: {
    components: {
      Canvas: CustomCanvas,
    },
  },
};

export const decorators = [
  (Story) => (
    <>
      <GlobalStyle />
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </>
  ),
];
