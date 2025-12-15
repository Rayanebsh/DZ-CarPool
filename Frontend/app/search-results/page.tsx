"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Star, MapPin, Clock, Users, Ban, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data for ride results
const rideResults = [
  {
    id: 1,
    driver: {
      name: "Karim L.",
      rating: 4.9,
      reviews: 120,
      image: "/driver-profile-male.jpg",
    },
    departure: "08:00",
    arrival: "12:30",
    from: "Algiers Center",
    to: "Oran City",
    price: 1200,
    seatsLeft: 2,
    amenities: { noSmoking: true, petsAllowed: false, luggage: true },
  },
  {
    id: 2,
    driver: {
      name: "Fatima Z.",
      rating: 5.0,
      reviews: 88,
      image: "/driver-profile-female.jpg",
    },
    departure: "09:30",
    arrival: "14:00",
    from: "Algiers Airport",
    to: "Oran St. Hubert",
    price: 1350,
    seatsLeft: 1,
    amenities: { noSmoking: true, petsAllowed: true, luggage: false },
  },
  {
    id: 3,
    driver: {
      name: "Yacine B.",
      rating: 4.8,
      reviews: 215,
      image: "/driver-profile-young-male.jpg",
    },
    departure: "14:00",
    arrival: "18:30",
    from: "Bab Ezzouar",
    to: "USTO, Oran",
    price: 1100,
    seatsLeft: 3,
    amenities: { noSmoking: false, petsAllowed: true, luggage: true },
  },
]

export default function SearchResultsPage() {
  const [date, setDate] = useState("2024-06-25")
  const [priceRange, setPriceRange] = useState([500])
  const [departureTime, setDepartureTime] = useState<"morning" | "afternoon" | "evening">("morning")
  const [preferences, setPreferences] = useState({
    petsAllowed: false,
    smokerFriendly: false,
    music: false,
  })

  const handlePreferenceChange = (pref: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [pref]: !prev[pref] }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Reset</button>
              </div>

              <div className="space-y-6">
                {/* Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>500 DA</span>
                    <span>5000 DA</span>
                  </div>
                </div>

                {/* Departure Time */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Departure Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={departureTime === "morning" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDepartureTime("morning")}
                      className={departureTime === "morning" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Morning
                    </Button>
                    <Button
                      type="button"
                      variant={departureTime === "afternoon" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDepartureTime("afternoon")}
                      className={departureTime === "afternoon" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Afternoon
                    </Button>
                    <Button
                      type="button"
                      variant={departureTime === "evening" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDepartureTime("evening")}
                      className={departureTime === "evening" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Evening
                    </Button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Preferences</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.petsAllowed}
                        onChange={() => handlePreferenceChange("petsAllowed")}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Pets allowed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.smokerFriendly}
                        onChange={() => handlePreferenceChange("smokerFriendly")}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Smoker friendly</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.music}
                        onChange={() => handlePreferenceChange("music")}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Music</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full h-11 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium">
                  Apply Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Results List */}
          <div className="flex-1 space-y-4">
            {rideResults.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Driver Info */}
                  <div className="flex items-center gap-4">
                    <Image
                      src={ride.driver.image || "/placeholder.svg"}
                      alt={ride.driver.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{ride.driver.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {ride.driver.rating} ({ride.driver.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>
                        {ride.departure} → {ride.arrival}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>
                        {ride.from} → {ride.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      {ride.amenities.noSmoking && <Ban className="w-5 h-5 text-gray-400" title="No smoking" />}
                      {ride.amenities.petsAllowed && <Users className="w-5 h-5 text-gray-400" title="Pets allowed" />}
                      {ride.amenities.luggage && <Briefcase className="w-5 h-5 text-gray-400" title="Luggage space" />}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{ride.price} DA</div>
                      <div className="text-sm text-gray-500">per seat</div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">{ride.seatsLeft} seats left</div>
                    <Link href={`/trip/${ride.id}`}>
                      <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-8">View Trip</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
