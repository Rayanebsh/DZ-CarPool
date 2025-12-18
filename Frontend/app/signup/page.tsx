"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Upload } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context" // ⬅️ Ajouter
import authService from "@/services/auth.service" // ⬅️ Ajouter
export default function SignupPage() {
  const { t, language, setLanguage } = useLanguage()
  const [activeTab, setActiveTab] = useState<"register" | "login">("register")
   const { register } = useAuth() // ⬅️ Ajouter
  const [userType, setUserType] = useState<"driver" | "passenger">("driver")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phoneNumber: "",
    password: "",
    passwordConfirm: "",
  })
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false) // ⬅️ Ajouter
  const [error, setError] = useState<string | null>(null) // ⬅️ Ajouter
  const fileInputRef = useRef<HTMLInputElement>(null)

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setError(null) // Réinitialiser l'erreur
  }

  const handleIdPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdPhotoFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIdPhotoFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Vérifier que les mots de passe correspondent
      if (formData.password !== formData.passwordConfirm) {
        throw new Error("Les mots de passe ne correspondent pas")
      }
      // Appeler l'API d'inscription
      await register({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phoneNumber,
      })

      // Si document uploadé, l'envoyer après inscription
      if (idPhotoFile) {
        try {
          await authService.uploadDocument(idPhotoFile, 'CNI')
        } catch (uploadError) {
          console.error('Erreur upload document:', uploadError)
          // On ne bloque pas l'inscription si l'upload échoue
        }
      }

      // Succès - redirection automatique via AuthContext
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 flex-col justify-between">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FF5722]">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DZ-CarPool</span>
          </Link>

          <div className="inline-block px-6 py-2.5 bg-[#FF9B89] text-gray-900 rounded-full text-sm font-medium">
            {t("forAlgeria")}
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">{t("trustedRideSharing")}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{t("connectWithDrivers")}</p>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden">
            <Image src="/images/img.png" alt="Road journey" width={600} height={400} className="object-cover w-full" />
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("getStarted")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("createAccountOrLogin")}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t("register")}
              </button>
              <Link
                href="/login"
                className="flex-1 py-2.5 text-sm font-medium rounded-md text-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("login")}
              </Link>
            </div>

            {/* User Type Selection */}
            <div className="flex gap-3">
              <button
                onClick={() => setUserType("driver")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  userType === "driver" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Car className="w-5 h-5" />
                <span className="text-sm font-medium">{t("imDriver")}</span>
              </button>
              <button
                onClick={() => setUserType("passenger")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  userType === "passenger" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium">{t("imPassenger")}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">{t("firstName")}</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="last_name">{t("lastName")}</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
            </div>


              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t("emailAddress")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11 bg-white border-gray-300 focus:border-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  {t("phoneNumber")}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="h-11 bg-white border-gray-300 focus:border-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t("password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11 bg-white border-gray-300 focus:border-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">
                  {t("confirmPassword")}
                </Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  required
                  className="h-11 bg-white border-gray-300 focus:border-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {t("uploadIdPhoto")} <span className="text-gray-400 font-normal">({t("optional")})</span>
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">{idPhotoFile ? idPhotoFile.name : t("dragDropUpload")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {t("browseFile")}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIdPhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-base"
              >
                {t("createAccount")}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">{t("or")}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border-gray-300 hover:bg-gray-50 font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("continueWithGoogle")}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              {t("agreeTerms")}{" "}
              <Link href="/terms" className="text-[#FF5722] hover:underline">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" className="text-[#FF5722] hover:underline">
                {t("privacyPolicy")}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
