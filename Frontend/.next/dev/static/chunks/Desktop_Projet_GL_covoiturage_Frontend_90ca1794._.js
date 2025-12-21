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
        imDriver: "I'm a Driver",
        imPassenger: "I'm a Passenger",
        firstName: "First Name",
        lastName: "Last Name",
        fullName: "Full Name",
        enterFullName: "Enter your full name",
        emailAddress: "Email Address",
        emailPlaceholder: "you@example.com",
        phoneNumber: "Phone Number",
        phonePlaceholder: "e.g., 05 XX XX XX XX",
        password: "Password",
        passwordPlaceholder: "********",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "********",
        uploadProfilePhoto: "Upload Profile Photo",
        uploadIdPhoto: "Upload ID Photo",
        optional: "Optional",
        dragDropUpload: "Drag & drop or click to upload",
        browseFile: "Browse file",
        createAccount: "Create Account",
        or: "OR",
        continueWithGoogle: "Continue with Google",
        agreeTerms: "By continuing, you agree to the",
        and: "and",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        signUpHere: "Sign Up",
        logInHere: "Log In",
        forAlgeria: "For Algeria, By Algerians",
        trustedRideSharing: "Your trusted ride-sharing community.",
        connectWithDrivers: "Connect with drivers and passengers for inter-wilaya trips. Share the ride, share the cost, and travel safely across Algeria.",
        forgotPassword: "forgot password?",
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
        imDriver: "Je suis Conducteur",
        imPassenger: "Je suis Passager",
        firstName: "Prénom",
        lastName: "Nom",
        fullName: "Nom Complet",
        enterFullName: "Entrez votre nom complet",
        emailAddress: "Adresse Email",
        emailPlaceholder: "vous@exemple.com",
        phoneNumber: "Numéro de Téléphone",
        phonePlaceholder: "ex., 05 XX XX XX XX",
        password: "Mot de Passe",
        passwordPlaceholder: "********",
        confirmPassword: "Confirmer le mot de passe",
        confirmPasswordPlaceholder: "********",
        uploadProfilePhoto: "Télécharger Photo de Profil",
        uploadIdPhoto: "Télécharger Photo de Pièce d'Identité",
        optional: "Optionnel",
        dragDropUpload: "Glissez-déposez ou cliquez pour télécharger",
        browseFile: "Parcourir fichier",
        createAccount: "Créer un Compte",
        or: "OU",
        continueWithGoogle: "Continuer avec Google",
        agreeTerms: "En continuant, vous acceptez les",
        and: "et",
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
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("fr") // Défaut en français
    ;
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
_s(LanguageProvider, "8pY+z7+WfvZjwkow3WzAZbxcoy8=");
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
"[project]/Desktop/Projet_GL/covoiturage/Frontend/services/auth.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// services/auth.service.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_URL = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
class AuthService {
    tokenKey = 'access_token';
    refreshKey = 'refresh_token';
    userKey = 'user';
    // ========== STORAGE ==========
    setTokens(access, refresh) {
        localStorage.setItem(this.tokenKey, access);
        localStorage.setItem(this.refreshKey, refresh);
    }
    getAccessToken() {
        return localStorage.getItem(this.tokenKey);
    }
    getRefreshToken() {
        return localStorage.getItem(this.refreshKey);
    }
    removeTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.userKey);
    }
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    getStoredUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }
    isAuthenticated() {
        return !!this.getAccessToken();
    }
    // ========== AUTH METHODS ==========
    async login(data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/login/`, data);
        const authData = response.data;
        this.setTokens(authData.tokens.access, authData.tokens.refresh);
        this.setUser(authData.user);
        return authData;
    }
    async register(data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/register/`, data);
        const authData = response.data;
        this.setTokens(authData.tokens.access, authData.tokens.refresh);
        this.setUser(authData.user);
        return authData;
    }
    async googleAuth(accessToken) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/google_auth/`, {
            access_token: accessToken
        });
        const authData = response.data;
        this.setTokens(authData.tokens.access, authData.tokens.refresh);
        this.setUser(authData.user);
        return authData;
    }
    logout() {
        this.removeTokens();
    }
    // ========== USER METHODS ==========
    async getCurrentUser() {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${API_URL}/users/me/`, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        const user = response.data;
        this.setUser(user);
        return user;
    }
    async checkPreferences() {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${API_URL}/users/check_preferences/`, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        return response.data;
    }
    // ========== PREFERENCES ==========
    async getPreferences() {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${API_URL}/users/preferences/`, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        return response.data;
    }
    async getUserPreferences() {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${API_URL}/users/preferences/`, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        return response.data;
    }
    async updatePreferences(preferenceIds) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/preferences/`, {
            preference_ids: preferenceIds
        }, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        const user = this.getStoredUser();
        if (user) {
            user.has_preferences = true;
            user.preferences_count = preferenceIds.length;
            this.setUser(user);
        }
        return response.data;
    }
    // ========== DOCUMENTS ==========
    async uploadDocument(file, documentType) {
        const formData = new FormData();
        formData.append('file_path', file);
        formData.append('document_type', documentType);
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/upload_document/`, formData, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    // ========== TOKEN REFRESH ==========
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/token/refresh/`, {
            refresh: refreshToken
        });
        const newAccessToken = response.data.access;
        localStorage.setItem(this.tokenKey, newAccessToken);
        return newAccessToken;
    }
}
const authService = new AuthService();
const __TURBOPACK__default__export__ = authService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// contexts/auth-context.tsx - VERSION MISE À JOUR
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
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const loadUser = {
                "AuthProvider.useEffect.loadUser": async ()=>{
                    try {
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isAuthenticated()) {
                            const storedUser = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getStoredUser();
                            if (storedUser) {
                                setUser(storedUser);
                                setIsAuthenticated(true);
                            } else {
                                const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
                                setUser(currentUser);
                                setIsAuthenticated(true);
                            }
                        }
                    } catch (error) {
                        console.error('Erreur chargement utilisateur:', error);
                        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].logout();
                        setIsAuthenticated(false);
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
            setIsAuthenticated(true);
            router.push('/#hero');
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Erreur de connexion');
        }
    };
    const register = async (data)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].register(data);
            setUser(response.user);
            setIsAuthenticated(true);
            // ⬇️ REDIRECTION VERS LA PAGE DE VÉRIFICATION
            router.push('/verify');
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.email?.[0] || 'Erreur d\'inscription';
            throw new Error(errorMsg);
        }
    };
    const logout = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].logout();
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
    };
    const updateUser = (updatedUser)=>{
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated,
            updateUser,
            setUser,
            setIsAuthenticated
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/auth-context.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "l0f2cJVvoD9s2nghHVOe+1CbBy0=", false, function() {
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
]);

//# sourceMappingURL=Desktop_Projet_GL_covoiturage_Frontend_90ca1794._.js.map