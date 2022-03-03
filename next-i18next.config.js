// const nl = require('./public/locales/nl.json');
// const fr = require('./public/locales/fr.json');
// const de = require('./public/locales/de.json');

// const LanguageDetector = require('i18next-browser-languagedetector');

const SupportedLanguages = {
  NL: 'nl',
  FR: 'fr',
  DE: 'de',
};

/**
 * @typedef { import('next-i18next/dist/types/types').UserConfig } UserConfig
 * @type UserConfig
 */
module.exports = {
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'fr', 'de'],
  },

  detection: { order: ['cookie'], lookupCookie: 'udb-language' },
  fallbackLng: 'nl',
  supportedLngs: Object.values(SupportedLanguages),
  debug: true,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },

  defaultNS: 'common',
  localeStructure: '{{lng}}',

  // use: [LanguageDetector],
};
