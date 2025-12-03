import { useState, useEffect } from 'react';
import lightLogo from '../images/light_theme.png';
import darkLogo from '../images/dark_theme.png';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    requestReason: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/registration/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Registration submitted successfully! Please wait for admin approval.'
        });
        setFormData({ firstName: '', lastName: '', email: '', companyName: '', phoneNumber: '', requestReason: '' });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
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
            Create your account
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="First name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName" className="form-label">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              className="form-input"
              value={formData.companyName}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Your company"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="form-input"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
              placeholder="+1234567890"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requestReason" className="form-label">Request Reason (Optional)</label>
            <textarea
              id="requestReason"
              name="requestReason"
              className="form-textarea"
              value={formData.requestReason}
              onChange={handleChange}
              disabled={loading}
              rows="3"
              placeholder="Why do you need access to this system?"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Create Account'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--dark-border)'
        }}>
          <p className="text-muted">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="link-cyber-green"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
