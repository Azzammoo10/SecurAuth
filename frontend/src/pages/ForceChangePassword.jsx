import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import { useToast } from '../components/Toast';

function ForceChangePassword({ setMustChangePassword }) {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordPolicy, setPasswordPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadPasswordPolicy();
  }, []);

  useEffect(() => {
    if (passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword) {
      setCurrentStep(3);
    } else if (passwordData.newPassword) {
      setCurrentStep(2);
    } else if (passwordData.oldPassword) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [passwordData]);

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
    return Math.min(strength, 100);
  };

  const getPasswordStrengthInfo = (password) => {
    const strength = calculatePasswordStrength(password);
    if (strength < 30) return { label: 'Faible', color: 'var(--color-danger)' };
    if (strength < 60) return { label: 'Moyen', color: 'var(--color-warning)' };
    if (strength < 80) return { label: 'Bon', color: 'var(--color-info)' };
    return { label: 'Excellent', color: 'var(--color-success)' };
  };

  const checkRequirement = (password, requirement) => {
    switch (requirement) {
      case 'length': return password.length >= (passwordPolicy?.minLength || 8);
      case 'uppercase': return /[A-Z]/.test(password);
      case 'lowercase': return /[a-z]/.test(password);
      case 'number': return /\d/.test(password);
      case 'special': return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      default: return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas', {
        title: 'Erreur de validation',
        icon: 'error'
      });
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error('Le nouveau mot de passe doit être différent de l\'ancien', {
        title: 'Erreur de validation',
        icon: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.post('/account/change-password', passwordData);
      toast.success('Vous allez être redirigé vers le tableau de bord', {
        title: '🎉 Mot de passe changé avec succès !',
        icon: 'password',
        duration: 3000
      });
      
      const user = authService.getUser();
      if (user) {
        user.mustChangePassword = false;
        authService.setUser(user);
      }

      if (setMustChangePassword) {
        setMustChangePassword(false);
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Échec du changement de mot de passe', {
        title: 'Erreur',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordToggle = ({ show, onClick }) => (
    <button
      type="button"
      onClick={onClick}
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
        justifyContent: 'center',
        transition: 'color 0.2s'
      }}
    >
      {show ? (
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
  );

  return (
    <div className="force-change-password-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Effects */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        animation: 'float 15s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        animation: 'float 12s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
        animation: 'float 10s ease-in-out infinite',
        animationDelay: '2s',
        pointerEvents: 'none'
      }} />
      
      {/* Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-3deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes step-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
        }
        .force-pwd-card {
          animation: slideUp 0.6s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-circle-active {
          animation: step-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="force-pwd-card" style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header avec Shield Animation */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 8s ease infinite',
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none'
          }} />
          
          {/* Shield Icon with Animation */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto var(--space-lg)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Pulse rings */}
            <div style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              animation: 'pulse-ring 2s ease-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.2)',
              animation: 'pulse-ring 2s ease-out infinite',
              animationDelay: '0.5s'
            }} />
            
            {/* Shield background */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'shield-pulse 3s ease-in-out infinite'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4" strokeWidth="2.5"/>
              </svg>
            </div>
          </div>
          
          <h1 style={{
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Sécurisez votre compte
          </h1>
          
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'var(--font-size-base)',
            margin: 'var(--space-sm) 0 0',
            fontWeight: 400
          }}>
            Créez un mot de passe personnel et sécurisé
          </p>
        </div>

        {/* Progress Steps - Enhanced */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          padding: 'var(--space-lg) var(--space-xl)',
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          {[
            { num: 1, label: 'Vérification', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )},
            { num: 2, label: 'Nouveau MDP', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            )},
            { num: 3, label: 'Confirmation', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          ].map((step, index) => (
            <div key={step.num} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div 
                className={currentStep === step.num ? 'step-circle-active' : ''}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: currentStep >= step.num 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                    : 'rgba(255,255,255,0.05)',
                  color: currentStep >= step.num ? 'white' : 'rgba(255,255,255,0.3)',
                  border: currentStep >= step.num 
                    ? 'none' 
                    : '1px solid rgba(255,255,255,0.1)',
                  transform: currentStep === step.num ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {currentStep > step.num ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : step.icon}
              </div>
              <span style={{
                fontSize: '0.75rem',
                color: currentStep >= step.num ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                fontWeight: currentStep >= step.num ? 600 : 400,
                transition: 'all 0.3s ease',
                display: 'none'
              }}>
                {step.label}
              </span>
              {index < 2 && (
                <div style={{
                  width: '40px',
                  height: '3px',
                  borderRadius: '2px',
                  background: currentStep > step.num 
                    ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' 
                    : 'rgba(255,255,255,0.1)',
                  marginLeft: '4px',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {currentStep > step.num && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 1.5s infinite'
                    }} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-xl) var(--space-2xl)' }}>
          {/* Alert Warning - Enhanced */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            padding: 'var(--space-lg)',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            borderRadius: '16px',
            marginBottom: 'var(--space-xl)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '4px 0 0 4px'
            }} />
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: '8px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p style={{
                margin: 0,
                fontWeight: 600,
                color: '#fbbf24',
                fontSize: 'var(--font-size-base)',
                letterSpacing: '-0.01em'
              }}>
                Première connexion détectée
              </p>
              <p style={{
                margin: 'var(--space-xs) 0 0',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.6
              }}>
                Pour des raisons de sécurité, vous devez remplacer votre mot de passe temporaire par un mot de passe personnel.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Old Password - Enhanced */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 'var(--space-sm)',
                letterSpacing: '0.01em'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                Mot de passe temporaire
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  className="form-input"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="Entrez le mot de passe reçu par email"
                  required
                  autoFocus
                  style={{ 
                    paddingRight: '48px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '14px 48px 14px 16px',
                    fontSize: 'var(--font-size-base)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                />
                <PasswordToggle show={showOldPassword} onClick={() => setShowOldPassword(!showOldPassword)} />
              </div>
              <p style={{
                margin: 'var(--space-sm) 0 0',
                fontSize: 'var(--font-size-xs)',
                color: 'rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Consultez votre email pour le mot de passe temporaire
              </p>
            </div>

            {/* New Password - Enhanced */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 'var(--space-sm)',
                letterSpacing: '0.01em'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Créez votre nouveau mot de passe"
                  required
                  style={{ 
                    paddingRight: '48px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '14px 48px 14px 16px',
                    fontSize: 'var(--font-size-base)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                />
                <PasswordToggle show={showNewPassword} onClick={() => setShowNewPassword(!showNewPassword)} />
              </div>

              {/* Password Strength Indicator - Enhanced */}
              {passwordData.newPassword && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <span style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 500
                    }}>
                      Force du mot de passe
                    </span>
                    <span style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 700,
                      color: getPasswordStrengthInfo(passwordData.newPassword).color,
                      padding: '4px 10px',
                      background: `${getPasswordStrengthInfo(passwordData.newPassword).color}20`,
                      borderRadius: '20px'
                    }}>
                      {getPasswordStrengthInfo(passwordData.newPassword).label}
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${calculatePasswordStrength(passwordData.newPassword)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${getPasswordStrengthInfo(passwordData.newPassword).color}, ${getPasswordStrengthInfo(passwordData.newPassword).color}cc)`,
                      borderRadius: '4px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 10px ${getPasswordStrengthInfo(passwordData.newPassword).color}40`
                    }} />
                  </div>

                  {/* Requirements Checklist - Enhanced */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginTop: 'var(--space-lg)',
                    padding: 'var(--space-lg)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {[
                      { key: 'length', label: `Min. ${passwordPolicy?.minLength || 8} caractères`, icon: '📏' },
                      { key: 'uppercase', label: 'Une majuscule', icon: 'A' },
                      { key: 'lowercase', label: 'Une minuscule', icon: 'a' },
                      { key: 'number', label: 'Un chiffre', icon: '1' },
                      { key: 'special', label: 'Caractère spécial', icon: '#' }
                    ].map(req => {
                      const isValid = checkRequirement(passwordData.newPassword, req.key);
                      return (
                        <div key={req.key} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: 'var(--font-size-sm)',
                          color: isValid ? '#22c55e' : 'rgba(255,255,255,0.4)',
                          transition: 'all 0.3s ease',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: isValid ? 'rgba(34, 197, 94, 0.08)' : 'transparent'
                        }}>
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isValid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                            transition: 'all 0.3s ease'
                          }}>
                            {isValid ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                            )}
                          </div>
                          <span style={{ fontWeight: isValid ? 500 : 400 }}>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password - Enhanced */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 'var(--space-sm)',
                letterSpacing: '0.01em'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                Confirmer le mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre mot de passe"
                  required
                  style={{
                    paddingRight: '48px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${passwordData.confirmPassword
                      ? passwordData.newPassword === passwordData.confirmPassword
                        ? 'rgba(34, 197, 94, 0.5)'
                        : 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    padding: '14px 48px 14px 16px',
                    fontSize: 'var(--font-size-base)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                />
                <PasswordToggle show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
              {passwordData.confirmPassword && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: 'var(--space-sm)',
                  fontSize: 'var(--font-size-sm)',
                  color: passwordData.newPassword === passwordData.confirmPassword ? '#22c55e' : '#ef4444',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: passwordData.newPassword === passwordData.confirmPassword 
                    ? 'rgba(34, 197, 94, 0.08)' 
                    : 'rgba(239, 68, 68, 0.08)'
                }}>
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span style={{ fontWeight: 500 }}>Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      <span style={{ fontWeight: 500 }}>Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button - Enhanced */}
            <button
              type="submit"
              disabled={loading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.oldPassword || !passwordData.newPassword}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: loading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.oldPassword || !passwordData.newPassword
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                cursor: loading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.oldPassword || !passwordData.newPassword
                  ? 'not-allowed'
                  : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: loading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.oldPassword || !passwordData.newPassword
                  ? 'none'
                  : '0 4px 15px rgba(59, 130, 246, 0.3)',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!loading && passwordData.newPassword === passwordData.confirmPassword && passwordData.oldPassword && passwordData.newPassword) {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  Sécuriser mon compte
                </>
              )}
            </button>
          </form>

          {/* Footer - Enhanced */}
          <div style={{
            marginTop: 'var(--space-2xl)',
            paddingTop: 'var(--space-lg)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 'var(--font-size-xs)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Connexion sécurisée avec chiffrement SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForceChangePassword;
