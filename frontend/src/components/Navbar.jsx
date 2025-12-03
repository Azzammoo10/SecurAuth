import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { authAPI } from '../services/api';
import ThemeToggle from './ThemeToggle';
import lightLogo from '../images/light_theme.png';
import darkLogo from '../images/dark_theme.png';

function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const user = authService.getUser();
  
  // Détecter le thème actuel
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  useEffect(() => {
    // Observer les changements d'attribut data-theme
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

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.logout();
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <img 
            src={theme === 'dark' ? darkLogo : lightLogo} 
            alt="SecureAuth+" 
            className="navbar-logo"
          />
        </Link>
        
        <ul className="navbar-menu">
          <li>
            <Link to="/dashboard">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/account/security">
              Security
            </Link>
          </li>
          {authService.hasAnyRole(['ADMIN', 'MANAGER']) && (
            <li>
              <Link to="/users">
                Users
              </Link>
            </li>
          )}
          {authService.hasRole('ADMIN') && (
            <>
              <li>
                <Link to="/roles">
                  Roles
                </Link>
              </li>
              <li>
                <Link to="/registrations">
                  Registrations
                </Link>
              </li>
            </>
          )}
          {authService.hasAnyRole(['ADMIN', 'SECURITY']) && (
            <li>
              <Link to="/audit">
                Audit
              </Link>
            </li>
          )}
        </ul>
        
        <div className="navbar-user">
          <div className="navbar-user-info">
            <span className="navbar-username">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="navbar-role">
              @{user?.username}
            </span>
          </div>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
