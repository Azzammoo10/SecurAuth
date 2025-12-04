# 📋 Rapport de Présentation - SecureAuth+

## 🎯 Guide de Présentation Professionnelle

---

# 1. Introduction et Contexte

## 1.1 Présentation du Projet

**SecureAuth+** est une plateforme de gestion des identités et des accès (IAM - Identity and Access Management) développée avec une architecture moderne et sécurisée. Ce projet répond aux besoins critiques de sécurité des entreprises en matière d'authentification et de gestion des utilisateurs.

### Points clés à mentionner :
- **Nom du projet** : SecureAuth+
- **Type** : Plateforme IAM (Identity and Access Management)
- **Objectif** : Fournir une solution complète de gestion des identités, authentification sécurisée et contrôle d'accès

## 1.2 Problématique Adressée

> "Dans un contexte où les cyberattaques sont en augmentation constante, comment garantir une authentification sécurisée tout en maintenant une expérience utilisateur fluide ?"

### Défis résolus :
1. **Sécurité des authentifications** → Authentification à deux facteurs (2FA)
2. **Gestion centralisée des utilisateurs** → Interface d'administration complète
3. **Traçabilité des actions** → Système d'audit complet
4. **Contrôle d'accès granulaire** → Gestion des rôles et permissions (RBAC)

---

# 2. Architecture Technique

## 2.1 Stack Technologique

### Backend (API REST)
| Technologie | Version | Rôle |
|-------------|---------|------|
| **Java** | 17 LTS | Langage principal |
| **Spring Boot** | 3.5.0 | Framework backend |
| **Spring Security** | 6.x | Sécurité et authentification |
| **PostgreSQL** | 15+ | Base de données relationnelle |
| **JWT** | - | Tokens d'authentification |
| **TOTP** | - | Authentification 2FA |

### Frontend (SPA)
| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 18 | Framework frontend |
| **Vite** | 5.x | Build tool moderne |
| **React Router** | 6 | Routage SPA |
| **Axios** | - | Client HTTP |

### Infrastructure
| Composant | Technologie |
|-----------|-------------|
| **Base de données** | PostgreSQL |
| **Serveur mail** | Gmail SMTP |
| **Documentation API** | Swagger/OpenAPI |

## 2.2 Architecture du Projet

```
SecureAuth+/
├── backend/                    # API Spring Boot
│   ├── src/main/java/
│   │   └── com/secureauth/
│   │       ├── config/         # Configurations (Security, JWT, CORS)
│   │       ├── controllers/    # Endpoints REST
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── entities/       # Entités JPA
│   │       ├── exceptions/     # Gestion des erreurs
│   │       ├── repositories/   # Accès données
│   │       └── services/       # Logique métier
│   └── src/main/resources/
│       ├── application.yml     # Configuration
│       └── templates/          # Templates email
│
├── frontend/                   # Application React
│   └── src/
│       ├── components/         # Composants réutilisables
│       ├── pages/              # Pages de l'application
│       ├── services/           # Services API
│       └── styles/             # CSS et thèmes
│
└── database/                   # Scripts SQL
```

## 2.3 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  Login  │ │Dashboard│ │  Users  │ │  Roles  │ │  Audit  │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
└───────┼───────────┼───────────┼───────────┼───────────┼────────┘
        │           │           │           │           │
        └───────────┴───────────┼───────────┴───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    API REST (8080)    │
                    │    Spring Boot 3.5    │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼───────┐    ┌──────────▼──────────┐    ┌──────▼──────┐
│  PostgreSQL   │    │   Spring Security   │    │  JWT/TOTP   │
│   Database    │    │   + JWT Filter      │    │   Service   │
└───────────────┘    └─────────────────────┘    └─────────────┘
```

---

# 3. Fonctionnalités Principales

## 3.1 Authentification et Sécurité

### 🔐 Authentification Multi-facteurs
- **Login standard** : Username + Password
- **2FA avec Google Authenticator** : Code TOTP à 6 chiffres
- **Tokens JWT** : Access token (1h) + Refresh token (24h)

### 🛡️ Sécurité Avancée
| Fonctionnalité | Description |
|----------------|-------------|
| **Verrouillage de compte** | Après 3 tentatives échouées |
| **Politique de mot de passe** | Min 8 caractères, majuscule, minuscule, chiffre, spécial |
| **Historique des mots de passe** | Empêche la réutilisation des 5 derniers |
| **Sessions actives** | Visualisation et invalidation |
| **Clés API** | Génération et gestion sécurisée |

## 3.2 Gestion des Utilisateurs

### Cycle de vie utilisateur
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Inscription │────▶│   Pending    │────▶│   Approved   │
│   (Register) │     │   (Admin)    │     │   (Active)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Rejected   │
                    └──────────────┘
```

### Fonctionnalités CRUD
- ✅ Création d'utilisateurs avec mot de passe temporaire
- ✅ Modification des informations
- ✅ Activation/Désactivation
- ✅ Verrouillage/Déverrouillage
- ✅ Réinitialisation de mot de passe
- ✅ Suppression sécurisée

## 3.3 Gestion des Rôles et Permissions (RBAC)

### Modèle de données
```
User ──── M:N ──── Role ──── M:N ──── Permission
```

### Rôles prédéfinis
| Rôle | Permissions |
|------|-------------|
| **ADMIN** | Accès complet à toutes les fonctionnalités |
| **MANAGER** | Gestion des utilisateurs et visualisation des audits |
| **USER** | Accès au profil et paramètres de sécurité |

## 3.4 Système d'Audit

### Actions tracées
- Connexions (succès/échec)
- Modifications d'utilisateurs
- Changements de mots de passe
- Activations 2FA
- Approbations/Rejets d'inscriptions

### Informations capturées
- Timestamp
- Username
- Action
- Adresse IP
- User-Agent
- Détails / Message d'erreur

## 3.5 Notifications Email

### Emails automatiques
1. **Email de bienvenue** : Envoyé après approbation avec identifiants
2. **Email de rejet** : Notification de refus d'inscription
3. **Réinitialisation** : Nouveau mot de passe temporaire

---

# 4. Démonstration Pratique

## 4.1 Scénario de Démonstration Recommandé

### Étape 1 : Connexion Admin
```
URL: http://localhost:5173/login
Username: admin
Password: Admin@123
```
**Points à montrer** : Interface de login, validation, redirection

### Étape 2 : Dashboard Admin
**Points à montrer** :
- Statistiques en temps réel
- Widgets de synthèse
- Navigation intuitive

### Étape 3 : Gestion des Utilisateurs
**Actions à démontrer** :
1. Créer un utilisateur → Montrer le mot de passe généré
2. Modifier un utilisateur → Changer les rôles
3. Désactiver/Activer un compte
4. Réinitialiser un mot de passe

### Étape 4 : Inscription et Workflow d'Approbation
1. Se déconnecter
2. Aller sur `/register`
3. Remplir le formulaire d'inscription
4. Se reconnecter en admin
5. Aller sur "Registrations"
6. Approuver la demande → Email envoyé
7. Montrer le nouvel utilisateur créé

### Étape 5 : Sécurité du Compte
1. Se connecter avec le nouvel utilisateur
2. Aller sur "Account Security"
3. **Activer 2FA** :
   - Scanner le QR code avec Google Authenticator
   - Entrer le code de vérification
4. Se déconnecter et reconnecter → Montrer le 2FA en action

### Étape 6 : Audit Logs
1. Revenir en admin
2. Aller sur "Audit Logs"
3. Montrer les différentes actions enregistrées
4. Filtrer par utilisateur/action

---

# 5. Points Techniques à Mettre en Avant

## 5.1 Bonnes Pratiques Implémentées

### Sécurité
| Pratique | Implémentation |
|----------|----------------|
| **Hashage des mots de passe** | BCrypt avec salt |
| **Protection CSRF** | Tokens JWT stateless |
| **CORS configuré** | Origins autorisés uniquement |
| **Validation des entrées** | Bean Validation (Jakarta) |
| **Gestion des erreurs** | Exception Handler global |

### Architecture
| Pratique | Implémentation |
|----------|----------------|
| **Séparation des couches** | Controller → Service → Repository |
| **DTO Pattern** | Isolation des entités |
| **Dependency Injection** | Constructor injection |
| **Transactions** | @Transactional sur les services |

### Code Quality
| Pratique | Outil/Méthode |
|----------|---------------|
| **Lombok** | Réduction du boilerplate |
| **Logging** | SLF4J avec niveaux appropriés |
| **Documentation API** | Swagger/OpenAPI |

## 5.2 Choix Techniques Justifiés

### Pourquoi Spring Boot 3.5 ?
- Support LTS de Java 17
- Sécurité intégrée avec Spring Security 6
- Écosystème riche et mature
- Performance optimisée avec Virtual Threads

### Pourquoi React 18 + Vite ?
- Hot Module Replacement rapide
- Build optimisé pour la production
- Composants fonctionnels modernes
- Hooks pour la gestion d'état

### Pourquoi PostgreSQL ?
- ACID compliant
- Excellent support JSON
- Scalabilité horizontale
- Open source et gratuit

### Pourquoi JWT + Refresh Token ?
- Stateless = Scalable
- Pas de session serveur à maintenir
- Refresh token = UX améliorée
- Révocation possible via blacklist

---

# 6. Améliorations Futures

## 6.1 Fonctionnalités Planifiées

| Priorité | Fonctionnalité | Description |
|----------|----------------|-------------|
| 🔴 Haute | **SSO/SAML** | Intégration avec Active Directory |
| 🔴 Haute | **OAuth2 Provider** | Permettre "Login with SecureAuth+" |
| 🟡 Moyenne | **Notifications Push** | Alertes en temps réel |
| 🟡 Moyenne | **Dashboard Analytics** | Graphiques et métriques avancées |
| 🟢 Basse | **Mobile App** | Application React Native |
| 🟢 Basse | **Biométrie** | Fingerprint/FaceID |

## 6.2 Améliorations Techniques

- [ ] Tests unitaires et d'intégration (JUnit, Jest)
- [ ] CI/CD avec GitHub Actions
- [ ] Containerisation Docker
- [ ] Déploiement Kubernetes
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Cache Redis pour les sessions

---

# 7. Conclusion

## 7.1 Résumé des Réalisations

SecureAuth+ est une solution IAM complète qui offre :

✅ **Authentification sécurisée** avec 2FA  
✅ **Gestion complète des utilisateurs** avec workflow d'approbation  
✅ **Contrôle d'accès basé sur les rôles** (RBAC)  
✅ **Traçabilité complète** via les audit logs  
✅ **Interface utilisateur moderne** et responsive  
✅ **Architecture scalable** et maintenable  

## 7.2 Valeur Ajoutée

> "SecureAuth+ n'est pas qu'un simple système de login. C'est une plateforme IAM enterprise-ready qui centralise la gestion des identités, renforce la sécurité et offre une visibilité complète sur les accès."

## 7.3 Phrase de Clôture

> "Avec SecureAuth+, nous apportons une réponse concrète aux enjeux de cybersécurité actuels, en combinant les meilleures pratiques de l'industrie avec une expérience utilisateur optimale."

---

# 8. Questions / Réponses Anticipées

## Q: Comment le système gère-t-il les tentatives de brute force ?
**R:** Le système verrouille automatiquement un compte après 3 tentatives échouées pendant 15 minutes. Chaque tentative est enregistrée dans les audit logs avec l'adresse IP.

## Q: Le système est-il scalable ?
**R:** Oui, grâce à l'architecture stateless avec JWT. On peut déployer plusieurs instances du backend derrière un load balancer sans problème de session.

## Q: Comment fonctionne la 2FA ?
**R:** Nous utilisons TOTP (Time-based One-Time Password) compatible avec Google Authenticator. Un secret est généré côté serveur et partagé via QR code. Le code change toutes les 30 secondes.

## Q: Les mots de passe sont-ils stockés en clair ?
**R:** Non, jamais. Nous utilisons BCrypt avec un facteur de coût de 10, ce qui rend le hashage irréversible et résistant aux attaques par dictionnaire.

## Q: Comment gérez-vous l'expiration des tokens ?
**R:** L'access token expire après 1 heure. Le refresh token (24h) permet d'obtenir un nouveau access token sans re-authentification. À l'expiration du refresh token, l'utilisateur doit se reconnecter.

---

# 📚 Annexes

## A. Endpoints API Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | Authentification |
| POST | `/api/v1/auth/logout` | Déconnexion |
| POST | `/api/v1/auth/refresh` | Rafraîchir le token |
| GET | `/api/v1/users` | Liste des utilisateurs |
| POST | `/api/v1/users` | Créer un utilisateur |
| GET | `/api/v1/users/me` | Profil utilisateur courant |
| POST | `/api/v1/account/2fa/enable` | Activer 2FA |
| GET | `/api/v1/audit` | Logs d'audit |
| POST | `/api/v1/registration` | Soumettre une inscription |

## B. Variables d'Environnement

```yaml
# Base de données
spring.datasource.url: jdbc:postgresql://localhost:5432/secureauth
spring.datasource.username: postgres
spring.datasource.password: postgres

# JWT
jwt.secret: [clé secrète 256 bits]
jwt.expiration: 3600000  # 1 heure

# Email
spring.mail.host: smtp.gmail.com
spring.mail.username: [email]
spring.mail.password: [app password]
```

## C. Comptes de Test

| Username | Password | Rôle |
|----------|----------|------|
| admin | Admin@123 | ADMIN |
| manager | Manager@123 | MANAGER |
| user | User@123 | USER |

---

**Document rédigé pour la présentation du projet SecureAuth+**  
*Version 1.0 - Décembre 2025*
