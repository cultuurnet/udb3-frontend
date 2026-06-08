import type { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    elementLocator: '#storybook-root',
  },
  generateOnly: true,
  failOnDifference: false,
  threshold: 20,
};
