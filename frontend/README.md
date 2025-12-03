# SecureAuth+ Frontend

## Description
Interface utilisateur React pour la plateforme IAM SecureAuth+.

## Technologies
- React 18
- Vite
- React Router v6
- Axios
- JWT Decode

## Installation

```bash
npm install
```

## Configuration

L'API backend doit être accessible sur `http://localhost:8080`.

Si vous devez changer l'URL, modifiez `src/services/api.js` :

```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

## Démarrage

```bash
npm run dev
```

L'application démarre sur http://localhost:5173

## Connexion par défaut

- **Username**: admin
- **Password**: Admin@123

## Fonctionnalités

### Authentification
- Login avec JWT
- Refresh token automatique
- Déconnexion

### Dashboard
- Vue d'ensemble des statistiques
- Activité récente de l'utilisateur

### Gestion des Utilisateurs (ADMIN/MANAGER)
- Liste des utilisateurs avec pagination
- Création d'utilisateur avec génération automatique de credentials
- Modification des informations utilisateur
- Activation/Désactivation
- Déverrouillage de compte
- Suppression

### Gestion des Rôles (ADMIN)
- CRUD complet des rôles
- Visualisation des permissions

### Audit (ADMIN/SECURITY)
- Consultation des logs d'activité
- Recherche avec filtres multiples
- Pagination

### Demandes d'Inscription (ADMIN)
- Consultation des demandes
- Approbation avec création automatique de compte
- Rejet avec commentaire

## Structure du projet

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   │   └── Navbar.jsx
│   ├── pages/          # Pages de l'application
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Roles.jsx
│   │   ├── AuditLogs.jsx
│   │   └── Registrations.jsx
│   ├── services/       # Services API
│   │   ├── api.js
│   │   └── authService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Build pour production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

## Licence

Apache 2.0
