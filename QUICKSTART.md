# Guide de Démarrage Rapide - SecureAuth+

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Java 17+** : `java -version`
- **Maven 3.8+** : `mvn -version`
- **Node.js 18+** : `node -version`
- **PostgreSQL 14+** : Service démarré

## Étape 1 : Configuration PostgreSQL

1. Démarrez PostgreSQL
2. Créez la base de données :

```sql
CREATE DATABASE secureauth;
```

3. Vérifiez les credentials dans `backend/src/main/resources/application.yml` :
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/secureauth
    username: postgres
    password: postgres
```

## Étape 2 : Installation Automatique

### Windows PowerShell

```powershell
cd "C:\Users\AZZAM\OneDrive\Bureau\SecurAuth+"
.\setup.ps1
```

### Ou Installation Manuelle

#### Backend
```bash
cd backend
mvn clean install
```

#### Frontend
```bash
cd frontend
npm install
```

## Étape 3 : Démarrage

### Terminal 1 - Backend

```bash
cd backend
mvn spring-boot:run
```

Attendez le message : `Started SecureAuthApplication in X seconds`

Le backend démarre sur **http://localhost:8080**

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

## Étape 4 : Accéder à l'Application

1. Ouvrez votre navigateur : **http://localhost:5173**

2. Connectez-vous avec le compte admin par défaut :
   - **Username** : `admin`
   - **Password** : `Admin@123`

3. Explorez les fonctionnalités :
   - Dashboard
   - Gestion des utilisateurs
   - Gestion des rôles
   - Logs d'audit
   - Demandes d'inscription

## Étape 5 : Documentation API

Accédez à la documentation Swagger :

**http://localhost:8080/swagger-ui.html**

## Vérifications

### Backend en cours d'exécution ?
```bash
curl http://localhost:8080/api-docs
```

### Frontend accessible ?
Ouvrez http://localhost:5173 dans votre navigateur

### Base de données connectée ?
Vérifiez les logs du backend pour :
```
HikariPool-1 - Start completed.
```

## Problèmes Courants

### Port 8080 déjà utilisé
Modifiez dans `application.yml` :
```yaml
server:
  port: 8081
```

Puis mettez à jour `frontend/src/services/api.js` :
```javascript
const API_BASE_URL = 'http://localhost:8081/api/v1';
```

### Erreur de connexion PostgreSQL
Vérifiez que :
- PostgreSQL est démarré
- La base `secureauth` existe
- Les credentials sont corrects dans `application.yml`

### Frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Prochaines Étapes

1. **Changez le mot de passe admin** (recommandé)
2. **Créez des utilisateurs de test**
3. **Explorez les rôles et permissions**
4. **Consultez les logs d'audit**
5. **Testez les demandes d'inscription**

## Arrêt de l'Application

- **Backend** : `Ctrl + C` dans le terminal du backend
- **Frontend** : `Ctrl + C` dans le terminal du frontend

## Support

Consultez la documentation complète :
- `/README.md` - Vue d'ensemble
- `/backend/README.md` - Backend
- `/frontend/README.md` - Frontend
- Swagger UI : http://localhost:8080/swagger-ui.html

---

**Bon développement avec SecureAuth+ !** 🚀
