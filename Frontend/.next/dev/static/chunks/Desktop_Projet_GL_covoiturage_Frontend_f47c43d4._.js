(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/language-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const translations = {
    en: {
        // Header
        whyUs: "Why Us",
        offerFind: "Offer/Find a Ride",
        howItWorks: "How It Works",
        faq: "Frequently Asked Questions",
        login: "Log In",
        signup: "Sign Up",
        // Hero Section
        heroTitle: "Your Inter-City Journeys, Shared",
        heroSubtitle: "Save money, reduce your footprint, and meet new people safely.",
        searchPlaceholder: "Leaving from, Going to, Date...",
        searchButton: "Search",
        // Why DZ-CarPool
        whyTitle: "Why DZ-CarPool?",
        whySubtitle: "Discover the benefits of sharing your ride with our trusted community",
        saveMoney: "Save Money",
        saveMoneyDesc: "Significantly reduce your travel costs by sharing fuel expenses.",
        trustedCommunity: "Trusted Community",
        trustedCommunityDesc: "Travel with verified members and build a network of trusted carpoolers.",
        safeTravel: "Safe Travel",
        safeTravelDesc: "Our platform prioritizes your safety with profile verifications and reviews.",
        convenience: "Convenience",
        convenienceDesc: "Easily find and book rides that fit your schedule in just a few clicks.",
        // How It Works
        howTitle: "How It Works",
        forPassengers: "For Passengers",
        forDrivers: "For Drivers",
        searchForRide: "Search for Your Ride",
        searchForRideDesc: "Enter your destination and find available rides.",
        bookConnect: "Book & Connect",
        bookConnectDesc: "Book your seat and get in touch with the driver.",
        travelShare: "Travel & Share",
        travelShareDesc: "Enjoy the journey and share the experience.",
        publishRide: "Publish Your Ride",
        publishRideDesc: "Share your travel plans and seat availability.",
        approveConnect: "Approve & Connect",
        approveConnectDesc: "Accept booking requests from passengers.",
        driveEarn: "Drive & Earn",
        driveEarnDesc: "Cover your costs and enjoy the company.",
        // CTA Section
        becomeDriver: "Become a Driver",
        becomeDriverDesc: "Offer a ride, share your journey, and cover your travel costs. Join our community of trusted drivers today.",
        offerRide: "Offer a Ride",
        findRide: "Find a Ride",
        findRideDesc: "Search for your destination and book a comfortable, affordable ride with our verified members.",
        // FAQ
        faqTitle: "Frequently Asked Questions",
        faqSubtitle: "Have questions? We've got answers",
        paymentQuestion: "How is payment handled?",
        verificationQuestion: "What is the verification process?",
        cancellationQuestion: "What is the cancellation policy?",
        // Footer
        company: "Company",
        aboutUs: "About Us",
        contact: "Contact",
        careers: "Careers",
        support: "Support",
        helpCenter: "Help Center",
        termsOfService: "Terms of Service",
        privacyPolicy: "Privacy Policy",
        followUs: "Follow Us",
        tagline: "Your trusted partner for inter-city travel in Algeria.",
        copyright: "DZ-CarPool. All Rights Reserved.",
        // Auth Pages
        getStarted: "Get Started",
        createAccountOrLogin: "Create an account or log in to continue.",
        register: "Register",
        login: "Log In",
        imDriver: "I'm a Driver",
        imPassenger: "I'm a Passenger",
        fullName: "Full Name",
        enterFullName: "Enter your full name",
        emailAddress: "Email Address",
        emailPlaceholder: "you@example.com",
        phoneNumber: "Phone Number",
        phonePlaceholder: "e.g., 05 XX XX XX XX",
        password: "Password",
        passwordPlaceholder: "********",
        uploadProfilePhoto: "Upload Profile Photo",
        uploadIdPhoto: "Upload ID Photo",
        optional: "Optional",
        dragDropUpload: "Drag & drop or click to upload",
        browseFile: "Browse file",
        createAccount: "Create Account",
        or: "OR",
        continueWithGoogle: "Continue with Google",
        agreeTerms: "By continuing, you agree to the",
        termsOfService: "Terms of Service",
        and: "and",
        privacyPolicy: "Privacy Policy",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        signUpHere: "Sign Up",
        logInHere: "Log In",
        forAlgeria: "For Algeria, By Algerians",
        trustedRideSharing: "Your trusted ride-sharing community.",
        connectWithDrivers: "Connect with drivers and passengers for inter-wilaya trips. Share the ride, share the cost, and travel safely across Algeria.",
        forgotPassword: "forgot password ?",
        // Offer Ride Page
        offerRideTitle: "Offer a Ride",
        offerRideSubtitle: "Share your journey and help others travel",
        from: "From (Departure City)",
        to: "To (Arrival City)",
        date: "Date",
        departureTime: "Departure Time",
        availableSeats: "Available Seats",
        pricePerSeat: "Price per Seat (DA)",
        additionalInfo: "Additional Information (Optional)",
        addDetails: "Add any details about your trip, stops, or preferences...",
        publishRide: "Publish Ride",
        cancel: "Cancel",
        // Search Results Page
        filters: "Filters",
        reset: "Reset",
        priceRange: "Price Range",
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        preferences: "Preferences",
        petsAllowed: "Pets allowed",
        smokerFriendly: "Smoker friendly",
        music: "Music",
        applyFilters: "Apply Filters",
        perSeat: "per seat",
        seatsLeft: "seats left",
        viewTrip: "View Trip",
        reviews: "reviews",
        // Trip Details Page
        tripFrom: "Trip From",
        vehicleInformation: "Vehicle Information",
        seats: "seats",
        airConditioning: "Air conditioning",
        tripFeaturesRules: "Trip Features & Rules",
        nonSmoking: "Non-Smoking",
        musicPreference: "Music Preference",
        conversation: "Conversation",
        passengers: "Passengers",
        pricePerSeatLabel: "Price per seat",
        seatsAvailable: "seats available",
        bookNow: "Book Now",
        notChargedYet: "You won't be charged yet",
        verified: "Verified",
        verifiedProfile: "Verified Profile",
        memberSince: "Member since",
        home: "Home",
        searchResults: "Search Results"
    },
    fr: {
        // Header
        whyUs: "Pourquoi Nous",
        offerFind: "Proposer/Trouver un Trajet",
        howItWorks: "Comment Ça Marche",
        faq: "Questions Fréquentes",
        login: "Se Connecter",
        signup: "S'inscrire",
        // Hero Section
        heroTitle: "Vos Trajets Inter-Villes, Partagés",
        heroSubtitle: "Économisez de l'argent, réduisez votre empreinte et rencontrez de nouvelles personnes en toute sécurité.",
        searchPlaceholder: "Départ, Destination, Date...",
        searchButton: "Rechercher",
        // Why DZ-CarPool
        whyTitle: "Pourquoi DZ-CarPool?",
        whySubtitle: "Découvrez les avantages de partager votre trajet avec notre communauté de confiance",
        saveMoney: "Économisez",
        saveMoneyDesc: "Réduisez considérablement vos frais de voyage en partageant les frais de carburant.",
        trustedCommunity: "Communauté de Confiance",
        trustedCommunityDesc: "Voyagez avec des membres vérifiés et construisez un réseau de covoitureurs de confiance.",
        safeTravel: "Voyage Sécurisé",
        safeTravelDesc: "Notre plateforme priorise votre sécurité avec des vérifications de profils et des avis.",
        convenience: "Commodité",
        convenienceDesc: "Trouvez et réservez facilement des trajets qui correspondent à votre emploi du temps en quelques clics.",
        // How It Works
        howTitle: "Comment Ça Marche",
        forPassengers: "Pour les Passagers",
        forDrivers: "Pour les Conducteurs",
        searchForRide: "Recherchez Votre Trajet",
        searchForRideDesc: "Entrez votre destination et trouvez les trajets disponibles.",
        bookConnect: "Réservez & Connectez",
        bookConnectDesc: "Réservez votre siège et contactez le conducteur.",
        travelShare: "Voyagez & Partagez",
        travelShareDesc: "Profitez du voyage et partagez l'expérience.",
        publishRide: "Publiez Votre Trajet",
        publishRideDesc: "Partagez vos plans de voyage et disponibilité des sièges.",
        approveConnect: "Approuvez & Connectez",
        approveConnectDesc: "Acceptez les demandes de réservation des passagers.",
        driveEarn: "Conduisez & Gagnez",
        driveEarnDesc: "Couvrez vos frais et profitez de la compagnie.",
        // CTA Section
        becomeDriver: "Devenir Conducteur",
        becomeDriverDesc: "Proposez un trajet, partagez votre voyage et couvrez vos frais de déplacement. Rejoignez notre communauté de conducteurs de confiance dès aujourd'hui.",
        offerRide: "Proposer un Trajet",
        findRide: "Trouver un Trajet",
        findRideDesc: "Recherchez votre destination et réservez un trajet confortable et abordable avec nos membres vérifiés.",
        // FAQ
        faqTitle: "Questions Fréquemment Posées",
        faqSubtitle: "Vous avez des questions? Nous avons les réponses",
        paymentQuestion: "Comment le paiement est-il géré?",
        verificationQuestion: "Quel est le processus de vérification?",
        cancellationQuestion: "Quelle est la politique d'annulation?",
        // Footer
        company: "Entreprise",
        aboutUs: "À Propos",
        contact: "Contact",
        careers: "Carrières",
        support: "Support",
        helpCenter: "Centre d'Aide",
        termsOfService: "Conditions d'Utilisation",
        privacyPolicy: "Politique de Confidentialité",
        followUs: "Suivez-Nous",
        tagline: "Votre partenaire de confiance pour les voyages inter-villes en Algérie.",
        copyright: "DZ-CarPool. Tous Droits Réservés.",
        // Auth Pages
        getStarted: "Commencer",
        createAccountOrLogin: "Créez un compte ou connectez-vous pour continuer.",
        register: "S'inscrire",
        login: "Se Connecter",
        imDriver: "Je suis Conducteur",
        imPassenger: "Je suis Passager",
        fullName: "Nom Complet",
        enterFullName: "Entrez votre nom complet",
        emailAddress: "Adresse Email",
        emailPlaceholder: "vous@exemple.com",
        phoneNumber: "Numéro de Téléphone",
        phonePlaceholder: "ex., 05 XX XX XX XX",
        password: "Mot de Passe",
        passwordPlaceholder: "********",
        uploadProfilePhoto: "Télécharger Photo de Profil",
        uploadIdPhoto: "Télécharger Photo de Pièce d'Identité",
        optional: "Optionnel",
        dragDropUpload: "Glissez-déposez ou cliquez pour télécharger",
        browseFile: "Parcourir fichier",
        createAccount: "Créer un Compte",
        or: "OU",
        continueWithGoogle: "Continuer avec Google",
        agreeTerms: "En continuant, vous acceptez les",
        termsOfService: "Conditions d'Utilisation",
        and: "et",
        privacyPolicy: "Politique de Confidentialité",
        alreadyHaveAccount: "Vous avez déjà un compte ?",
        dontHaveAccount: "Vous n'avez pas de compte ?",
        signUpHere: "S'inscrire",
        logInHere: "Se Connecter",
        forAlgeria: "Pour l'Algérie, Par les Algériens",
        trustedRideSharing: "Votre communauté de covoiturage de confiance.",
        connectWithDrivers: "Connectez-vous avec des conducteurs et des passagers pour des trajets inter-wilayas. Partagez le trajet, partagez les frais et voyagez en toute sécurité à travers l'Algérie.",
        forgotPassword: "mot de passe oublié ?",
        // Offer Ride Page
        offerRideTitle: "Proposer un Trajet",
        offerRideSubtitle: "Partagez votre voyage et aidez les autres à voyager",
        from: "Départ (Ville de départ)",
        to: "Arrivée (Ville d'arrivée)",
        date: "Date",
        departureTime: "Heure de départ",
        availableSeats: "Sièges disponibles",
        pricePerSeat: "Prix par siège (DA)",
        additionalInfo: "Informations supplémentaires (Optionnel)",
        addDetails: "Ajoutez des détails sur votre voyage, arrêts ou préférences...",
        publishRide: "Publier le trajet",
        cancel: "Annuler",
        // Search Results Page
        filters: "Filtres",
        reset: "Réinitialiser",
        priceRange: "Gamme de prix",
        morning: "Matin",
        afternoon: "Après-midi",
        evening: "Soir",
        preferences: "Préférences",
        petsAllowed: "Animaux acceptés",
        smokerFriendly: "Fumeur accepté",
        music: "Musique",
        applyFilters: "Appliquer les filtres",
        perSeat: "par siège",
        seatsLeft: "sièges restants",
        viewTrip: "Voir le trajet",
        reviews: "avis",
        // Trip Details Page
        tripFrom: "Trajet de",
        vehicleInformation: "Informations sur le véhicule",
        seats: "sièges",
        airConditioning: "Climatisation",
        tripFeaturesRules: "Caractéristiques et règles du trajet",
        nonSmoking: "Non-fumeur",
        musicPreference: "Préférence musicale",
        conversation: "Conversation",
        passengers: "Passagers",
        pricePerSeatLabel: "Prix par siège",
        seatsAvailable: "sièges disponibles",
        bookNow: "Réserver maintenant",
        notChargedYet: "Vous ne serez pas facturé pour le moment",
        verified: "Vérifié",
        verifiedProfile: "Profil vérifié",
        memberSince: "Membre depuis",
        home: "Accueil",
        searchResults: "Résultats de recherche"
    }
};
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function LanguageProvider({ children }) {
    _s();
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("en");
    const t = (key)=>{
        return translations[language][key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/language-context.tsx",
        lineNumber: 348,
        columnNumber: 10
    }, this);
}
_s(LanguageProvider, "JgNS4s3wc06/6u6z+Ak7Ai5ELN8=");
_c = LanguageProvider;
function useLanguage() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
_s1(useLanguage, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/lib/axios.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/axios.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'axios'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
// URL du backend
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Instance Axios avec configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});
// Intercepteur pour ajouter le token JWT automatiquement
apiClient.interceptors.request.use((config)=>{
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Intercepteur pour gérer le refresh token
apiClient.interceptors.response.use((response)=>response, async (error)=>{
    const originalRequest = error.config;
    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            // Appeler l'endpoint de refresh
            const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
                refresh: refreshToken
            });
            const { access } = response.data;
            // Sauvegarder le nouveau token
            localStorage.setItem('access_token', access);
            // Retry la requête originale
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            // Si le refresh échoue, déconnecter l'utilisateur
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/services/auth.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// services/auth.service.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/lib/axios.ts [app-client] (ecmascript)");
;
const authService = {
    /**
   * Inscription d'un nouvel utilisateur
   */ async register (data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/users/register/', data);
        // Sauvegarder les tokens et l'utilisateur
        if (response.data.tokens) {
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    /**
   * Connexion d'un utilisateur
   */ async login (data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/users/login/', data);
        // Sauvegarder les tokens et l'utilisateur
        if (response.data.tokens) {
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    /**
   * Déconnexion
   */ logout () {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
    /**
   * Récupérer l'utilisateur connecté
   */ async getCurrentUser () {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/users/me/');
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },
    /**
   * Vérifier si l'utilisateur est connecté
   */ isAuthenticated () {
        return !!localStorage.getItem('access_token');
    },
    /**
   * Récupérer l'utilisateur depuis le localStorage
   */ getStoredUser () {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    /**
   * Upload de document
   */ async uploadDocument (file, documentType) {
        const formData = new FormData();
        formData.append('file_path', file);
        formData.append('document_type', documentType);
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/users/upload_document/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
const __TURBOPACK__default__export__ = authService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// contexts/auth-context.tsx
__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/services/auth.service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Charger l'utilisateur au démarrage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const loadUser = {
                "AuthProvider.useEffect.loadUser": async ()=>{
                    try {
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isAuthenticated()) {
                            const storedUser = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getStoredUser();
                            if (storedUser) {
                                setUser(storedUser);
                            } else {
                                // Récupérer depuis l'API si pas en local
                                const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
                                setUser(currentUser);
                            }
                        }
                    } catch (error) {
                        console.error('Erreur chargement utilisateur:', error);
                        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].logout();
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.loadUser"];
            loadUser();
        }
    }["AuthProvider.useEffect"], []);
    const login = async (data)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].login(data);
            setUser(response.user);
            router.push('/dashboard'); // Redirection après login
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Erreur de connexion');
        }
    };
    const register = async (data)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].register(data);
            setUser(response.user);
            router.push('/dashboard'); // Redirection après inscription
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.email?.[0] || 'Erreur d\'inscription';
            throw new Error(errorMsg);
        }
    };
    const logout = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].logout();
        setUser(null);
        router.push('/login');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/auth-context.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "J17Kp8z+0ojgAqGoY5o3BCjwWms=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=Desktop_Projet_GL_covoiturage_Frontend_f47c43d4._.js.map