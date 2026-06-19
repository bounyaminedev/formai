# FormAI Frontend

Page web minimale pour créer un Google Form depuis une description.

## Lancer localement

```bash
python3 -m http.server 5173 -d frontend
```

Configurer le backend avec :

```bash
FRONTEND_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## Parcours utilisateur

1. Se connecter avec Google.
2. Décrire le formulaire.
3. Cliquer sur **Créer le formulaire**.
4. Être redirigé vers le Google Form généré.
