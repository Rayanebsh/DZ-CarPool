"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { LocationAutocomplete } from "@/components/location-autocomplete"
import { Calendar, Users, DollarSign, Clock } from "lucide-react"
import Image from "next/image"

export default function OfferRidePage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "",
    price: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Offer ride form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-50 h-50 rounded-lg bg-[#FF5722] mx-auto mb-4">
              <Image src="/images/logo.png" alt="DZ-CarPool" width={200} height={200} className="object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t("offerRideTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("offerRideSubtitle")}</p>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="from" className="text-sm font-medium">
                    {t("from")}
                  </Label>
                  <LocationAutocomplete
                    value={formData.from}
                    onChange={(value) => setFormData({ ...formData, from: value })}
                    placeholder={t("from")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to" className="text-sm font-medium">
                    {t("to")}
                  </Label>
                  <LocationAutocomplete
                    value={formData.to}
                    onChange={(value) => setFormData({ ...formData, to: value })}
                    placeholder={t("to")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF5722]" />
                    {t("date")}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF5722]" />
                    {t("departureTime")}
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="seats" className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FF5722]" />
                    {t("availableSeats")}
                  </Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="8"
                    placeholder="1-8"
                    value={formData.seats}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#FF5722]" />
                    {t("pricePerSeat")}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="100"
                    placeholder="e.g., 1200"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  {t("additionalInfo")}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("addDetails")}
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 h-12 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-medium">
                  {t("publishRide")}
                </Button>
                <Button type="button" variant="outline" className="flex-1 h-12 font-medium bg-transparent">
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
