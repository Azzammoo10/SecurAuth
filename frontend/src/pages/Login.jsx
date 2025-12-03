import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [twoFactorData, setTwoFactorData] = useState({
    tempToken: '',
    code: '',
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleTwoFactorChange = (e) => {
    setTwoFactorData({
      ...twoFactorData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const responseData = response.data.data;

      // Si la 2FA est requise, afficher le formulaire 2FA
      if (responseData.requires2FA) {
        setTwoFactorData({
          tempToken: responseData.tempToken,
          code: '',
        });
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      // Sinon, connexion normale
      const { accessToken, refreshToken, user } = responseData;
      authService.setTokens(accessToken, refreshToken);
      authService.setUser(user);
      localStorage.setItem('username', formData.username);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Erreur de connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.post('/auth/verify-2fa', twoFactorData);
      const { accessToken, refreshToken, user } = response.data.data;

      authService.setTokens(accessToken, refreshToken);
      authService.setUser(user);
      localStorage.setItem('username', formData.username);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Code 2FA invalide. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">SecureAuth+</h1>
          <p className="login-subtitle">
            {showTwoFactor ? 'Two-Factor Authentication' : 'Secure Access Portal'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!showTwoFactor ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTwoFactorSubmit}>
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                Verification Required
              </div>
              Open your authenticator app and enter the 6-digit code
            </div>

            <div className="form-group">
              <label className="form-label">Authentication Code</label>
              <input
                type="text"
                name="code"
                className="form-input font-mono"
                value={twoFactorData.code}
                onChange={handleTwoFactorChange}
                required
                autoFocus
                placeholder="000000"
                maxLength="6"
                pattern="[0-9]{6}"
                style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  textAlign: 'center', 
                  letterSpacing: '0.5rem'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || twoFactorData.code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowTwoFactor(false);
                setTwoFactorData({ tempToken: '', code: '' });
                setError('');
              }}
              className="btn btn-secondary btn-lg w-full mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        <div style={{ 
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--dark-border)',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Don't have an account?{' '}
            <a 
              href="/register" 
              style={{ 
                color: 'var(--cyber-green)', 
                fontWeight: 500
              }}
            >
              Register here
            </a>
          </p>
        </div>

        {!showTwoFactor && (
          <div style={{ 
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-md)',
            background: 'var(--dark-surface-alt)',
            border: '1px solid var(--dark-border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: 'var(--font-size-xs)', 
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Demo Account
            </div>
            <code style={{ 
              color: 'var(--cyber-green)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-mono)'
            }}>
              admin / Admin@123
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
