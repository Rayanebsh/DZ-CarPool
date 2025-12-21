# Frontend DZ-CarPool – Qualité du code

Ce frontend utilise **ESLint** et **Prettier** pour garantir une qualité de code cohérente et lisible.

## ESLint

- Configuration : `eslint.config.js` dossier Frontend.
- Objectif : analyser le code TypeScript/React, détecter les erreurs courantes (variables non utilisées, globals manquants, etc.) et intégrer les règles de formatage de Prettier.

Principales caractéristiques :
- Support de TypeScript (`@typescript-eslint`).
- Support de React et des hooks (`eslint-plugin-react`, `eslint-plugin-react-hooks`).
- Globals configurés pour l’environnement navigateur (`window`, `fetch`, `console`, etc.).
- Règles de base :
  - `@typescript-eslint/no-unused-vars` (variables non utilisées en warning).
  - `prettier/prettier` (formatage imposé par Prettier).

Commandes disponibles :
Lancer l'analyse ESLint
npm run lint

Lancer l'analyse + correction automatique
npm run lint:fix

text

## Prettier

- Configuration : fichier `.prettierrc` (ou `prettier.config.cjs`) présent dans le repository.
- Objectif : appliquer automatiquement un style de code uniforme sur l’ensemble du projet. [web:80][web:76]

Exemple de configuration :

{
"semi": true,
"singleQuote": true,
"trailingComma": "all",
"printWidth": 80,
"tabWidth": 2,
"endOfLine": "auto"
}

text

Commandes disponibles :

Formater tout le code du projet
npm run format

Vérifier que le code est bien formaté (utile pour le CI)
npm run format:check

text

## Scripts `package.json`

Les scripts suivants sont définis dans le `package.json` du frontend :

{
"scripts": {
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"format": "prettier "/*.{js,jsx,ts,tsx,css,md,json}" --write",
"format:check": "prettier "/*.{js,jsx,ts,tsx,css,md,json}" --check"
}
}

text

Ces éléments (fichiers de configuration + scripts) montrent explicitement que l’utilisation de **ESLint** et **Prettier** est obligatoire et intégrée dans le workflow du frontend. [web:78][web:85]
