import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './fr.json';
import nl from './nl.json';

i18n.use(LanguageDetector);
i18n.use(initReactI18next);
i18n
  .init({
    resources: {
      fr: { translation: fr },
      nl: { translation: nl },
    },
    detection: { order: ['cookie'], lookupCookie: 'udb-language' },
    fallbackLng: 'nl',
    supportedLngs: ['nl', 'fr'],
    debug: false,
    defaultNS: undefined,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  })
  .then(() => {})
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log(error);
  });

export default i18n;
