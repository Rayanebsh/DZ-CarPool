'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Settings,
  Camera,
  Car,
  Users,
} from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data - replace with real data from backend
  const [userData] = useState({
    name: 'Ahmed Benali',
    email: 'ahmed.benali@email.com',
    phone: '+213 555 123 456',
    bio: 'Passionate about sustainable travel and meeting new people. I drive regularly between Algiers and Oran for work.',
    location: 'Algiers, Algeria',
    role: 'driver', // "driver" or "passenger"
    averageRating: 4.8,
    totalTrips: 127,
    memberSince: '2023',
    verified: true,
    preferences: ['Non-smoker', 'Music', 'Conversation'],
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF5722]">
                  <Image
                    src="/placeholder.svg?height=128&width=128"
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF5722] rounded-full flex items-center justify-center text-white hover:bg-[#E64A19] transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {userData.name}
                      </h1>
                      {userData.verified && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Shield className="w-3 h-3 mr-1" />
                          {language === 'en' ? 'Verified' : 'Vérifié'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{userData.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {language === 'en' ? 'Member since' : 'Membre depuis'}{' '}
                        {userData.memberSince}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {language === 'en' ? 'Edit Profile' : 'Modifier le profil'}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 mb-1">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      {userData.averageRating}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'en' ? 'Rating' : 'Note'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {userData.totalTrips}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'en' ? 'Trips' : 'Trajets'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[#FF5722]/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {userData.role === 'driver' ? (
                        <Car className="w-6 h-6 text-[#FF5722]" />
                      ) : (
                        <Users className="w-6 h-6 text-[#FF5722]" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-[#FF5722]">
                      {userData.role === 'driver'
                        ? language === 'en'
                          ? 'Driver'
                          : 'Conducteur'
                        : language === 'en'
                          ? 'Passenger'
                          : 'Passager'}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 leading-relaxed">{userData.bio}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="about"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'About' : 'À propos'}
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Preferences' : 'Préférences'}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Settings' : 'Paramètres'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {language === 'en'
                    ? 'Contact Information'
                    : 'Informations de contact'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{userData.phone}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {language === 'en'
                    ? 'Travel Preferences'
                    : 'Préférences de voyage'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userData.preferences.map((pref, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-4 py-2"
                    >
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {language === 'en'
                    ? 'Account Settings'
                    : 'Paramètres du compte'}
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">
                      {language === 'en' ? 'Full Name' : 'Nom complet'}
                    </Label>
                    <Input
                      id="name"
                      defaultValue={userData.name}
                      className="mt-2"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">
                      {language === 'en' ? 'Email' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userData.email}
                      className="mt-2"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {language === 'en' ? 'Phone' : 'Téléphone'}
                    </Label>
                    <Input
                      id="phone"
                      defaultValue={userData.phone}
                      className="mt-2"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">
                      {language === 'en' ? 'Bio' : 'Biographie'}
                    </Label>
                    <Textarea
                      id="bio"
                      defaultValue={userData.bio}
                      rows={4}
                      className="mt-2"
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && (
                    <div className="flex gap-3">
                      <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                        {language === 'en' ? 'Save Changes' : 'Enregistrer'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        {language === 'en' ? 'Cancel' : 'Annuler'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
