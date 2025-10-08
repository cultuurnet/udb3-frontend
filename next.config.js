const { withSentryConfig } = require('@sentry/nextjs');

/**
 * @type {import('next').NextConfig}
 */
const moduleExports = {
  productionBrowserSourceMaps: true,
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
  pageExtensions: ['page.tsx', 'page.js', 'api.ts'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

/** @type {Partial<import('@sentry/nextjs').SentryWebpackPluginOptions>} */
const SentryWebpackPluginOptions = {
  silent: true,
  org: 'publiq-vzw',
  project: 'udb3-frontend',
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

module.exports.withoutSentry = moduleExports;

module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: false,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
