// eslint-disable-next-line import/no-extraneous-dependencies
import i18next from 'i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import { initReactI18next } from 'react-i18next';
import LngDetector from 'i18next-browser-languagedetector';
import enCommon from './i18n/en/common.json';
import viCommon from './i18n/vi/common.json';

i18next
  .use(initReactI18next)
  .use(LngDetector)
  .init({
    debug: true,
    fallbackLng: 'vi',
    defaultNS: 'common',
    resources: {
      en: {
        common: enCommon,
      },
      vi: {
        common: viCommon,
      },
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18next;
