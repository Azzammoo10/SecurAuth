import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import lightLogo from '../images/light_theme.png';
import darkLogo from '../images/dark_theme.png';

function ForceChangePassword() {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordPolicy, setPasswordPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Détecter le thème actuel
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Charger la politique de mot de passe
    loadPasswordPolicy();
  }, []);

  const loadPasswordPolicy = async () => {
    try {
      const response = await authAPI.get('/account/password-policy');
      setPasswordPolicy(response.data.data);
    } catch (err) {
      console.error('Failed to load password policy:', err);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
    return strength;
  };

  const getPasswordStrengthColor = (password) => {
    if (!password) return 'var(--dark-border)';
    const strength = calculatePasswordStrength(password);
    if (strength < 30) return 'var(--color-danger)';
    if (strength < 60) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getPasswordStrengthLabel = (password) => {
    const strength = calculatePasswordStrength(password);
    if (strength < 30) return { label: 'Faible', color: 'var(--color-danger)' };
    if (strength < 60) return { label: 'Moyen', color: 'var(--color-warning)' };
    if (strength < 80) return { label: 'Bon', color: 'var(--color-info)' };
    return { label: 'Excellent', color: 'var(--color-success)' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.post('/account/change-password', passwordData);
      setSuccess('Mot de passe changé avec succès ! Redirection...');
      
      // Mettre à jour l'utilisateur local
      const user = authService.getUser();
      if (user) {
        user.mustChangePassword = false;
        authService.setUser(user);
      }

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Échec du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <img 
            src={theme === 'dark' ? darkLogo : lightLogo} 
            alt="SecureAuth+" 
            className="login-logo"
          />
          <p className="login-subtitle">Changement de mot de passe requis</p>
        </div>

        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-lg)' }}>
          <span style={{ marginRight: 'var(--space-sm)' }}>⚠️</span>
          <div>
            <strong>Première connexion détectée</strong>
            <p style={{ margin: 0, marginTop: 'var(--space-xs)', opacity: 0.9 }}>
              Pour des raisons de sécurité, vous devez créer un nouveau mot de passe personnel.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {passwordPolicy && (
          <div style={{ 
            background: 'var(--dark-surface-alt)',
            border: '1px solid var(--dark-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-sm)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500
            }}>
              <span>📋</span>
              <span>Exigences du mot de passe</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 'var(--space-xs)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)'
            }}>
              <div>✓ Minimum {passwordPolicy.minLength} caractères</div>
              <div>✓ Au moins une majuscule</div>
              <div>✓ Au moins une minuscule</div>
              <div>✓ Au moins un chiffre</div>
              <div>✓ Au moins un caractère spécial</div>
              <div>✓ Différent des {passwordPolicy.passwordHistoryCount} derniers</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mot de passe temporaire</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              placeholder="Entrez le mot de passe reçu par email"
              required
              autoFocus
            />
            <span style={{ 
              fontSize: 'var(--font-size-xs)', 
              color: 'var(--text-muted)',
              marginTop: 'var(--space-xs)',
              display: 'block'
            }}>
              Utilisez le mot de passe temporaire envoyé à votre email
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Créez votre nouveau mot de passe"
              required
            />
            {passwordData.newPassword && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-sm)' 
                }}>
                  <div style={{ 
                    flex: 1, 
                    height: '4px', 
                    background: 'var(--dark-border)', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${calculatePasswordStrength(passwordData.newPassword)}%`,
                      height: '100%',
                      backgroundColor: getPasswordStrengthColor(passwordData.newPassword),
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: 'var(--font-size-xs)',
                    color: getPasswordStrengthColor(passwordData.newPassword),
                    fontWeight: 500
                  }}>
                    {getPasswordStrengthLabel(passwordData.newPassword).label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirmez votre nouveau mot de passe"
              required
            />
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <span style={{ 
                color: 'var(--color-danger)', 
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--space-xs)',
                display: 'block'
              }}>
                Les mots de passe ne correspondent pas
              </span>
            )}
            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
              <span style={{ 
                color: 'var(--color-success)', 
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--space-xs)',
                display: 'block'
              }}>
                ✓ Les mots de passe correspondent
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.oldPassword}
            style={{ marginTop: 'var(--space-lg)' }}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Mise à jour...
              </>
            ) : (
              '🔐 Créer mon nouveau mot de passe'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-md)',
          background: 'var(--dark-surface-alt)',
          border: '1px solid var(--dark-border)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xs)'
          }}>
            <span>🛡️</span>
            <span>Votre sécurité est notre priorité</span>
          </div>
        </div>

        {/* Option pour ignorer */}
        <div style={{ 
          marginTop: 'var(--space-lg)',
          textAlign: 'center'
        }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost"
            style={{ color: 'var(--text-muted)' }}
          >
            Ignorer pour l'instant →
          </button>
          <p style={{ 
            marginTop: 'var(--space-sm)',
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--text-muted)'
          }}>
            Vous pourrez changer votre mot de passe plus tard dans les paramètres de sécurité
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForceChangePassword;
