# Installation Manuelle - SecureAuth+

## Problème rencontré
Maven n'est pas installé sur votre système Windows.

## Solutions

### Solution 1 : Installation automatique (RECOMMANDÉ)

1. **Fermez ce PowerShell**
2. **Ouvrez PowerShell en tant qu'Administrateur** :
   - Clic droit sur le menu Démarrer → "Terminal (Admin)" ou "Windows PowerShell (Admin)"
3. Naviguez vers le projet :
   ```powershell
   cd "C:\Users\AZZAM\OneDrive\Bureau\SecurAuth+"
   ```
4. Exécutez le script d'installation :
   ```powershell
   .\setup.ps1
   ```

Le script installera automatiquement Maven et PostgreSQL via Chocolatey.

---

### Solution 2 : Installation manuelle de Maven

#### Étape 1 : Télécharger Maven
1. Allez sur : https://maven.apache.org/download.cgi
2. Téléchargez **Binary zip archive** (ex: apache-maven-3.9.9-bin.zip)

#### Étape 2 : Extraire Maven
1. Extraire le ZIP dans `C:\Program Files\Apache\maven`
2. Vous devriez avoir : `C:\Program Files\Apache\maven\bin\mvn.cmd`

#### Étape 3 : Configurer la variable PATH
1. Ouvrir "Modifier les variables d'environnement système"
2. Cliquer sur "Variables d'environnement"
3. Dans "Variables système", double-cliquer sur "Path"
4. Cliquer "Nouveau" et ajouter :
   ```
   C:\Program Files\Apache\maven\bin
   ```
5. Cliquer OK sur toutes les fenêtres

#### Étape 4 : Vérifier l'installation
1. **Fermez et rouvrez PowerShell**
2. Testez :
   ```powershell
   mvn --version
   ```

#### Étape 5 : PostgreSQL
1. Téléchargez depuis : https://www.postgresql.org/download/windows/
2. Installez avec les paramètres par défaut
3. Notez le mot de passe que vous définissez pour l'utilisateur "postgres"

#### Étape 6 : Créer la base de données
```sql
-- Connectez-vous à PostgreSQL (pgAdmin ou psql)
CREATE DATABASE secureauth;
```

#### Étape 7 : Configurer le mot de passe
Éditez `backend/src/main/resources/application.yml` :
```yaml
spring:
  datasource:
    username: postgres
    password: VOTRE_MOT_DE_PASSE_ICI
```

---

### Solution 3 : Utiliser Chocolatey (si déjà installé)

Si vous avez déjà Chocolatey, ouvrez PowerShell **en Administrateur** :

```powershell
# Installer Maven
choco install maven -y

# Installer PostgreSQL
choco install postgresql -y

# Rafraîchir PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")

# Vérifier
mvn --version
psql --version
```

---

## Après l'installation de Maven et PostgreSQL

### 1. Compiler le Backend
```powershell
cd backend
mvn clean install -DskipTests
```

### 2. Installer les dépendances Frontend
```powershell
cd ..\frontend
npm install
```

### 3. Démarrer l'application

**Terminal 1 - Backend :**
```powershell
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend :**
```powershell
cd frontend
npm run dev
```

### 4. Accéder à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8080
- **Swagger UI** : http://localhost:8080/swagger-ui.html

**Compte admin par défaut :**
- Username: `admin`
- Password: `Admin@123`

---

## Problèmes courants

### "mvn n'est pas reconnu"
→ Maven n'est pas dans le PATH. Redémarrez PowerShell après l'installation.

### "psql n'est pas reconnu"
→ PostgreSQL n'est pas installé ou pas dans le PATH.

### Erreur de connexion à la base de données
→ Vérifiez que PostgreSQL est démarré et que le mot de passe est correct dans `application.yml`.

### Port 8080 déjà utilisé
→ Un autre processus utilise le port. Trouvez-le avec :
```powershell
netstat -ano | findstr :8080
```
Puis tuez-le avec `taskkill /PID <PID> /F`

---

## Support

Pour plus d'aide, consultez :
- Documentation Maven : https://maven.apache.org/guides/
- Documentation PostgreSQL : https://www.postgresql.org/docs/
- README.md du projet
