"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Menu, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setMobileMenuOpen(false)
    }
  }

  const toggleLanguage = (lang: "en" | "fr") => {
    setLanguage(lang)
    setLangMenuOpen(false)
  }
  
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-15 h-15 rounded-lg bg-[#FF5722]">
              <Image src="/images/logo.png" alt="DZ-CarPool" width={75} height={75} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">DZ-CarPool</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("why-us")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("whyUs")}</button>
            <button onClick={() => scrollToSection("cta")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("offerFind")}</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("howItWorks")}</button>
            <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("faq")}</button>
          </nav>

          {/* Desktop Auth / Language */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-md shadow-lg overflow-hidden">
                  <button onClick={() => toggleLanguage("en")} className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${language === "en" ? "bg-accent font-medium" : ""}`}>English</button>
                  <button onClick={() => toggleLanguage("fr")} className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${language === "fr" ? "bg-accent font-medium" : ""}`}>Français</button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium">{user?.first_name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t("login")}</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white">{t("signup")}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <button onClick={() => scrollToSection("why-us")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left">{t("whyUs")}</button>
              <button onClick={() => scrollToSection("cta")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left">{t("offerFind")}</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left">{t("howItWorks")}</button>
              <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left">{t("faq")}</button>

              <div className="border-t border-border pt-4 flex gap-2">
                <button onClick={() => toggleLanguage("en")} className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${language === "en" ? "bg-accent font-medium" : "hover:bg-accent"}`}>English</button>
                <button onClick={() => toggleLanguage("fr")} className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${language === "fr" ? "bg-accent font-medium" : "hover:bg-accent"}`}>Français</button>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm font-medium px-3 py-2">{user?.first_name}</span>
                    <Button variant="ghost" size="sm" onClick={logout} className="justify-start w-full">Logout</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="justify-start w-full">{t("login")}</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white w-full">{t("signup")}</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
