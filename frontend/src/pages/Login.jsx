import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import lightLogo from '../images/light_theme.png';
import darkLogo from '../images/dark_theme.png';

function Login({ setIsAuthenticated, setMustChangePassword }) {
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
      const { accessToken, refreshToken, user, sessionToken } = responseData;
      authService.setTokens(accessToken, refreshToken, sessionToken);
      authService.setUser(user);
      localStorage.setItem('username', formData.username);
      setIsAuthenticated(true);
      
      // Vérifier si l'utilisateur doit changer son mot de passe
      if (user.mustChangePassword) {
        setMustChangePassword && setMustChangePassword(true);
        navigate('/change-password');
      } else {
        setMustChangePassword && setMustChangePassword(false);
        navigate('/dashboard');
      }
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
      const { accessToken, refreshToken, user, sessionToken } = response.data.data;

      authService.setTokens(accessToken, refreshToken, sessionToken);
      authService.setUser(user);
      localStorage.setItem('username', formData.username);
      setIsAuthenticated(true);
      
      // Vérifier si l'utilisateur doit changer son mot de passe
      if (user.mustChangePassword) {
        setMustChangePassword && setMustChangePassword(true);
        navigate('/change-password');
      } else {
        setMustChangePassword && setMustChangePassword(false);
        navigate('/dashboard');
      }
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
          <img 
            src={theme === 'dark' ? darkLogo : lightLogo} 
            alt="SecureAuth+" 
            className="login-logo"
          />
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
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
