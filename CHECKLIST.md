# ✅ Checklist d'intégration Google OAuth

## 📦 Installation des packages

### Frontend
- [ ] `npm install @react-oauth/google`
- [ ] `npm install axios`

### Backend
- [ ] `pip install django-allauth`
- [ ] Packages déjà installés dans `requirements.txt`

## 📁 Fichiers créés/modifiés

### Frontend
- [ ] `/components/google-login-button.tsx` créé
- [ ] `/app/layout.tsx` mis à jour avec `GoogleOAuthProvider`
- [ ] `/contexts/auth-context.tsx` mis à jour (setUser, setIsAuthenticated exposés)
- [ ] `/services/auth.service.ts` mis à jour (méthode googleAuth ajoutée)
- [ ] `/app/signup/page.tsx` intègre `<GoogleLoginButton />`
- [ ] `/app/login/page.tsx` intègre `<GoogleLoginButton />`
- [ ] `.env.local` créé avec `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Backend
- [ ] `config/settings.py` déjà configuré avec allauth
- [ ] `app/users/views.py` déjà configuré avec endpoint `google_auth`
- [ ] `.env` créé avec `GOOGLE_OAUTH_CLIENT_ID` et `GOOGLE_OAUTH_CLIENT_SECRET`

## 🔑 Google Cloud Console

- [ ] Projet créé sur Google Cloud Console
- [ ] API Google+ activée
- [ ] OAuth consent screen configuré
- [ ] Credentials OAuth 2.0 créés
- [ ] Origines JavaScript autorisées :
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
- [ ] URI de redirection configurés :
  - `http://localhost:3000`
  - `http://localhost:8000/accounts/google/login/callback/`
- [ ] Client ID copié
- [ ] Client Secret copié

## ⚙️ Configuration Django Admin

- [ ] Serveur Django lancé : `python manage.py runserver`
- [ ] Accès à http://localhost:8000/admin/
- [ ] **Sites** → Site configuré avec domain `localhost:3000`
- [ ] **Social applications** → Application Google créée avec :
  - Provider : Google
  - Client ID
  - Secret Key
  - Site associé

## 🗄️ Migrations Django

- [ ] `python manage.py migrate` exécuté
- [ ] Tables `socialaccount_*` créées
- [ ] Superuser créé : `python manage.py createsuperuser`

## 🧪 Tests

### Test 1 : Vérification des packages
```bash
# Frontend
npm list @react-oauth/google

# Backend
python manage.py shell
>>> from allauth.socialaccount.models import SocialApp
>>> SocialApp.objects.all()
```

### Test 2 : Connexion Google
- [ ] Frontend : http://localhost:3000/login
- [ ] Clic sur "Continuer avec Google"
- [ ] Popup Google s'ouvre
- [ ] Sélection du compte
- [ ] Redirection vers `/#hero` ou `/verify`

### Test 3 : Vérification backend
- [ ] Console Django affiche : `POST /api/users/google_auth/ 200`
- [ ] Token JWT généré
- [ ] User créé dans la base de données

### Test 4 : User créé
```bash
python manage.py shell
>>> from app.users.models import User
>>> User.objects.filter(email='ton_email_google@gmail.com').exists()
True
```

## 🚨 Dépannage rapide

### Erreur "Token Google invalide"
→ Vérifie que l'API Google+ est activée (attends 5 minutes)

### Erreur "redirect_uri_mismatch"
→ Vérifie les URIs dans Google Cloud Console

### Erreur "CORS"
→ Vérifie `CORS_ALLOWED_ORIGINS` dans `settings.py`

### Erreur "SocialApp does not exist"
→ Crée l'application dans Django Admin

## 📊 Flux de connexion attendu

```
User → Clique "Continuer avec Google"
     → Popup Google OAuth
     → Sélection compte
     → Frontend reçoit access_token
     → POST /api/users/google_auth/ avec access_token
     → Backend vérifie token avec Google
     → Backend crée/récupère user
     → Backend génère JWT tokens
     → Frontend stocke tokens
     → Redirection vers /#hero ou /verify
```

## 📝 Variables d'environnement requises

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

### Backend (.env)
```bash
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

## ✅ Confirmation finale

Si tous les tests passent :
- [x] Google OAuth est fonctionnel
- [x] Users peuvent se connecter avec Google
- [x] JWT tokens sont générés correctement
- [x] Redirection fonctionne

---

**🎉 Configuration terminée avec succès !**