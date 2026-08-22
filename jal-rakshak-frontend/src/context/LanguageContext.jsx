import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext(null)

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function LanguageProvider({ children }) {
  const { t, i18n } = useTranslation()
  const [language, setLanguageState] = useState(() => localStorage.getItem('jalrakshak_lang') || 'en')

  const setLanguage = (langCode) => {
    setLanguageState(langCode)
    i18n.changeLanguage(langCode)
    localStorage.setItem('jalrakshak_lang', langCode)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = langCode
      document.documentElement.setAttribute('data-lang', langCode)
    }
  }

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
      document.documentElement.setAttribute('data-lang', language)
    }
  }, [language, i18n])

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  ]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
