# FormAI — Génération de Google Forms par IA

API backend Node.js + TypeScript + Express qui transforme une description en langage naturel en Google Form créé dans le Drive de l'utilisateur.

## Fonctionnalités

- OAuth Google avec scopes `forms.body`, `drive.file` et `userinfo.email` (uniquement pour associer les tokens à l’email utilisateur du MVP).
- Stockage SQLite des tokens OAuth par email utilisateur.
- Génération de structure via Gemini `gemini-2.5-flash-lite` avec validation Zod.
- Retry Gemini sur 429 avec backoff exponentiel 1s, 2s, 4s.
- Création Google Forms en deux étapes : `forms.create`, puis `forms.batchUpdate`.
- Découpage automatique des questions en lots de 50.
- Publication explicite via `forms.setPublishSettings`, requise pour les formulaires créés par API après le 30 juin 2026.
- Logging Pino avec redaction des tokens et compteur SQLite des appels Gemini quotidiens.

## Prérequis

- Node.js 20+
- Un projet Google Cloud
- SQLite local via `better-sqlite3`

## Configuration Google

1. Créer un projet dans Google Cloud Console.
2. Activer **Google Forms API** et **Google Drive API**.
3. Configurer l'écran de consentement OAuth en mode **Testing**. Ce mode est suffisant pour le MVP et limite l'app à 100 utilisateurs de test.
4. Créer un client OAuth 2.0 Web et ajouter `http://localhost:3000/auth/google/callback` comme redirect URI.
5. Créer une clé Gemini gratuite dans Google AI Studio.

## Installation locale

```bash
npm install
cp .env.example .env
# Remplir GEMINI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
npm run dev
```

Variables disponibles :

- `PORT` : port HTTP, par défaut `3000`.
- `GEMINI_API_KEY` : clé Google AI Studio.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` : identifiants OAuth.
- `GOOGLE_REDIRECT_URI` : callback OAuth.
- `SQLITE_PATH` : chemin de la base SQLite.
- `APP_BASE_URL` : URL locale de l'API.

## Tester avec curl

> Les vraies API Google/Gemini ne sont pas appelées dans les tests automatisés de ce repo. Les étapes ci-dessous nécessitent de vraies clés et un utilisateur de test OAuth.

1. Ouvrir l'URL OAuth :

```bash
curl -i http://localhost:3000/auth/google
```

2. Suivre la redirection dans un navigateur, accepter les scopes Google Forms, Drive et email, puis récupérer le `userId` retourné par `/auth/google/callback`.

3. Générer un formulaire :

```bash
curl -X POST http://localhost:3000/forms/generate \
  -H 'Content-Type: application/json' \
  -d '{"userId":"you@example.com","description":"Crée un formulaire d inscription pour un atelier TypeScript avec nom, email, niveau, préférences horaires et commentaires."}'
```

Réponse attendue :

```json
{
  "formUrl": "https://docs.google.com/forms/d/.../viewform",
  "editUrl": "https://docs.google.com/forms/d/.../edit",
  "title": "..."
}
```

## Collection Postman

Importer `postman/formai.postman_collection.json`. La collection contient :

- `GET /health`
- `GET /auth/google`
- `POST /forms/generate` avec exemples inscription, satisfaction et événement.

## Choix d'implémentation

- `userId` = email Google, récupéré via OAuth profile, pour garder le MVP simple.
- Table `oauth_tokens` : tokens OAuth et date d'expiration.
- Table `gemini_usage` : compteur quotidien d'appels Gemini pour surveiller le quota gratuit de 1000/jour.
- Les questions `SCALE` utilisent une échelle simple 1–5.
- Les questions d'upload de fichier sont volontairement exclues du prompt car Google Forms API ne les crée pas.

## Scripts

- `npm run dev` : serveur en watch avec `tsx`.
- `npm run build` : compilation TypeScript.
- `npm run lint` : ESLint.
- `npm run format` : Prettier.
- `npm test` : tests unitaires Vitest.
