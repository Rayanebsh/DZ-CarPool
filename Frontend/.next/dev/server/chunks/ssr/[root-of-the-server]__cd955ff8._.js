module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/language-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
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
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function LanguageProvider({ children }) {
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("en");
    const t = (key)=>{
        return translations[language][key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
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
function useLanguage() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/services/auth.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// services/auth.service.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'; // ✅ Ajouté /v1
class AuthService {
    // Login classique
    async login(data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/login/`, data);
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
        return response.data;
    }
    // Register classique
    async register(data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/register/`, data);
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
        return response.data;
    }
    // ✅ CORRIGÉ : Google OAuth
    async googleAuth(accessToken) {
        try {
            console.log('🔵 Tentative de connexion Google...');
            console.log('🔵 URL:', `${API_URL}/users/google_auth/`);
            console.log('🔵 Token:', accessToken.substring(0, 20) + '...');
            // ✅ CORRECTION 1 : Parenthèses normales au lieu de backticks
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/google_auth/`, {
                access_token: accessToken
            });
            console.log('✅ Réponse reçue:', response.data);
            this.setTokens(response.data.tokens);
            this.setUser(response.data.user);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur Google Auth:', error.response?.data || error.message);
            throw error;
        }
    }
    // Logout
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }
    // Upload document
    async uploadDocument(file, documentType) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_type', documentType);
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/upload_document/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        return response.data;
    }
    // Get current user
    async getCurrentUser() {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`${API_URL}/users/me/`, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
        this.setUser(response.data);
        return response.data;
    }
    // Vérification email
    async sendEmailVerification() {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/send_email_verification/`, {}, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
    }
    async verifyEmail(code) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/verify_email/`, {
            code
        }, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
    }
    // Vérification téléphone
    async sendPhoneVerification() {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/send_phone_verification/`, {}, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
    }
    async verifyPhone(code) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/users/verify_phone/`, {
            code
        }, {
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`
            }
        });
    }
    // Helpers
    setTokens(tokens) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    }
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    getAccessToken() {
        return localStorage.getItem('access_token');
    }
    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    isAuthenticated() {
        return !!this.getAccessToken();
    }
}
const __TURBOPACK__default__export__ = new AuthService();
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/contexts/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// contexts/auth-context.tsx - VERSION MISE À JOUR
__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/services/auth.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadUser = async ()=>{
            try {
                if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isAuthenticated()) {
                    const storedUser = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getStoredUser();
                    if (storedUser) {
                        setUser(storedUser);
                        setIsAuthenticated(true);
                    } else {
                        const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
                        setUser(currentUser);
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('Erreur chargement utilisateur:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].logout();
                setIsAuthenticated(false);
            } finally{
                setLoading(false);
            }
        };
        loadUser();
    }, []);
    const login = async (data)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].login(data);
            setUser(response.user);
            setIsAuthenticated(true);
            router.push('/#hero');
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Erreur de connexion');
        }
    };
    const register = async (data)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].register(data);
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
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].logout();
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
    };
    const updateUser = (updatedUser)=>{
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
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
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cd955ff8._.js.map