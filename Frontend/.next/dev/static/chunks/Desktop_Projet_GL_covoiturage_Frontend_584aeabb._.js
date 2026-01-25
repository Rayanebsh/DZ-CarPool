(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/Projet_GL/covoiturage/Frontend/services/api.client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// services/api.client.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:8000");
/**
 * Instance Axios configurée avec authentification automatique
 */ console.log('API_URL:', API_URL);
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});
/**
 * Intercepteur de requête : Ajoute automatiquement le token JWT
 */ apiClient.interceptors.request.use((config)=>{
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('access_token');
    // Ajouter le token dans les headers si disponible
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
/**
 * Intercepteur de réponse : Gère le refresh token automatique
 */ apiClient.interceptors.response.use((response)=>{
    return response;
}, async (error)=>{
    const originalRequest = error.config;
    // Si erreur 401 (token expiré) et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            // Récupérer le refresh token
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                // Pas de refresh token, déconnecter l'utilisateur
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
            // Appeler l'endpoint de refresh
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/api/v1/users/token/refresh/`, {
                refresh: refreshToken
            });
            const { access, refresh } = response.data;
            // Sauvegarder les nouveaux tokens
            localStorage.setItem('access_token', access);
            if (refresh) {
                localStorage.setItem('refresh_token', refresh);
            }
            // Réessayer la requête originale avec le nouveau token
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access}`;
            }
            return apiClient(originalRequest);
        } catch (refreshError) {
            // Échec du refresh, déconnecter l'utilisateur
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
"[project]/Desktop/Projet_GL/covoiturage/Frontend/services/verification.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// services/verification.service.ts - VERSION COMPLÈTE
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$api$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/services/api.client.ts [app-client] (ecmascript)");
;
class VerificationService {
    /**
   * ✅ Récupère le statut de vérification de l'utilisateur
   * Retourne si l'email et le téléphone sont vérifiés,
   * ainsi que si c'est la première connexion
   */ async getVerificationStatus() {
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$api$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/users/verification-status/');
            const data = response.data;
            return {
                email_verified: data.email_verified || false,
                phone_verified: data.phone_verified || false,
                phone_number: data.phone_number,
                has_phone_number: !!data.phone_number || data.has_phone_number || false,
                first_login: data.first_login || false
            };
        } catch (error) {
            console.error('Error getting verification status:', error);
            throw error;
        }
    }
    /**
   * ✅ Envoie un code de vérification par email
   */ async sendEmailVerification() {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$api$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/users/send-email-verification/');
        } catch (error) {
            if (error.response?.data?.error === 'EMAIL_ALREADY_VERIFIED') {
                throw new Error('EMAIL_ALREADY_VERIFIED');
            }
            throw error;
        }
    }
    /**
   * ✅ Envoie un code de vérification par SMS
   */ async sendPhoneVerification() {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$api$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/users/send-phone-verification/');
        } catch (error) {
            if (error.response?.data?.error === 'PHONE_ALREADY_VERIFIED') {
                throw new Error('PHONE_ALREADY_VERIFIED');
            }
            if (error.response?.data?.error === 'NO_PHONE_NUMBER') {
                throw new Error('NO_PHONE_NUMBER');
            }
            throw error;
        }
    }
    /**
   * ✅ Vérifie l'email avec le code reçu
   * @param code - Code de vérification à 6 chiffres
   */ async verifyEmail(_code) {}
    /**
   * ✅ Vérifie le téléphone avec le code reçu par SMS
   * @param code - Code de vérification à 6 chiffres
   */ async verifyPhone(_code) {}
}
const __TURBOPACK__default__export__ = new VerificationService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VerifyPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Projet_GL/covoiturage/Frontend/services/verification.service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function VerifyPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [emailCode, setEmailCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [phoneCode, setPhoneCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [emailVerified, setEmailVerified] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [phoneVerified, setPhoneVerified] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [emailSent, setEmailSent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [phoneSent, setPhoneSent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [hasPhoneNumber, setHasPhoneNumber] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isFirstLogin, setIsFirstLogin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VerifyPage.useEffect": ()=>{
            checkVerificationStatus();
        }
    }["VerifyPage.useEffect"], []);
    // ✅ Redirection UNIQUEMENT quand EMAIL vérifié ET (téléphone vérifié OU pas de téléphone)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VerifyPage.useEffect": ()=>{
            const canRedirect = emailVerified && phoneVerified;
            if (canRedirect && !loading) {
                console.log('✅ Tout est vérifié, redirection...');
                setTimeout({
                    "VerifyPage.useEffect": ()=>{
                        if (isFirstLogin) {
                            console.log('🎯 Première connexion → /preferences');
                            router.push('/preferences');
                        } else {
                            console.log('🎯 Connexion habituelle → /');
                            router.push('/');
                        }
                    }
                }["VerifyPage.useEffect"], 1500);
            }
        }
    }["VerifyPage.useEffect"], [
        emailVerified,
        phoneVerified,
        hasPhoneNumber,
        loading,
        isFirstLogin,
        router
    ]);
    const checkVerificationStatus = async ()=>{
        try {
            const status = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getVerificationStatus();
            setEmailVerified(status.email_verified);
            setPhoneVerified(status.phone_verified);
            setIsFirstLogin(status.first_login);
            setHasPhoneNumber(status.has_phone_number);
            console.log('📊 Statut de vérification:', status);
            console.log('🔑 Première connexion ?', status.first_login);
            console.log('📧 Email vérifié ?', status.email_verified);
            console.log('📱 Téléphone vérifié ?', status.phone_verified);
            console.log('📱 A un téléphone ?', status.has_phone_number);
            // ✅ Vérifier si tout est OK pour rediriger
            const isFullyVerified = status.email_verified && (status.phone_verified || !status.has_phone_number);
            if (isFullyVerified) {
                console.log('✅ Déjà vérifié, redirection immédiate');
                if (status.first_login) {
                    router.push('/preferences');
                } else {
                    router.push('/');
                }
                return;
            }
            // Envoyer les codes automatiquement si nécessaire
            await sendInitialCodes(status.email_verified, status.phone_verified, status.has_phone_number);
        } catch (err) {
            console.error('❌ Erreur vérification statut:', err);
            setError('Erreur lors de la vérification du statut');
        } finally{
            setLoading(false);
        }
    };
    const sendInitialCodes = async (emailAlreadyVerified, phoneAlreadyVerified, hasPhone)=>{
        if (!emailAlreadyVerified) {
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sendEmailVerification();
                setEmailSent(true);
                console.log('✅ Code email envoyé');
            } catch (err) {
                if (err.message === 'EMAIL_ALREADY_VERIFIED') {
                    setEmailVerified(true);
                    console.log('ℹ️ Email déjà vérifié');
                } else {
                    console.error('❌ Erreur envoi code email:', err);
                }
            }
        }
        if (!phoneAlreadyVerified && hasPhone) {
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sendPhoneVerification();
                setPhoneSent(true);
                console.log('✅ Code téléphone envoyé');
            } catch (err) {
                if (err.message === 'PHONE_ALREADY_VERIFIED') {
                    setPhoneVerified(true);
                    console.log('ℹ️ Téléphone déjà vérifié');
                } else if (err.message === 'NO_PHONE_NUMBER') {
                    setHasPhoneNumber(false);
                    console.log('ℹ️ Pas de téléphone enregistré');
                } else {
                    console.error('❌ Erreur envoi code téléphone:', err);
                }
            }
        }
    };
    const handleVerifyEmail = async (e)=>{
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].verifyEmail(emailCode);
            setEmailVerified(true);
            setSuccess('✅ Email vérifié avec succès !');
            console.log('✅ Email vérifié');
        } catch (err) {
            setError(err.response?.data?.error || 'Code email invalide');
            console.error('❌ Erreur vérification email:', err);
        }
    };
    const handleVerifyPhone = async (e)=>{
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].verifyPhone(phoneCode);
            setPhoneVerified(true);
            setSuccess('✅ Téléphone vérifié avec succès !');
            console.log('✅ Téléphone vérifié');
        } catch (err) {
            setError(err.response?.data?.error || 'Code téléphone invalide');
            console.error('❌ Erreur vérification téléphone:', err);
        }
    };
    const handleResendEmailCode = async ()=>{
        setError('');
        setSuccess('');
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sendEmailVerification();
            setSuccess('📧 Nouveau code email envoyé !');
        } catch (err) {
            if (err.message === 'EMAIL_ALREADY_VERIFIED') {
                setEmailVerified(true);
                setSuccess('✅ Email déjà vérifié !');
            } else {
                setError("Erreur lors de l'envoi du code");
            }
        }
    };
    const handleResendPhoneCode = async ()=>{
        setError('');
        setSuccess('');
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$services$2f$verification$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].sendPhoneVerification();
            setSuccess('📱 Nouveau code SMS envoyé !');
        } catch (err) {
            if (err.message === 'PHONE_ALREADY_VERIFIED') {
                setPhoneVerified(true);
                setSuccess('✅ Téléphone déjà vérifié !');
            } else if (err.message === 'NO_PHONE_NUMBER') {
                setHasPhoneNumber(false);
                setError('Aucun numéro de téléphone enregistré');
            } else {
                setError("Erreur lors de l'envoi du code");
            }
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5722] mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-gray-600",
                        children: "Vérification en cours..."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
            lineNumber: 201,
            columnNumber: 7
        }, this);
    }
    // ✅ Afficher l'écran de succès UNIQUEMENT si vraiment tout est vérifié
    if (emailVerified && (phoneVerified || !hasPhoneNumber)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-8 h-8 text-green-600",
                            fill: "currentColor",
                            viewBox: "0 0 20 20",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                fillRule: "evenodd",
                                d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                clipRule: "evenodd"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                lineNumber: 221,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 216,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 215,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900 mb-2",
                        children: "Compte vérifié !"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 228,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: isFirstLogin ? 'Configuration de vos préférences...' : 'Redirection en cours...'
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 231,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                lineNumber: 214,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
            lineNumber: 213,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sm:mx-auto sm:w-full sm:max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mt-6 text-center text-3xl font-extrabold text-gray-900",
                        children: "Vérification de compte"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 244,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-center text-sm text-gray-600",
                        children: isFirstLogin ? 'Bienvenue ! Vérifiez votre email et téléphone pour commencer' : 'Vérifiez votre email et téléphone pour continuer'
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                        lineNumber: 247,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                lineNumber: 243,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6",
                    children: [
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 257,
                            columnNumber: 13
                        }, this),
                        success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded",
                            children: success
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 263,
                            columnNumber: 13
                        }, this),
                        !emailVerified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-b pb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-medium text-gray-900 mb-4",
                                    children: "📧 Vérification Email"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 270,
                                    columnNumber: 15
                                }, this),
                                emailSent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600 mb-4",
                                    children: "Un code a été envoyé à votre adresse email"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 274,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700",
                                                    children: "Code de vérification"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                    lineNumber: 280,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: emailCode,
                                                    onChange: (e)=>setEmailCode(e.target.value),
                                                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]",
                                                    placeholder: "Entrez le code à 6 chiffres",
                                                    maxLength: 6
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                    lineNumber: 283,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 279,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleVerifyEmail,
                                            className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF5722] hover:bg-[#E64A19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]",
                                            children: "Vérifier Email"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 292,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleResendEmailCode,
                                            className: "w-full text-center text-sm text-[#FF5722] hover:text-[#E64A19]",
                                            children: "Renvoyer le code"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 298,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 278,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 269,
                            columnNumber: 13
                        }, this),
                        emailVerified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center text-green-600 border-b pb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-5 h-5 mr-2",
                                    fill: "currentColor",
                                    viewBox: "0 0 20 20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                        clipRule: "evenodd"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 310,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Email vérifié ✓"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 321,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 309,
                            columnNumber: 13
                        }, this),
                        !phoneVerified && hasPhoneNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-medium text-gray-900 mb-4",
                                    children: "📱 Vérification Téléphone"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 327,
                                    columnNumber: 15
                                }, this),
                                phoneSent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600 mb-4",
                                    children: "Un code SMS a été envoyé à votre téléphone"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 331,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700",
                                                    children: "Code de vérification"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: phoneCode,
                                                    onChange: (e)=>setPhoneCode(e.target.value),
                                                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]",
                                                    placeholder: "Entrez le code à 6 chiffres",
                                                    maxLength: 6
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 336,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleVerifyPhone,
                                            className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF5722] hover:bg-[#E64A19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]",
                                            children: "Vérifier Téléphone"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 349,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleResendPhoneCode,
                                            className: "w-full text-center text-sm text-[#FF5722] hover:text-[#E64A19]",
                                            children: "Renvoyer le code"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 335,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 326,
                            columnNumber: 13
                        }, this),
                        emailVerified && !phoneVerified && !hasPhoneNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-amber-50 border border-amber-200 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0",
                                        fill: "currentColor",
                                        viewBox: "0 0 20 20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            fillRule: "evenodd",
                                            d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
                                            clipRule: "evenodd"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 374,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                        lineNumber: 369,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "font-semibold text-amber-900 mb-1",
                                                children: "Téléphone requis pour continuer"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                lineNumber: 381,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-amber-700 mb-3",
                                                children: "Ajoutez un numéro de téléphone pour finaliser votre inscription"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                lineNumber: 384,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>router.push('/profile'),
                                                className: "px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors",
                                                children: "Ajouter mon numéro"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                                lineNumber: 388,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                        lineNumber: 380,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                lineNumber: 368,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 367,
                            columnNumber: 13
                        }, this),
                        !emailVerified && !phoneVerified && !hasPhoneNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-blue-50 border border-blue-200 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0",
                                        fill: "currentColor",
                                        viewBox: "0 0 20 20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            fillRule: "evenodd",
                                            d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                                            clipRule: "evenodd"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 408,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                        lineNumber: 403,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-blue-700",
                                            children: "Vous pourrez ajouter votre numéro de téléphone après la vérification de votre email"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                            lineNumber: 415,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                        lineNumber: 414,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                lineNumber: 402,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 401,
                            columnNumber: 13
                        }, this),
                        phoneVerified && !emailVerified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center text-green-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-5 h-5 mr-2",
                                    fill: "currentColor",
                                    viewBox: "0 0 20 20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                        clipRule: "evenodd"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                        lineNumber: 431,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 426,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Téléphone vérifié ✓"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                                    lineNumber: 437,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                            lineNumber: 425,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                    lineNumber: 255,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
                lineNumber: 254,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Projet_GL/covoiturage/Frontend/app/verify/page.tsx",
        lineNumber: 242,
        columnNumber: 5
    }, this);
}
_s(VerifyPage, "BkpwEoMuFSS5NCJjVH2uNb91V8U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Projet_GL$2f$covoiturage$2f$Frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = VerifyPage;
var _c;
__turbopack_context__.k.register(_c, "VerifyPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_Projet_GL_covoiturage_Frontend_584aeabb._.js.map