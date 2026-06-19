# FormAI Frontend

Site web public qui consomme l’API FormAI et propose un flow utilisateur simple :
connexion Google, description du besoin, création du formulaire, puis redirection vers Google Forms.

## Lancer localement

Depuis la racine du repo :

```bash
python3 -m http.server 5173 -d frontend
```

Puis ouvrir `http://localhost:5173`.

## Configuration attendue côté backend

Dans `.env` backend :

```bash
FRONTEND_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

En production, `FRONTEND_URL` doit pointer vers le domaine public du site.

## Flow utilisateur

1. L’utilisateur clique sur **Continuer avec Google**.
2. Google renvoie vers le callback backend.
3. Le backend stocke les tokens puis redirige vers le frontend avec l’utilisateur connecté.
4. L’utilisateur décrit son formulaire.
5. Le frontend appelle `POST /forms/generate`.
6. À la création, l’utilisateur est redirigé vers le Google Form généré.
