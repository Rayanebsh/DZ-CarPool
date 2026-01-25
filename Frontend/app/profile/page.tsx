'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Star,
  Calendar,
  Phone,
  Mail,
  Shield,
  Settings,
  Camera,
  Car,
  Save,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components/header';
interface Preference {
  id: number;
  name_fr: string;
  name_en: string;
  category: string;
  icon: string;
  description?: string;
}

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  phone_verified: boolean;
  email_verified: boolean;
  profile_picture: string | null;
  bio: string;
  trips_as_driver: number;
  trips_as_passenger: number;
  average_rating: number;
  date_joined: string;
  preferences_detail?: Preference[];
}

interface FormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  profile_picture: File | null;
}

export default function ProfilePage() {
  const [language] = useState('fr');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // État pour les données utilisateur
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    profile_picture: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Récupérer les données du profil au chargement
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Non authentifié. Veuillez vous connecter.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      const data: UserData = await response.json();
      setUserData(data);

      // Initialiser le formulaire avec les données existantes
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || '',
        bio: data.bio || '',
        profile_picture: null,
      });

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La taille de l'image ne doit pas dépasser 5 MB");
        return;
      }

      setFormData({ ...formData, profile_picture: file });

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();

      // Ajouter les champs texte
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('bio', formData.bio);

      // Ajouter l'image si elle a été modifiée
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }

      const response = await fetch(`${API_URL}/api/v1/users/update_profile/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedData: UserData = await response.json();
      setUserData(updatedData);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setPreviewImage(null);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewImage(null);
    setError('');

    // Réinitialiser le formulaire avec les données originales
    if (userData) {
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone_number: userData.phone_number || '',
        bio: userData.bio || '',
        profile_picture: null,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {error || 'Impossible de charger le profil'}
          </p>
        </div>
      </div>
    );
  }

  const t: Record<string, string> = {
    verified: language === 'en' ? 'Verified' : 'Vérifié',
    memberSince: language === 'en' ? 'Member since' : 'Membre depuis',
    editProfile: language === 'en' ? 'Edit Profile' : 'Modifier le profil',
    rating: language === 'en' ? 'Rating' : 'Note',
    trips: language === 'en' ? 'Trips' : 'Trajets',
    driver: language === 'en' ? 'Driver' : 'Conducteur',
    passenger: language === 'en' ? 'Passenger' : 'Passager',
    about: language === 'en' ? 'About' : 'À propos',
    preferences: language === 'en' ? 'Preferences' : 'Préférences',
    settings: language === 'en' ? 'Settings' : 'Paramètres',
    contactInfo:
      language === 'en' ? 'Contact Information' : 'Informations de contact',
    travelPrefs:
      language === 'en' ? 'Travel Preferences' : 'Préférences de voyage',
    accountSettings:
      language === 'en' ? 'Account Settings' : 'Paramètres du compte',
    fullName: language === 'en' ? 'Full Name' : 'Nom complet',
    firstName: language === 'en' ? 'First Name' : 'Prénom',
    lastName: language === 'en' ? 'Last Name' : 'Nom',
    email: language === 'en' ? 'Email' : 'Email',
    phone: language === 'en' ? 'Phone' : 'Téléphone',
    bio: language === 'en' ? 'Bio' : 'Biographie',
    saveChanges: language === 'en' ? 'Save Changes' : 'Enregistrer',
    cancel: language === 'en' ? 'Cancel' : 'Annuler',
    changePhoto: language === 'en' ? 'Change Photo' : 'Changer la photo',
  };

  const memberSince = new Date(userData.date_joined).getFullYear();
  const totalTrips = userData.trips_as_driver + userData.trips_as_passenger;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Messages de succès et d'erreur */}
        {success && (
          <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {error && (
          <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="max-w-6xl mx-auto p-6">
          {/* En-tête du profil */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Photo de profil */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF5722] bg-gray-200">
                  <img
                    src={
                      previewImage ||
                      userData?.profile_picture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent((userData?.first_name || '') + ' ' + (userData?.last_name || ''))}&size=128&background=FF5722&color=fff`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF5722] rounded-full flex items-center justify-center text-white hover:bg-[#E64A19] transition-colors shadow-lg"
                      title={t.changePhoto}
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    {previewImage && (
                      <div className="absolute -bottom-8 left-0 right-0 text-center">
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Nouvelle photo
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Informations utilisateur */}
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {userData?.first_name} {userData?.last_name}
                      </h1>
                      {userData?.email_verified && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {t.verified}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {t.memberSince} {memberSince}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      isEditing ? handleCancel() : setIsEditing(true)
                    }
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        {t.cancel}
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        {t.editProfile}
                      </>
                    )}
                  </button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 mb-1">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      {userData?.average_rating}
                    </div>
                    <div className="text-sm text-gray-600">{t.rating}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {totalTrips}
                    </div>
                    <div className="text-sm text-gray-600">{t.trips}</div>
                  </div>
                  <div className="text-center p-4 bg-[#FF5722]/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Car className="w-6 h-6 text-[#FF5722]" />
                    </div>
                    <div className="text-sm font-medium text-[#FF5722]">
                      {(userData?.trips_as_driver || 0) > 0
                        ? t.driver
                        : t.passenger}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {!isEditing ? (
                  <p className="text-gray-600 leading-relaxed">
                    {userData?.bio || 'Aucune biographie renseignée'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Parlez un peu de vous..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-[#FF5722] hover:bg-[#E64A19] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t.saveChanges}
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex">
                {['about', 'preferences', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-[#FF5722] text-[#FF5722]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t[tab]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {/* Onglet À propos */}
              {activeTab === 'about' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {t.contactInfo}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{userData?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">
                        {userData?.phone_number || 'Non renseigné'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Préférences */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {t.travelPrefs}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userData?.preferences_detail &&
                    userData.preferences_detail.length > 0 ? (
                      userData.preferences_detail.map((pref: Preference) => (
                        <span
                          key={pref.id}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {pref.icon}{' '}
                          {language === 'en' ? pref.name_en : pref.name_fr}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">Aucune préférence définie</p>
                    )}
                  </div>
                </div>
              )}

              {/* Onglet Paramètres */}
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {t.accountSettings}
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.firstName}
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.lastName}
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        value={userData?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.phone}
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 bg-[#FF5722] hover:bg-[#E64A19] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              {t.saveChanges}
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-5 h-5" />
                          {t.cancel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
