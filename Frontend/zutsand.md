📦 INSTALLATION:
npm install zustand

🔧 COMMANDES:
cd frontend/src
mkdir stores hooks
touch stores/auth-store.ts
touch hooks/use-auth.ts

📝 ÉTAPES:
1. Installer zustand
2. Créer stores/auth-store.ts (copier le code ci-dessus)
3. Créer hooks/use-auth.ts (copier le code ci-dessus)
4. Modifier app/layout.tsx (enlever AuthProvider)
5. Dans tous vos fichiers, changer l'import de useAuth
6. Supprimer contexts/auth-context.tsx
7. Tester!

🎯 AVANTAGES:
- Même API qu'avant (zéro casse de code)
- Meilleure performance
- Persistence automatique
- Moins de code
- Plus facile à maintenir