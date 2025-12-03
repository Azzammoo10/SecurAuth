import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function AccountSecurity() {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sessions, setSessions] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKey, setNewApiKey] = useState(null);
  const [apiKeyForm, setApiKeyForm] = useState({
    name: '',
    description: '',
    expirationDays: 90
  });
  const [passwordPolicy, setPasswordPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('password');

  useEffect(() => {
    loadPasswordPolicy();
    loadSessions();
    loadApiKeys();
  }, []);

  const loadPasswordPolicy = async () => {
    try {
      const response = await authAPI.get('/account/password-policy');
      setPasswordPolicy(response.data.data);
    } catch (err) {
      console.error('Failed to load password policy:', err);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await authAPI.get('/account/sessions');
      setSessions(response.data.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadApiKeys = async () => {
    try {
      const response = await authAPI.get('/account/api-keys');
      setApiKeys(response.data.data);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.post('/account/change-password', passwordData);
      setSuccess(response.data.message || 'Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const password = prompt('Enter your password to enable 2FA:');
      if (!password) return;

      const response = await authAPI.post('/account/2fa/enable', { password });
      setQrCode(response.data.data.qrCodeUrl);
      setSuccess(response.data.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.post('/account/2fa/verify', { 
        code: verificationCode
      });
      setSuccess('2FA enabled successfully! You can now use Google Authenticator to log in.');
      setTwoFactorEnabled(true);
      setQrCode('');
      setVerificationCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please check your Google Authenticator app.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const password = prompt('Enter your password to disable 2FA:');
      if (!password) return;

      await authAPI.post('/account/2fa/disable', { password });
      setSuccess('2FA disabled successfully');
      setTwoFactorEnabled(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidateSession = async (sessionId) => {
    try {
      await authAPI.delete(`/account/sessions/${sessionId}`);
      setSuccess('Session invalidated');
      loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invalidate session');
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.post('/account/api-keys', apiKeyForm);
      setNewApiKey(response.data.data.fullKey);
      setSuccess('API key created successfully! Copy it now - it won\'t be shown again.');
      setApiKeyForm({ name: '', description: '', expirationDays: 90 });
      loadApiKeys();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeApiKey = async (apiKeyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      await authAPI.delete(`/account/api-keys/${apiKeyId}`);
      setSuccess('API key revoked');
      loadApiKeys();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const getPasswordStrengthLabel = (password) => {
    const strength = calculatePasswordStrength(password);
    if (strength < 30) return { label: 'Faible', color: 'var(--color-danger)' };
    if (strength < 60) return { label: 'Moyen', color: 'var(--color-warning)' };
    if (strength < 80) return { label: 'Bon', color: 'var(--color-info)' };
    return { label: 'Excellent', color: 'var(--color-success)' };
  };

  const getPasswordStrengthColor = (password) => {
    if (!password) return 'var(--border-light)';
    const strength = calculatePasswordStrength(password);
    if (strength < 30) return 'var(--color-danger)';
    if (strength < 60) return 'var(--color-warning)';
    return 'var(--color-success)';
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

  const tabs = [
    { id: 'password', label: 'Mot de passe', icon: '🔐' },
    { id: '2fa', label: 'Authentification 2FA', icon: '📱' },
    { id: 'sessions', label: 'Sessions', icon: '💻', count: sessions.length },
    { id: 'apikeys', label: 'Clés API', icon: '🔑', count: apiKeys.length }
  ];

  return (
    <div className="page-container">
      {/* Header avec icône de sécurité */}
      <div className="page-header-box">
        <div className="page-header-icon security">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Sécurité du compte</h1>
          <p className="page-subtitle">Gérez vos paramètres de sécurité et protégez votre compte</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error animate-fadeIn">
          <span className="alert-icon">⚠️</span>
          {error}
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success animate-fadeIn">
          <span className="alert-icon">✓</span>
          {success}
          <button className="alert-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Navigation par onglets améliorée */}
      <div className="security-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`security-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="security-tab-icon">{tab.icon}</span>
            <span className="security-tab-label">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="security-tab-badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="security-content">
        
        {/* Section Mot de passe */}
        {activeTab === 'password' && (
          <div className="security-section animate-fadeIn">
            <div className="security-card">
              <div className="security-card-header">
                <div className="security-card-icon password">🔐</div>
                <div>
                  <h2 className="security-card-title">Changer le mot de passe</h2>
                  <p className="security-card-desc">Mettez à jour votre mot de passe régulièrement pour sécuriser votre compte</p>
                </div>
              </div>

              {passwordPolicy && (
                <div className="policy-box">
                  <div className="policy-header">
                    <span className="policy-icon">📋</span>
                    <span className="policy-title">Exigences du mot de passe</span>
                  </div>
                  <div className="policy-grid">
                    <div className="policy-item">
                      <span className="policy-check">✓</span>
                      <span>Minimum {passwordPolicy.minLength} caractères</span>
                    </div>
                    <div className="policy-item">
                      <span className="policy-check">✓</span>
                      <span>Au moins une majuscule</span>
                    </div>
                    <div className="policy-item">
                      <span className="policy-check">✓</span>
                      <span>Au moins une minuscule</span>
                    </div>
                    <div className="policy-item">
                      <span className="policy-check">✓</span>
                      <span>Au moins un chiffre</span>
                    </div>
                    <div className="policy-item">
                      <span className="policy-check">✓</span>
                      <span>Au moins un caractère spécial</span>
                    </div>
                    <div className="policy-item">
                      <span className="policy-check">✓</span>
                      <span>Différent des {passwordPolicy.passwordHistoryCount} derniers</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="security-form">
                <div className="form-group">
                  <label className="form-label">Mot de passe actuel</label>
                  <div className="input-with-icon">
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      placeholder="Entrez votre mot de passe actuel"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Entrez un nouveau mot de passe"
                    required
                  />
                  {passwordData.newPassword && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div 
                          className="password-strength-fill"
                          style={{ 
                            width: `${calculatePasswordStrength(passwordData.newPassword)}%`,
                            backgroundColor: getPasswordStrengthColor(passwordData.newPassword)
                          }}
                        />
                      </div>
                      <span 
                        className="password-strength-label"
                        style={{ color: getPasswordStrengthColor(passwordData.newPassword) }}
                      >
                        {getPasswordStrengthLabel(passwordData.newPassword).label}
                      </span>
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
                    placeholder="Confirmez le nouveau mot de passe"
                    required
                  />
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <span className="form-error">Les mots de passe ne correspondent pas</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour le mot de passe'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Section 2FA */}
        {activeTab === '2fa' && (
          <div className="security-section animate-fadeIn">
            <div className="security-card">
              <div className="security-card-header">
                <div className="security-card-icon twofa">📱</div>
                <div>
                  <h2 className="security-card-title">Authentification à deux facteurs</h2>
                  <p className="security-card-desc">Ajoutez une couche de sécurité supplémentaire avec Google Authenticator</p>
                </div>
                <div className={`status-badge ${twoFactorEnabled ? 'active' : 'inactive'}`}>
                  {twoFactorEnabled ? '✓ Activé' : '○ Désactivé'}
                </div>
              </div>

              {!twoFactorEnabled && !qrCode && (
                <div className="twofa-setup">
                  <div className="twofa-steps">
                    <div className="twofa-step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <h4>Téléchargez l'application</h4>
                        <p>Installez Google Authenticator sur votre téléphone</p>
                      </div>
                    </div>
                    <div className="twofa-step">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <h4>Scannez le QR code</h4>
                        <p>Cliquez sur "Activer" et scannez le code affiché</p>
                      </div>
                    </div>
                    <div className="twofa-step">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <h4>Vérifiez le code</h4>
                        <p>Entrez le code à 6 chiffres de l'application</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleEnable2FA}
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Traitement...' : 'Activer l\'authentification 2FA'}
                  </button>
                </div>
              )}

              {qrCode && (
                <div className="twofa-verify">
                  <div className="qr-container">
                    <div className="qr-wrapper">
                      <img src={qrCode} alt="QR Code" className="qr-image" />
                    </div>
                    <p className="qr-hint">Scannez ce code avec Google Authenticator</p>
                  </div>

                  <div className="verify-form">
                    <label className="form-label">Code de vérification</label>
                    <div className="code-input-wrapper">
                      <input
                        type="text"
                        className="code-input"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        maxLength="6"
                      />
                    </div>
                    <p className="form-help">Entrez le code à 6 chiffres affiché dans l'application</p>

                    <button 
                      onClick={handleVerify2FA}
                      className="btn btn-primary btn-lg"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? 'Vérification...' : 'Vérifier et activer'}
                    </button>
                  </div>
                </div>
              )}

              {twoFactorEnabled && (
                <div className="twofa-enabled">
                  <div className="enabled-message">
                    <span className="enabled-icon">🛡️</span>
                    <div>
                      <h4>Votre compte est protégé</h4>
                      <p>L'authentification à deux facteurs est active. Vous aurez besoin de votre téléphone pour vous connecter.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDisable2FA}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Traitement...' : 'Désactiver 2FA'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Sessions */}
        {activeTab === 'sessions' && (
          <div className="security-section animate-fadeIn">
            <div className="security-card">
              <div className="security-card-header">
                <div className="security-card-icon sessions">💻</div>
                <div>
                  <h2 className="security-card-title">Sessions actives</h2>
                  <p className="security-card-desc">Gérez vos appareils connectés et déconnectez les sessions suspectes</p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💻</div>
                  <h3>Aucune session active</h3>
                  <p>Il n'y a pas de sessions actives pour le moment</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`session-item ${session.currentSession ? 'current' : ''}`}
                    >
                      <div className="session-icon">
                        {session.userAgent?.includes('Mobile') ? '📱' : '💻'}
                      </div>
                      <div className="session-info">
                        <div className="session-device">
                          {session.userAgent || 'Appareil inconnu'}
                          {session.currentSession && (
                            <span className="current-badge">Session actuelle</span>
                          )}
                        </div>
                        <div className="session-details">
                          <span>📍 {session.ipAddress}</span>
                          <span>🕐 {new Date(session.lastActivity).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                      {!session.currentSession && (
                        <button 
                          onClick={() => handleInvalidateSession(session.id)}
                          className="btn btn-sm btn-secondary"
                        >
                          Déconnecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section API Keys */}
        {activeTab === 'apikeys' && (
          <div className="security-section animate-fadeIn">
            {/* Nouvelle clé API */}
            {newApiKey && (
              <div className="new-api-key-banner">
                <div className="banner-header">
                  <span className="banner-icon">🔑</span>
                  <span className="banner-title">Nouvelle clé API créée</span>
                </div>
                <div className="banner-content">
                  <p className="banner-warning">⚠️ Copiez cette clé maintenant. Elle ne sera plus affichée.</p>
                  <div className="key-display">
                    <code>{newApiKey}</code>
                    <button 
                      onClick={() => copyToClipboard(newApiKey)}
                      className="btn btn-sm btn-primary"
                    >
                      📋 Copier
                    </button>
                  </div>
                </div>
                <button onClick={() => setNewApiKey(null)} className="banner-close">×</button>
              </div>
            )}

            <div className="security-cards-grid">
              {/* Formulaire de création */}
              <div className="security-card">
                <div className="security-card-header compact">
                  <h3 className="security-card-title">Créer une clé API</h3>
                </div>
                
                <form onSubmit={handleCreateApiKey} className="security-form">
                  <div className="form-group">
                    <label className="form-label">Nom de la clé</label>
                    <input
                      type="text"
                      className="form-input"
                      value={apiKeyForm.name}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                      placeholder="Ex: Serveur de production"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description (optionnel)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={apiKeyForm.description}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
                      placeholder="Ex: Clé pour le déploiement CI/CD"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiration</label>
                    <select
                      className="form-select"
                      value={apiKeyForm.expirationDays}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, expirationDays: parseInt(e.target.value) })}
                    >
                      <option value="30">30 jours</option>
                      <option value="90">90 jours</option>
                      <option value="180">180 jours</option>
                      <option value="365">1 an</option>
                      <option value="0">Jamais</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : '+ Créer la clé'}
                  </button>
                </form>
              </div>

              {/* Liste des clés */}
              <div className="security-card">
                <div className="security-card-header compact">
                  <h3 className="security-card-title">Vos clés API</h3>
                  <span className="keys-count">{apiKeys.length} clé(s)</span>
                </div>

                {apiKeys.length === 0 ? (
                  <div className="empty-state compact">
                    <div className="empty-icon">🔑</div>
                    <p>Aucune clé API créée</p>
                  </div>
                ) : (
                  <div className="api-keys-list">
                    {apiKeys.map((apiKey) => (
                      <div 
                        key={apiKey.id} 
                        className={`api-key-item ${!apiKey.active ? 'revoked' : ''}`}
                      >
                        <div className="api-key-info">
                          <div className="api-key-name">
                            {apiKey.name}
                            {!apiKey.active && <span className="revoked-badge">Révoquée</span>}
                          </div>
                          {apiKey.description && (
                            <div className="api-key-desc">{apiKey.description}</div>
                          )}
                          <div className="api-key-meta">
                            <code className="api-key-prefix">{apiKey.keyPrefix}•••</code>
                            <span className="api-key-dates">
                              Créée le {new Date(apiKey.createdAt).toLocaleDateString('fr-FR')}
                              {apiKey.expiresAt && ` • Expire le ${new Date(apiKey.expiresAt).toLocaleDateString('fr-FR')}`}
                            </span>
                          </div>
                        </div>
                        {apiKey.active && (
                          <button 
                            onClick={() => handleRevokeApiKey(apiKey.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Révoquer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountSecurity;
