import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import '../styles/cybersec-theme.css';

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
  const [showPasswordSection, setShowPasswordSection] = useState(true);
  const [show2FASection, setShow2FASection] = useState(false);
  const [showSessionsSection, setShowSessionsSection] = useState(false);
  const [showApiKeysSection, setShowApiKeysSection] = useState(false);

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

  const getPasswordStrengthColor = (password) => {
    if (!password) return '#e9ecef';
    const strength = calculatePasswordStrength(password);
    if (strength < 30) return '#dc3545';
    if (strength < 60) return '#ffc107';
    return '#1ba94c';
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

  return (
    <div className="page-container">
      <div className="card-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 className="page-title">Account Security</h1>
          <p className="page-subtitle">Manage your password, 2FA, sessions, and API keys</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          onClick={() => { setShowPasswordSection(true); setShow2FASection(false); setShowSessionsSection(false); setShowApiKeysSection(false); }}
          className={`tab ${showPasswordSection ? 'active' : ''}`}
        >
          Password
        </button>
        <button 
          onClick={() => { setShowPasswordSection(false); setShow2FASection(true); setShowSessionsSection(false); setShowApiKeysSection(false); }}
          className={`tab ${show2FASection ? 'active' : ''}`}
        >
          Two-Factor Auth
        </button>
        <button 
          onClick={() => { setShowPasswordSection(false); setShow2FASection(false); setShowSessionsSection(true); setShowApiKeysSection(false); }}
          className={`tab ${showSessionsSection ? 'active' : ''}`}
        >
          Active Sessions
        </button>
        <button 
          onClick={() => { setShowPasswordSection(false); setShow2FASection(false); setShowSessionsSection(false); setShowApiKeysSection(true); }}
          className={`tab ${showApiKeysSection ? 'active' : ''}`}
        >
          API Keys
        </button>
      </div>

      {/* Password Section */}
      {showPasswordSection && (
        <div className="card">
          <h2 className="card-title">Change Password</h2>

          {passwordPolicy && (
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="text-sm" style={{ fontWeight: '600', marginBottom: 'var(--space-xs)' }}>Password Requirements:</div>
              <ul style={{ margin: '0', paddingLeft: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                <li>Minimum {passwordPolicy.minLength} characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&*etc.)</li>
                <li>Cannot reuse last {passwordPolicy.passwordHistoryCount} passwords</li>
              </ul>
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
              {passwordData.newPassword && (
                <div style={{ marginTop: 'var(--space-xs)' }}>
                  <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-xs)' }}>Password Strength</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${calculatePasswordStrength(passwordData.newPassword)}%`, 
                      background: getPasswordStrengthColor(passwordData.newPassword)
                    }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* 2FA Section */}
      {show2FASection && (
        <div className="card">
          <h2 className="card-title">Two-Factor Authentication</h2>

          <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
            Add an extra layer of security to your account by requiring a verification code from Google Authenticator.
          </p>

          {!twoFactorEnabled && !qrCode && (
            <div>
              <div className="alert alert-info" style={{ marginBottom: 'var(--space-md)' }}>
                <h3 className="text-sm" style={{ fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                  How it works:
                </h3>
                <ol style={{ margin: '0', paddingLeft: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                  <li>Download Google Authenticator app on your phone</li>
                  <li>Click "Enable 2FA" and scan the QR code</li>
                  <li>Enter the 6-digit code from the app</li>
                  <li>You'll need this code every time you log in</li>
                </ol>
              </div>
              <button 
                onClick={handleEnable2FA}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Enable 2FA'}
              </button>
            </div>
          )}

          {qrCode && (
            <div>
              <div className="alert alert-warning" style={{ marginBottom: 'var(--space-md)' }}>
                <p className="text-sm" style={{ margin: '0' }}>
                  <strong>Important:</strong> Open Google Authenticator and scan this QR code
                </p>
              </div>
              
              <div className="qr-code-container" style={{ 
                textAlign: 'center', 
                marginBottom: 'var(--space-md)', 
                padding: 'var(--space-lg)', 
                background: 'var(--dark-surface)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--dark-border)'
              }}>
                <img 
                  src={qrCode} 
                  alt="QR Code for Google Authenticator" 
                  style={{ 
                    maxWidth: '250px', 
                    border: '2px solid var(--cyber-green)', 
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-sm)',
                    background: 'white'
                  }} 
                />
                <p className="text-xs text-muted" style={{ marginTop: 'var(--space-sm)' }}>
                  Scan this with Google Authenticator app
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Enter Code from Google Authenticator
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength="6"
                  style={{ fontSize: '1.25rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                />
                <span className="form-help">
                  Enter the 6-digit code shown in Google Authenticator
                </span>
              </div>

              <button 
                onClick={handleVerify2FA}
                className="btn btn-primary"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
              </button>
            </div>
          )}

          {twoFactorEnabled && (
            <div>
              <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>
                Two-factor authentication is enabled and linked to Google Authenticator
              </div>
              <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                Your account is protected with Google Authenticator. You'll need to enter a code from the app each time you log in.
              </p>
              <button 
                onClick={handleDisable2FA}
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Disable 2FA'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sessions Section */}
      {showSessionsSection && (
        <div className="card">
          <h2 className="card-title">Active Sessions</h2>

          <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
            Manage your active sessions. You can sign out of any session you don't recognize.
          </p>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <p>No active sessions</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {sessions.map((session) => (
                <div key={session.id} className="session-card" style={{ 
                  padding: 'var(--space-md)', 
                  background: session.currentSession ? 'rgba(46, 200, 102, 0.05)' : 'var(--dark-surface)',
                  border: `1px solid ${session.currentSession ? 'var(--cyber-green)' : 'var(--dark-border)'}`, 
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="text-sm" style={{ fontWeight: '500', marginBottom: 'var(--space-xs)' }}>
                        {session.userAgent || 'Unknown Device'}
                        {session.currentSession && (
                          <span className="badge badge-success" style={{ marginLeft: 'var(--space-sm)' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted">
                        IP: {session.ipAddress}
                      </div>
                      <div className="text-xs text-muted">
                        Last active: {new Date(session.lastActivity).toLocaleString()}
                      </div>
                    </div>
                    {!session.currentSession && (
                      <button 
                        onClick={() => handleInvalidateSession(session.id)}
                        className="btn btn-sm btn-secondary"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API Keys Section */}
      {showApiKeysSection && (
        <div className="card">
          <h2 className="card-title">API Keys</h2>

          <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
            API keys allow applications to access your account programmatically. Keep them secure.
          </p>

          {newApiKey && (
            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="text-sm" style={{ fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                Your new API key (copy it now - it won't be shown again):
              </div>
              <div className="flex gap-1" style={{ alignItems: 'center' }}>
                <code className="code-block" style={{ 
                  flex: 1, 
                  wordBreak: 'break-all'
                }}>
                  {newApiKey}
                </code>
                <button 
                  onClick={() => copyToClipboard(newApiKey)}
                  className="btn btn-sm btn-secondary"
                >
                  Copy
                </button>
              </div>
              <button 
                onClick={() => setNewApiKey(null)}
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 'var(--space-xs)' }}
              >
                Close
              </button>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 className="text-md" style={{ fontWeight: '600', marginBottom: 'var(--space-md)' }}>
              Create New API Key
            </h3>
            <form onSubmit={handleCreateApiKey}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={apiKeyForm.name}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                  required
                  placeholder="e.g., Production Server"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={apiKeyForm.description}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
                  placeholder="e.g., API key for production deployment"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiration (days)</label>
                <select
                  className="form-select"
                  value={apiKeyForm.expirationDays}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, expirationDays: parseInt(e.target.value) })}
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="0">Never expires</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create API Key'}
              </button>
            </form>
          </div>

          <h3 className="text-md" style={{ fontWeight: '600', marginBottom: 'var(--space-md)' }}>
            Your API Keys
          </h3>

          {apiKeys.length === 0 ? (
            <div className="empty-state">
              <p>No API keys created yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="session-card" style={{ 
                  padding: 'var(--space-md)', 
                  background: apiKey.active ? 'var(--dark-surface)' : 'rgba(150, 150, 150, 0.05)',
                  border: `1px solid ${apiKey.active ? 'var(--dark-border)' : 'var(--text-muted)'}`, 
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div className="text-sm" style={{ fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                        {apiKey.name}
                        {!apiKey.active && (
                          <span className="badge badge-danger" style={{ marginLeft: 'var(--space-sm)' }}>
                            Revoked
                          </span>
                        )}
                      </div>
                      {apiKey.description && (
                        <div className="text-xs text-muted" style={{ marginBottom: 'var(--space-xs)' }}>
                          {apiKey.description}
                        </div>
                      )}
                      <div className="text-xs text-muted">
                        <code className="code-inline">
                          {apiKey.keyPrefix}***
                        </code>
                      </div>
                      <div className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.expiresAt && ` • Expires: ${new Date(apiKey.expiresAt).toLocaleDateString()}`}
                        {apiKey.lastUsedAt && ` • Last used: ${new Date(apiKey.lastUsedAt).toLocaleString()}`}
                      </div>
                    </div>
                    {apiKey.active && (
                      <button 
                        onClick={() => handleRevokeApiKey(apiKey.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountSecurity;
