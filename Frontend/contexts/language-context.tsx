'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    whyUs: 'Why Us',
    offerFind: 'Offer/Find a Ride',
    howItWorks: 'How It Works',
    faq: 'Frequently Asked Questions',
    login: 'Log In',
    signup: 'Sign Up',

    // Hero Section
    heroTitle: 'Your Inter-City Journeys, Shared',
    heroSubtitle:
      'Save money, reduce your footprint, and meet new people safely.',
    searchPlaceholder: 'Leaving from, Going to, Date...',
    searchButton: 'Search',

    // Why DZ-CarPool
    whyTitle: 'Why DZ-CarPool?',
    whySubtitle:
      'Discover the benefits of sharing your ride with our trusted community',
    saveMoney: 'Save Money',
    saveMoneyDesc:
      'Significantly reduce your travel costs by sharing fuel expenses.',
    trustedCommunity: 'Trusted Community',
    trustedCommunityDesc:
      'Travel with verified members and build a network of trusted carpoolers.',
    safeTravel: 'Safe Travel',
    safeTravelDesc:
      'Our platform prioritizes your safety with profile verifications and reviews.',
    convenience: 'Convenience',
    convenienceDesc:
      'Easily find and book rides that fit your schedule in just a few clicks.',

    // How It Works
    howTitle: 'How It Works',
    forPassengers: 'For Passengers',
    forDrivers: 'For Drivers',
    searchForRide: 'Search for Your Ride',
    searchForRideDesc: 'Enter your destination and find available rides.',
    bookConnect: 'Book & Connect',
    bookConnectDesc: 'Book your seat and get in touch with the driver.',
    travelShare: 'Travel & Share',
    travelShareDesc: 'Enjoy the journey and share the experience.',
    publishRide: 'Publish Your Ride',
    publishRideDesc: 'Share your travel plans and seat availability.',
    approveConnect: 'Approve & Connect',
    approveConnectDesc: 'Accept booking requests from passengers.',
    driveEarn: 'Drive & Earn',
    driveEarnDesc: 'Cover your costs and enjoy the company.',

    // CTA Section
    becomeDriver: 'Become a Driver',
    becomeDriverDesc:
      'Offer a ride, share your journey, and cover your travel costs. Join our community of trusted drivers today.',
    offerRide: 'Offer a Ride',
    findRide: 'Find a Ride',
    findRideDesc:
      'Search for your destination and book a comfortable, affordable ride with our verified members.',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: "Have questions? We've got answers",
    paymentQuestion: 'How is payment handled?',
    verificationQuestion: 'What is the verification process?',
    cancellationQuestion: 'What is the cancellation policy?',

    // Footer
    company: 'Company',
    aboutUs: 'About Us',
    contact: 'Contact',
    careers: 'Careers',
    support: 'Support',
    helpCenter: 'Help Center',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    followUs: 'Follow Us',
    tagline: 'Your trusted partner for inter-city travel in Algeria.',
    copyright: 'DZ-CarPool. All Rights Reserved.',

    // Auth Pages
    getStarted: 'Get Started',
    createAccountOrLogin: 'Create an account or log in to continue.',
    register: 'Register',
    imDriver: "I'm a Driver",
    imPassenger: "I'm a Passenger",
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'you@example.com',
    phoneNumber: 'Phone Number',
    phonePlaceholder: 'e.g., 05 XX XX XX XX',
    password: 'Password',
    passwordPlaceholder: '********',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: '********',
    uploadProfilePhoto: 'Upload Profile Photo',
    uploadIdPhoto: 'Upload ID Photo',
    optional: 'Optional',
    dragDropUpload: 'Drag & drop or click to upload',
    browseFile: 'Browse file',
    createAccount: 'Create Account',
    or: 'OR',
    continueWithGoogle: 'Continue with Google',
    agreeTerms: 'By continuing, you agree to the',
    and: 'and',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signUpHere: 'Sign Up',
    logInHere: 'Log In',
    forAlgeria: 'For Algeria, By Algerians',
    trustedRideSharing: 'Your trusted ride-sharing community.',
    connectWithDrivers:
      'Connect with drivers and passengers for inter-wilaya trips. Share the ride, share the cost, and travel safely across Algeria.',
    forgotPassword: 'forgot password?',

    // Offer Ride Page
    offerRideTitle: 'Offer a Ride',
    offerRideSubtitle: 'Share your journey and help others travel',
    from: 'From (Departure City)',
    to: 'To (Arrival City)',
    date: 'Date',
    departureTime: 'Departure Time',
    availableSeats: 'Available Seats',
    pricePerSeat: 'Price per Seat (DA)',
    additionalInfo: 'Additional Information (Optional)',
    addDetails: 'Add any details about your trip, stops, or preferences...',
    cancel: 'Cancel',

    // Search Results Page
    filters: 'Filters',
    reset: 'Reset',
    priceRange: 'Price Range',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    preferences: 'Preferences',
    petsAllowed: 'Pets allowed',
    smokerFriendly: 'Smoker friendly',
    music: 'Music',
    applyFilters: 'Apply Filters',
    perSeat: 'per seat',
    seatsLeft: 'seats left',
    viewTrip: 'View Trip',
    reviews: 'reviews',

    // Trip Details Page
    tripFrom: 'Trip From',
    vehicleInformation: 'Vehicle Information',
    seats: 'seats',
    airConditioning: 'Air conditioning',
    tripFeaturesRules: 'Trip Features & Rules',
    nonSmoking: 'Non-Smoking',
    musicPreference: 'Music Preference',
    conversation: 'Conversation',
    passengers: 'Passengers',
    pricePerSeatLabel: 'Price per seat',
    seatsAvailable: 'seats available',
    bookNow: 'Book Now',
    notChargedYet: "You won't be charged yet",
    verified: 'Verified',
    verifiedProfile: 'Verified Profile',
    memberSince: 'Member since',
    home: 'Home',
    searchResults: 'Search Results',
  },
  fr: {
    // Header
    whyUs: 'Pourquoi Nous',
    offerFind: 'Proposer/Trouver un Trajet',
    howItWorks: 'Comment Ça Marche',
    faq: 'Questions Fréquentes',
    login: 'Se Connecter',
    signup: "S'inscrire",

    // Hero Section
    heroTitle: 'Vos Trajets Inter-Villes, Partagés',
    heroSubtitle:
      "Économisez de l'argent, réduisez votre empreinte et rencontrez de nouvelles personnes en toute sécurité.",
    searchPlaceholder: 'Départ, Destination, Date...',
    searchButton: 'Rechercher',

    // Why DZ-CarPool
    whyTitle: 'Pourquoi DZ-CarPool?',
    whySubtitle:
      'Découvrez les avantages de partager votre trajet avec notre communauté de confiance',
    saveMoney: 'Économisez',
    saveMoneyDesc:
      'Réduisez considérablement vos frais de voyage en partageant les frais de carburant.',
    trustedCommunity: 'Communauté de Confiance',
    trustedCommunityDesc:
      'Voyagez avec des membres vérifiés et construisez un réseau de covoitureurs de confiance.',
    safeTravel: 'Voyage Sécurisé',
    safeTravelDesc:
      'Notre plateforme priorise votre sécurité avec des vérifications de profils et des avis.',
    convenience: 'Commodité',
    convenienceDesc:
      'Trouvez et réservez facilement des trajets qui correspondent à votre emploi du temps en quelques clics.',

    // How It Works
    howTitle: 'Comment Ça Marche',
    forPassengers: 'Pour les Passagers',
    forDrivers: 'Pour les Conducteurs',
    searchForRide: 'Recherchez Votre Trajet',
    searchForRideDesc:
      'Entrez votre destination et trouvez les trajets disponibles.',
    bookConnect: 'Réservez & Connectez',
    bookConnectDesc: 'Réservez votre siège et contactez le conducteur.',
    travelShare: 'Voyagez & Partagez',
    travelShareDesc: "Profitez du voyage et partagez l'expérience.",
    publishRide: 'Publiez Votre Trajet',
    publishRideDesc:
      'Partagez vos plans de voyage et disponibilité des sièges.',
    approveConnect: 'Approuvez & Connectez',
    approveConnectDesc: 'Acceptez les demandes de réservation des passagers.',
    driveEarn: 'Conduisez & Gagnez',
    driveEarnDesc: 'Couvrez vos frais et profitez de la compagnie.',

    // CTA Section
    becomeDriver: 'Devenir Conducteur',
    becomeDriverDesc:
      "Proposez un trajet, partagez votre voyage et couvrez vos frais de déplacement. Rejoignez notre communauté de conducteurs de confiance dès aujourd'hui.",
    offerRide: 'Proposer un Trajet',
    findRide: 'Trouver un Trajet',
    findRideDesc:
      'Recherchez votre destination et réservez un trajet confortable et abordable avec nos membres vérifiés.',

    // FAQ
    faqTitle: 'Questions Fréquemment Posées',
    faqSubtitle: 'Vous avez des questions? Nous avons les réponses',
    paymentQuestion: 'Comment le paiement est-il géré?',
    verificationQuestion: 'Quel est le processus de vérification?',
    cancellationQuestion: "Quelle est la politique d'annulation?",

    // Footer
    company: 'Entreprise',
    aboutUs: 'À Propos',
    contact: 'Contact',
    careers: 'Carrières',
    support: 'Support',
    helpCenter: "Centre d'Aide",
    termsOfService: "Conditions d'Utilisation",
    privacyPolicy: 'Politique de Confidentialité',
    followUs: 'Suivez-Nous',
    tagline:
      'Votre partenaire de confiance pour les voyages inter-villes en Algérie.',
    copyright: 'DZ-CarPool. Tous Droits Réservés.',

    // Auth Pages
    getStarted: 'Commencer',
    createAccountOrLogin: 'Créez un compte ou connectez-vous pour continuer.',
    register: "S'inscrire",
    imDriver: 'Je suis Conducteur',
    imPassenger: 'Je suis Passager',
    firstName: 'Prénom',
    lastName: 'Nom',
    fullName: 'Nom Complet',
    enterFullName: 'Entrez votre nom complet',
    emailAddress: 'Adresse Email',
    emailPlaceholder: 'vous@exemple.com',
    phoneNumber: 'Numéro de Téléphone',
    phonePlaceholder: 'ex., 05 XX XX XX XX',
    password: 'Mot de Passe',
    passwordPlaceholder: '********',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: '********',
    uploadProfilePhoto: 'Télécharger Photo de Profil',
    uploadIdPhoto: "Télécharger Photo de Pièce d'Identité",
    optional: 'Optionnel',
    dragDropUpload: 'Glissez-déposez ou cliquez pour télécharger',
    browseFile: 'Parcourir fichier',
    createAccount: 'Créer un Compte',
    or: 'OU',
    continueWithGoogle: 'Continuer avec Google',
    agreeTerms: 'En continuant, vous acceptez les',
    and: 'et',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    signUpHere: "S'inscrire",
    logInHere: 'Se Connecter',
    forAlgeria: "Pour l'Algérie, Par les Algériens",
    trustedRideSharing: 'Votre communauté de covoiturage de confiance.',
    connectWithDrivers:
      "Connectez-vous avec des conducteurs et des passagers pour des trajets inter-wilayas. Partagez le trajet, partagez les frais et voyagez en toute sécurité à travers l'Algérie.",
    forgotPassword: 'mot de passe oublié ?',

    // Offer Ride Page
    offerRideTitle: 'Proposer un Trajet',
    offerRideSubtitle: 'Partagez votre voyage et aidez les autres à voyager',
    from: 'Départ (Ville de départ)',
    to: "Arrivée (Ville d'arrivée)",
    date: 'Date',
    departureTime: 'Heure de départ',
    availableSeats: 'Sièges disponibles',
    pricePerSeat: 'Prix par siège (DA)',
    additionalInfo: 'Informations supplémentaires (Optionnel)',
    addDetails:
      'Ajoutez des détails sur votre voyage, arrêts ou préférences...',
    cancel: 'Annuler',

    // Search Results Page
    filters: 'Filtres',
    reset: 'Réinitialiser',
    priceRange: 'Gamme de prix',
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    preferences: 'Préférences',
    petsAllowed: 'Animaux acceptés',
    smokerFriendly: 'Fumeur accepté',
    music: 'Musique',
    applyFilters: 'Appliquer les filtres',
    perSeat: 'par siège',
    seatsLeft: 'sièges restants',
    viewTrip: 'Voir le trajet',
    reviews: 'avis',

    // Trip Details Page
    tripFrom: 'Trajet de',
    vehicleInformation: 'Informations sur le véhicule',
    seats: 'sièges',
    airConditioning: 'Climatisation',
    tripFeaturesRules: 'Caractéristiques et règles du trajet',
    nonSmoking: 'Non-fumeur',
    musicPreference: 'Préférence musicale',
    conversation: 'Conversation',
    passengers: 'Passagers',
    pricePerSeatLabel: 'Prix par siège',
    seatsAvailable: 'sièges disponibles',
    bookNow: 'Réserver maintenant',
    notChargedYet: 'Vous ne serez pas facturé pour le moment',
    verified: 'Vérifié',
    verifiedProfile: 'Profil vérifié',
    memberSince: 'Membre depuis',
    home: 'Accueil',
    searchResults: 'Résultats de recherche',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr'); // Défaut en français

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
