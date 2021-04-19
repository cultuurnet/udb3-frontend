import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';
// @ts-expect-error ts-migrate(2732) FIXME: Cannot find module './fr.json'. Consider using '--... Remove this comment to see the full error message
import fr from './fr.json';
// @ts-expect-error ts-migrate(2732) FIXME: Cannot find module './nl.json'. Consider using '--... Remove this comment to see the full error message
import nl from './nl.json';

// @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      nl: { translation: nl },
    },
    detection: { order: ['cookie'], lookupCookie: 'udb-language' },
    fallbackLng: 'nl',
    supportedLng: ['nl', 'fr'],
    debug: false,
    defaultNS: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
