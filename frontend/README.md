# FormAI Studio Frontend

Interface web statique et professionnelle qui consomme l’API backend FormAI.

## Lancer localement

Depuis la racine du repo :

```bash
python3 -m http.server 5173 -d frontend
```

Puis ouvrir `http://localhost:5173`.

## Utilisation

1. Lancer l’API backend sur `http://localhost:3000`.
2. Optionnel pour un test sans Google/Gemini : mettre `MOCK_EXTERNAL_APIS=true` dans le `.env` backend.
3. Renseigner l’URL de l’API dans l’interface.
4. Cliquer sur **Connecter Google** si le backend est en mode réel, puis copier l’email retourné comme User ID.
5. Décrire le formulaire et cliquer sur **Générer le Google Form**.

## Notes UX

- Les paramètres API/User ID sont persistés dans `localStorage`.
- Les exemples rapides remplissent automatiquement le prompt.
- Les erreurs API sont affichées sans exposer de token ou secret.
