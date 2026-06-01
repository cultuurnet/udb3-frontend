const JsConfigPathsMapper = require('jsconfig-paths-jest-mapper');
const jsconfigpaths = new JsConfigPathsMapper({
  configFileName: 'tsconfig.json',
});

module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.(js|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          [
            'next/babel',
            {
              'preset-react': {
                runtime: 'automatic',
              },
            },
          ],
        ],
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/test/e2e',
  ],
  moduleNameMapper: {
    'styled-components':
      '<rootDir>/node_modules/styled-components/dist/styled-components.cjs.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    ...jsconfigpaths,
  },
};
