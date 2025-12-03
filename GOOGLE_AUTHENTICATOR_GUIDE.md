# Guide Google Authenticator - SecureAuth+

## 📱 Configuration de l'authentification à deux facteurs (2FA)

### Étape 1: Télécharger Google Authenticator

**Sur Android:**
- Ouvrir Google Play Store
- Rechercher "Google Authenticator"
- Installer l'application Google Authenticator

**Sur iOS:**
- Ouvrir App Store
- Rechercher "Google Authenticator"
- Installer l'application Google Authenticator

### Étape 2: Activer 2FA dans SecureAuth+

1. **Connectez-vous** à votre compte SecureAuth+
2. Allez dans **Account Security** (menu de navigation)
3. Cliquez sur l'onglet **2FA/MFA**
4. Cliquez sur le bouton **"Enable 2FA"**
5. Entrez votre mot de passe lorsque demandé

### Étape 3: Scanner le QR Code

1. Un **QR Code** apparaîtra sur votre écran
2. Ouvrez l'application **Google Authenticator** sur votre téléphone
3. Appuyez sur le bouton **"+"** (en bas à droite)
4. Sélectionnez **"Scanner un code QR"**
5. Pointez votre caméra vers le QR code affiché sur l'écran

### Étape 4: Vérifier le code

1. Google Authenticator affichera un **code à 6 chiffres**
2. Ce code change **toutes les 30 secondes**
3. Entrez le code dans le champ **"Enter Code from Google Authenticator"**
4. Cliquez sur **"Verify and Enable 2FA"**

### Étape 5: Connexion avec 2FA

À partir de maintenant, lors de chaque connexion:

1. Entrez votre **username** et **password** normalement
2. Ouvrez **Google Authenticator** sur votre téléphone
3. Trouvez le code pour **SecureAuth+**
4. Entrez le **code à 6 chiffres** dans le champ de vérification
5. Cliquez sur **Login**

## 🔒 Sécurité et Bonnes Pratiques

### ✅ À FAIRE:
- **Sauvegarder votre secret** lors de la configuration (si affiché)
- Garder votre **téléphone sécurisé** avec un code PIN/empreinte
- Utiliser Google Authenticator **uniquement sur votre téléphone personnel**
- Vérifier que l'heure de votre téléphone est **synchronisée automatiquement**

### ❌ À NE PAS FAIRE:
- Ne **jamais partager** votre code à 6 chiffres
- Ne pas scanner le QR code sur **plusieurs appareils** en même temps
- Ne pas désinstaller Google Authenticator **sans désactiver 2FA d'abord**

## 🛠️ Dépannage

### Le code ne fonctionne pas
1. Vérifiez que **l'heure** de votre téléphone est correcte
2. Attendez que le code **se renouvelle** (cercle complet)
3. Assurez-vous d'entrer le code pour **SecureAuth+** (pas un autre service)

### J'ai perdu mon téléphone
Contactez l'administrateur système avec:
- Votre **nom d'utilisateur**
- Une **preuve d'identité**
- L'administrateur pourra **désactiver 2FA** pour votre compte

### Je veux changer de téléphone
1. **Désactivez 2FA** dans Account Security (avec votre ancien téléphone)
2. **Réactivez 2FA** et scannez le nouveau QR code avec votre nouveau téléphone

## 📊 Avantages de 2FA

- ✅ **Sécurité renforcée**: Même si quelqu'un vole votre mot de passe, il ne peut pas se connecter sans votre téléphone
- ✅ **Standard industriel**: Utilisé par Google, Facebook, Amazon, et toutes les grandes entreprises
- ✅ **Facile à utiliser**: Une fois configuré, il suffit de 5 secondes pour s'authentifier
- ✅ **Fonctionne hors ligne**: Google Authenticator ne nécessite pas de connexion Internet

## 🔐 Informations Techniques

- **Algorithme**: TOTP (Time-based One-Time Password)
- **Standard**: RFC 6238
- **Longueur du code**: 6 chiffres
- **Durée de validité**: 30 secondes
- **Algorithme de hachage**: SHA-1
- **Compatible avec**: Google Authenticator, Authy, Microsoft Authenticator, etc.

---

**Besoin d'aide?** Contactez votre administrateur système ou consultez la documentation complète de SecureAuth+.
