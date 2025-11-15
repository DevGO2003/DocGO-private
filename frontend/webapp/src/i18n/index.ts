import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';
import { vi as viRepositories } from '../features/repositories/i18n/vi';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        repositories: {
          // English translations for repositories will be added later
          // For now, using empty object to avoid errors
        }
      },
      vi: {
        common: viCommon,
        repositories: viRepositories.repositories
      },
    },
    fallbackLng: 'vi',
    supportedLngs: ['en', 'vi'],
    ns: ['common', 'repositories'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'querystring', 'cookie', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

const storedLng = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
if (!storedLng) {
  i18n.changeLanguage('vi');
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', 'vi');
  }
}

export default i18n;
