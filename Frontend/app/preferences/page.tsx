"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Preference {
  id: string
  label: string
  labelFr: string
  icon: string
}

const preferenceCategories = {
  interests: [
    { id: "sport", label: "Sport", labelFr: "Sport", icon: "⚽" },
    { id: "reading", label: "Reading", labelFr: "Lecture", icon: "📚" },
    { id: "science", label: "Science", labelFr: "Science", icon: "🔬" },
    { id: "philosophy", label: "Philosophy", labelFr: "Philosophie", icon: "🤔" },
    { id: "music", label: "Music", labelFr: "Musique", icon: "🎵" },
    { id: "movies", label: "Movies", labelFr: "Cinéma", icon: "🎬" },
    { id: "travel", label: "Travel", labelFr: "Voyage", icon: "✈️" },
    { id: "technology", label: "Technology", labelFr: "Technologie", icon: "💻" },
  ],
  habits: [
    { id: "smoker", label: "Smoker", labelFr: "Fumeur", icon: "🚬" },
    { id: "non_smoker", label: "Non-Smoker", labelFr: "Non-fumeur", icon: "🚭" },
    { id: "pets_lover", label: "Pets Lover", labelFr: "Amateur d'animaux", icon: "🐾" },
    { id: "quiet", label: "Quiet", labelFr: "Silencieux", icon: "🤫" },
    { id: "chatty", label: "Chatty", labelFr: "Bavard", icon: "💬" },
  ],
  driving: [
    { id: "fast_driver", label: "Fast Driver", labelFr: "Conducteur rapide", icon: "⚡" },
    { id: "careful_driver", label: "Careful Driver", labelFr: "Conducteur prudent", icon: "🛡️" },
    { id: "music_on", label: "Music On", labelFr: "Musique", icon: "🎶" },
    { id: "silence", label: "Silence", labelFr: "Silence", icon: "🔇" },
  ],
}

export default function PreferencesPage() {
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleSubmit = async () => {
    // TODO: Save preferences to database
    console.log("[v0] Selected preferences:", selectedPreferences)

    // Redirect to home page
    router.push("/")
  }

  const handleSkip = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
            <div className="relative h-25 w-25">
              <Image
              src="/images/logo.png"
              alt="DZ-CarPool"
              fill
              className="object-contain"
              priority
              />
            </div>
            </Link>


            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="font-medium">{language === "en" ? "EN" : "FR"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Tell us about yourself" : "Parlez-nous de vous"}
          </h1>
          <p className="text-lg text-gray-600">
            {language === "en"
              ? "Select your preferences to help us match you with the right travel companions"
              : "Sélectionnez vos préférences pour nous aider à vous mettre en relation avec les bons compagnons de voyage"}
          </p>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {language === "en" ? "Interests" : "Centres d'intérêt"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {preferenceCategories.interests.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  selectedPreferences.includes(pref.id)
                    ? "border-[#FF5722] bg-[#FF5722]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {selectedPreferences.includes(pref.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-3xl mb-2">{pref.icon}</div>
                <div className="text-sm font-medium text-gray-900">{language === "en" ? pref.label : pref.labelFr}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Habits */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{language === "en" ? "Habits" : "Habitudes"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {preferenceCategories.habits.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  selectedPreferences.includes(pref.id)
                    ? "border-[#FF5722] bg-[#FF5722]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {selectedPreferences.includes(pref.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-3xl mb-2">{pref.icon}</div>
                <div className="text-sm font-medium text-gray-900">{language === "en" ? pref.label : pref.labelFr}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Driving Preferences */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {language === "en" ? "Driving Preferences" : "Préférences de conduite"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {preferenceCategories.driving.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  selectedPreferences.includes(pref.id)
                    ? "border-[#FF5722] bg-[#FF5722]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {selectedPreferences.includes(pref.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-3xl mb-2">{pref.icon}</div>
                <div className="text-sm font-medium text-gray-900">{language === "en" ? pref.label : pref.labelFr}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 h-12 bg-white border-gray-300 hover:bg-gray-50"
          >
            {language === "en" ? "Skip for now" : "Passer pour l'instant"}
          </Button>
          <Button onClick={handleSubmit} className="flex-1 h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white">
            {language === "en" ? "Continue" : "Continuer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
