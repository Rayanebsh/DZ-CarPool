# Configuration Google OAuth pour DZ-CarPool

## 📋 Prérequis
- Compte Google
- Projet Django configuré avec `django-allauth`
- Application Next.js avec `@react-oauth/google`

## 🔧 Configuration Google Cloud Console

### Étape 1 : Créer un projet Google Cloud

1. Va sur [Google Cloud Console](https://console.cloud.google.com/)
2. Clique sur **Select a project** → **NEW PROJECT**
3. Nom du projet : `DZ-CarPool` (ou autre)
4. Clique sur **CREATE**

### Étape 2 : Activer l'API Google+

1. Dans le menu de gauche, va dans **APIs & Services** → **Library**
2. Recherche "Google+ API"
3. Clique sur **Google+ API**
4. Clique sur **ENABLE**

### Étape 3 : Configurer l'écran de consentement OAuth

1. Va dans **APIs & Services** → **OAuth consent screen**
2. Sélectionne **External** (pour tests) ou **Internal** (si G Suite)
3. Clique sur **CREATE**

#### Informations de l'application :
- **App name** : DZ-CarPool
- **User support email** : ton_email@gmail.com
- **Developer contact** : ton_email@gmail.com
- **App logo** : (optionnel)

4. Clique sur **SAVE AND CONTINUE**

#### Scopes :
- Ajoute les scopes suivants :
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Clique sur **SAVE AND CONTINUE**

#### Test users (mode External) :
- Ajoute ton email de test
- Clique sur **SAVE AND CONTINUE**

### Étape 4 : Créer les identifiants OAuth

1. Va dans **APIs & Services** → **Credentials**
2. Clique sur **CREATE CREDENTIALS** → **OAuth client ID**
3. Sélectionne **Web application**

#### Configuration :
- **Name** : DZ-CarPool Web Client

#### Origines JavaScript autorisées :
```
http://localhost:3000
http://127.0.0.1:3000
```

#### URI de redirection autorisés :
```
http://localhost:3000
http://127.0.0.1:3000
http://localhost:8000/accounts/google/login/callback/
```

4. Clique sur **CREATE**
5. **IMPORTANT** : Copie le **Client ID** et le **Client Secret**

## 🔐 Configuration des variables d'environnement

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

### Backend (.env)
```bash
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

## 🗄️ Configuration Django Admin

1. Lance ton serveur Django :
```bash
python manage.py runserver
```

2. Va sur http://localhost:8000/admin/

3. **Sites** → Modifie le site existant :
   - Domain name : `localhost:3000`
   - Display name : `DZ-CarPool`

4. **Social applications** → **ADD SOCIAL APPLICATION** :
   - Provider : **Google**
   - Name : `Google OAuth`
   - Client id : `ton_client_id`
   - Secret key : `ton_client_secret`
   - Sites : Sélectionne `localhost:3000`
   - Clique sur **SAVE**

## ✅ Test de l'intégration

### Test 1 : Vérifier l'installation
```bash
# Frontend
cd frontend
npm list @react-oauth/google

# Backend
python manage.py shell
>>> from allauth.socialaccount.models import SocialApp
>>> SocialApp.objects.filter(provider='google').exists()
True
```

### Test 2 : Test de connexion

1. Va sur http://localhost:3000/login
2. Clique sur "Continuer avec Google"
3. Sélectionne ton compte Google
4. Accepte les permissions
5. Tu devrais être redirigé vers `/#hero`

### Test 3 : Vérifier les logs Django

Dans la console Django, tu devrais voir :
```
POST /api/users/google_auth/ 200 OK
```

## 🐛 Troubleshooting

### Erreur : "redirect_uri_mismatch"
- Vérifie que l'URI dans Google Cloud Console est exactement `http://localhost:3000`
- Vérifie qu'il n'y a pas de slash final

### Erreur : "invalid_client"
- Vérifie que le Client ID est correct dans `.env.local`
- Vérifie que le Client Secret est correct dans `.env` Django

### Erreur : "Token Google invalide"
- Vérifie que l'API Google+ est activée
- Attends quelques minutes après avoir activé l'API

### Erreur : "SocialApp matching query does not exist"
- Vérifie que tu as créé une Social Application dans Django Admin
- Vérifie que le site est bien associé

### Console Django ne reçoit pas la requête
- Vérifie que `NEXT_PUBLIC_API_URL` pointe vers le bon backend
- Vérifie que CORS est configuré dans Django

## 📝 Notes importantes

- En mode **External**, seuls les utilisateurs de test peuvent se connecter
- Pour la production, il faut passer en mode **Internal** (G Suite) ou publier l'app
- Les tokens Google sont valides 1 heure
- Les refresh tokens Django durent 7 jours par défaut

## 🚀 Passage en production

Avant de déployer :

1. Ajoute tes domaines de production dans Google Cloud Console
2. Change `DJANGO_ENV=production` dans `.env`
3. Configure un serveur SMTP pour les emails
4. Utilise HTTPS pour toutes les URLs
5. Publie ton app OAuth (si External)

---

✅ **Configuration terminée !**