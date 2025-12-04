import { jwtDecode } from 'jwt-decode';

export const authService = {
  // Stockage des tokens
  setTokens: (accessToken, refreshToken, sessionToken = null) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
    }
  },

  // Récupération du token
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  getSessionToken: () => localStorage.getItem('sessionToken'),

  // Stockage user info
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérification de l'authentification
  isAuthenticated: () => {
    const token = authService.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Vérification des rôles
  hasRole: (role) => {
    const user = authService.getUser();
    return user?.roles?.includes(role) || false;
  },

  hasAnyRole: (roles) => {
    const user = authService.getUser();
    return roles.some(role => user?.roles?.includes(role)) || false;
  },

  // Déconnexion
  logout: () => {
    localStorage.clear();
  },
};

export default authService;
