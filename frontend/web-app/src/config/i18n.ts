/**
 * i18n Configuration
 * Internationalization settings cho DocGO
 */

export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'vi',
  SUPPORTED_LOCALES: ['vi', 'en'],
  FALLBACK_LOCALE: 'vi',
  NAMESPACES: ['common', 'navigation', 'auth', 'documents', 'users'],
} as const

export const LOCALE_LABELS = {
  vi: 'Tiếng Việt',
  en: 'English',
} as const

export type Locale = typeof I18N_CONFIG.SUPPORTED_LOCALES[number]
export type Namespace = typeof I18N_CONFIG.NAMESPACES[number]
