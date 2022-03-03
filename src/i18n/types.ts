import type { NextJsI18NConfig } from 'next-i18next';

const SupportedLanguages = {
  NL: 'nl',
  FR: 'fr',
  DE: 'de',
} as const;

type Test = NextJsI18NConfig;

// i18n.use(LanguageDetector);
// i18n.use(initReactI18next);
// i18n
//   .init({
//     resources: {
//       fr: { translation: fr },
//       nl: { translation: nl },
//       de: { translation: de },
//     },
//     detection: { order: ['cookie'], lookupCookie: 'udb-language' },
//     fallbackLng: 'nl',
//     supportedLngs: Object.values(SupportedLanguages),
//     debug: false,
//     interpolation: {
//       escapeValue: false, // not needed for react as it escapes by default
//     },
//   })
//   .then(() => {
//     // eslint-disable-next-line no-console
//     console.log('i18n initialized successfully');
//   })
//   .catch((error) => {
//     // eslint-disable-next-line no-console
//     console.log('i18n initialisation failed', error);
//   });

export { SupportedLanguages };
