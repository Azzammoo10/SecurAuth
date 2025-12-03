import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { authAPI } from '../services/api';

function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const user = authService.getUser();

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
        <div className="navbar-brand">
          SecureAuth+
        </div>
        
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
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
