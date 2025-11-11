"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

type Language = "pt" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from("profiles").select("preferences").eq("id", user.id).single()
          if (data?.preferences?.language) {
            setLanguageState(data.preferences.language)
            document.documentElement.lang = data.preferences.language
          }
        }
      } catch (error) {
        console.error("Error loading language:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguage()
  }, [])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    document.documentElement.lang = lang

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("preferences").eq("id", user.id).single()
        const currentPreferences = profile?.preferences || {}

        await supabase
          .from("profiles")
          .update({
            preferences: {
              ...currentPreferences,
              language: lang,
            },
          })
          .eq("id", user.id)
      }
    } catch (error) {
      console.error("Error updating language:", error)
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{!isLoading && children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
