const tsConfig = require('../tsconfig.json');
const path = require('path');

const paths = Object.entries(tsConfig.compilerOptions.paths).reduce(
  (acc, [key, val]) => {
    const parsedPath = val[0].split('/*')[0];

    return {
      ...acc,
      [key.split('/*')[0]]: path.resolve(__dirname, `../src/${parsedPath}`),
    };
  },
  {},
);

module.exports = {
  stories: ['../src/ui/**/*.stories.tsx'],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],

  viteFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...paths,
    };

    return config;
  },
};
