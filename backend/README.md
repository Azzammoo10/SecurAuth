# SecureAuth+ Backend

## Description
Plateforme IAM (Identity and Access Management) centralisée et sécurisée basée sur Spring Boot 3.5 et JWT.

## Technologies
- Spring Boot 3.5.0
- Java 17
- PostgreSQL
- Spring Security + JWT
- Spring Data JPA
- OpenAPI/Swagger
- Lombok

## Prérequis
- JDK 17+
- Maven 3.8+
- PostgreSQL 14+

## Configuration de la base de données

Créez une base de données PostgreSQL :

```sql
CREATE DATABASE secureauth;
```

Modifiez les paramètres de connexion dans `src/main/resources/application.yml` si nécessaire.

## Démarrage

1. Installez les dépendances :
```bash
mvn clean install
```

2. Lancez l'application :
```bash
mvn spring-boot:run
```

L'application démarre sur http://localhost:8080

## Documentation API

Swagger UI : http://localhost:8080/swagger-ui.html
API Docs : http://localhost:8080/api-docs

## Compte administrateur par défaut

- **Username**: admin
- **Password**: Admin@123

**⚠️ Important**: Changez le mot de passe admin en production !

## Endpoints principaux

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Rafraîchir le token
- `POST /api/v1/auth/logout` - Déconnexion

### Utilisateurs (ADMIN/MANAGER)
- `GET /api/v1/users` - Liste des utilisateurs
- `POST /api/v1/users` - Créer un utilisateur
- `PUT /api/v1/users/{id}` - Mettre à jour
- `DELETE /api/v1/users/{id}` - Supprimer
- `PATCH /api/v1/users/{id}/unlock` - Déverrouiller

### Rôles (ADMIN)
- `GET /api/v1/roles` - Liste des rôles
- `POST /api/v1/roles` - Créer un rôle
- `PUT /api/v1/roles/{id}` - Mettre à jour
- `DELETE /api/v1/roles/{id}` - Supprimer

### Audit (ADMIN/SECURITY)
- `GET /api/v1/audit` - Liste des logs
- `GET /api/v1/audit/search` - Recherche filtrée
- `GET /api/v1/audit/user/{username}` - Logs d'un utilisateur

### Inscriptions
- `POST /api/v1/registration/submit` - Soumettre une demande
- `GET /api/v1/registration/pending` - Demandes en attente (ADMIN)
- `POST /api/v1/registration/{id}/approve` - Approuver (ADMIN)
- `POST /api/v1/registration/{id}/reject` - Rejeter (ADMIN)

## Fonctionnalités de sécurité

✅ Authentification JWT avec Refresh Token
✅ Blocage automatique après 3 tentatives échouées
✅ Déblocage manuel par admin
✅ Audit complet des actions
✅ Validation forte des données
✅ Gestion granulaire des permissions
✅ CORS configuré pour le frontend

## Structure du projet

```
backend/
├── src/main/java/com/secureauth/
│   ├── config/           # Configuration Spring Security, JWT, CORS
│   ├── controllers/      # REST Controllers
│   ├── services/         # Logique métier
│   ├── repositories/     # Accès données
│   ├── entities/         # Entités JPA
│   ├── dto/              # Data Transfer Objects
│   └── exceptions/       # Gestion des erreurs
├── src/main/resources/
│   └── application.yml   # Configuration
└── pom.xml
```

## Licence

Apache 2.0
