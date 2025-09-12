const { withoutSentry: nextConfig } = require('../next.config.js');
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
  ...nextConfig,
  stories: ['../src/ui/**/*.stories.tsx'],
  framework: '@storybook/nextjs',
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  docs: {
    autodocs: true,
  },

  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      ...paths,
    };

    config.resolve.fallback = {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
};
