"use client"

import { createContext, useContext, useEffect, useState } from "react"

const initialState = {
  language: "en",
  setLanguage: () => null,
  toggleLanguage: () => null,
  isRTL: false,
}

const LanguageProviderContext = createContext(initialState)

export function LanguageProvider({ children, defaultLanguage = "en", storageKey = "ui-language", ...props }) {
  const [language, setLanguage] = useState(defaultLanguage)

  useEffect(() => {
    const savedLanguage = localStorage.getItem(storageKey)

    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement
    const body = window.document.body

    // Set language and direction attributes on html element
    root.lang = language
    root.dir = language === "ar" ? "rtl" : "ltr"
    
    // Also set dir on body's first child (the main container)
    const mainContainer = body.querySelector('.flex.min-h-screen.flex-col')
    if (mainContainer) {
      mainContainer.dir = language === "ar" ? "rtl" : "ltr"
    }
    
    localStorage.setItem(storageKey, language)
  }, [language, storageKey])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isRTL: language === "ar",
  }

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
