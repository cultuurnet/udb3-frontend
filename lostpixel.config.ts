import type { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    elementLocator: '#storybook-root',
  },
  threshold: 20,
  generateOnly: true,
  failOnDifference: true,
};
