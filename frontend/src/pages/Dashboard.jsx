import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, auditAPI, authAPI } from '../services/api';
import authService from '../services/authService';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recentLogs: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger le profil utilisateur pour tous
      try {
        const profileResponse = await userAPI.getMe();
        setUserProfile(profileResponse.data.data);
      } catch (e) {
        console.error('Error loading profile:', e);
      }

      // Charger les sessions actives
      try {
        const sessionsResponse = await authAPI.get('/account/sessions');
        setSessions(sessionsResponse.data.data || []);
      } catch (e) {
        console.error('Error loading sessions:', e);
      }

      // Charger les utilisateurs si autorisé
      if (authService.hasAnyRole(['ADMIN', 'MANAGER'])) {
        const usersResponse = await userAPI.getAll(0, 1000);
        const users = usersResponse.data.data.content;
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.enabled).length,
        }));
      }

      // Charger les logs récents
      if (authService.hasAnyRole(['ADMIN', 'SECURITY'])) {
        const logsResponse = await auditAPI.getRecent(user.username);
        setRecentActivity(logsResponse.data.data);
        setStats(prev => ({
          ...prev,
          recentLogs: logsResponse.data.data.length,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header avec icône */}
      <div className="page-header-box">
        <div className="page-header-icon dashboard">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Bienvenue, {user.firstName} {user.lastName}</p>
        </div>
        <div className="page-header-badges">
          {user.roles?.map(role => (
            <span key={role} className="badge badge-secondary">{role}</span>
          ))}
        </div>
      </div>

      {authService.hasAnyRole(['ADMIN', 'MANAGER']) && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total utilisateurs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">Utilisateurs actifs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon activity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.recentLogs}</div>
              <div className="stat-label">Activités récentes</div>
            </div>
          </div>
        </div>
      )}

      {authService.hasAnyRole(['ADMIN', 'SECURITY']) && recentActivity.length > 0 && (
        <div className="content-card">
          <div className="content-card-header">
            <div className="content-card-title">
              <div className="content-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h2>Activité récente</h2>
            </div>
          </div>
          <div className="table-container">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ACTION</th>
                  <th>DETAILS</th>
                  <th>STATUS</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td className="font-semibold">{log.action}</td>
                    <td className="text-secondary">{log.details || '-'}</td>
                    <td>
                      <span className={`badge ${log.success ? 'badge-success' : 'badge-danger'}`}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                    <td className="font-mono text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!authService.hasAnyRole(['ADMIN', 'MANAGER', 'SECURITY']) && (
        <>
          {/* Section Sécurité du compte */}
          <div className="dashboard-user-grid">
            {/* Carte 2FA */}
            <div className="content-card security-card">
              <div className="content-card-header">
                <div className="content-card-title">
                  <div className="content-card-icon" style={{ background: userProfile?.twoFactorEnabled ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h2>Authentification 2FA</h2>
                </div>
                <span className={`badge ${userProfile?.twoFactorEnabled ? 'badge-success' : 'badge-warning'}`}>
                  {userProfile?.twoFactorEnabled ? '✓ Activé' : '⚠ Désactivé'}
                </span>
              </div>
              <div className="content-card-body">
                {userProfile?.twoFactorEnabled ? (
                  <div className="security-status-box success">
                    <div className="security-status-icon">🛡️</div>
                    <div>
                      <p className="security-status-title">Votre compte est protégé</p>
                      <p className="security-status-desc">L'authentification à deux facteurs est active sur votre compte.</p>
                    </div>
                  </div>
                ) : (
                  <div className="security-status-box warning">
                    <div className="security-status-icon">⚠️</div>
                    <div>
                      <p className="security-status-title">Protégez votre compte</p>
                      <p className="security-status-desc">Activez l'authentification 2FA pour renforcer la sécurité de votre compte.</p>
                    </div>
                  </div>
                )}
                <button 
                  className={`btn ${userProfile?.twoFactorEnabled ? 'btn-secondary' : 'btn-primary'} btn-block mt-3`}
                  onClick={() => navigate('/account/security')}
                >
                  {userProfile?.twoFactorEnabled ? 'Gérer la 2FA' : '🔐 Activer la 2FA maintenant'}
                </button>
              </div>
            </div>

            {/* Carte Mot de passe */}
            <div className="content-card security-card">
              <div className="content-card-header">
                <div className="content-card-title">
                  <div className="content-card-icon" style={{ background: user?.mustChangePassword ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h2>Mot de passe</h2>
                </div>
                <span className={`badge ${user?.mustChangePassword ? 'badge-warning' : 'badge-success'}`}>
                  {user?.mustChangePassword ? '⚠ À changer' : '✓ Sécurisé'}
                </span>
              </div>
              <div className="content-card-body">
                {user?.mustChangePassword ? (
                  <div className="security-status-box warning">
                    <div className="security-status-icon">🔑</div>
                    <div>
                      <p className="security-status-title">Changement recommandé</p>
                      <p className="security-status-desc">Vous utilisez un mot de passe temporaire. Créez votre propre mot de passe.</p>
                    </div>
                  </div>
                ) : (
                  <div className="security-status-box success">
                    <div className="security-status-icon">✅</div>
                    <div>
                      <p className="security-status-title">Mot de passe personnel</p>
                      <p className="security-status-desc">Vous avez défini votre propre mot de passe sécurisé.</p>
                    </div>
                  </div>
                )}
                <button 
                  className={`btn ${user?.mustChangePassword ? 'btn-primary' : 'btn-secondary'} btn-block mt-3`}
                  onClick={() => navigate('/account/security')}
                >
                  {user?.mustChangePassword ? '🔐 Changer maintenant' : 'Modifier le mot de passe'}
                </button>
              </div>
            </div>

            {/* Carte Sessions */}
            <div className="content-card security-card">
              <div className="content-card-header">
                <div className="content-card-title">
                  <div className="content-card-icon" style={{ background: 'var(--color-info)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <h2>Sessions actives</h2>
                </div>
                <span className="badge badge-info">{sessions.length} session(s)</span>
              </div>
              <div className="content-card-body">
                <div className="security-status-box info">
                  <div className="security-status-icon">💻</div>
                  <div>
                    <p className="security-status-title">{sessions.length} appareil(s) connecté(s)</p>
                    <p className="security-status-desc">Gérez vos sessions actives et déconnectez les appareils non reconnus.</p>
                  </div>
                </div>
                <button 
                  className="btn btn-secondary btn-block mt-3"
                  onClick={() => navigate('/account/security')}
                >
                  Gérer les sessions
                </button>
              </div>
            </div>
          </div>

          {/* Informations du compte */}
          <div className="content-card">
            <div className="content-card-header">
              <div className="content-card-title">
                <div className="content-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h2>Informations du compte</h2>
              </div>
            </div>
            <div className="content-card-body">
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">Nom d'utilisateur</span>
                  <span className="profile-info-value font-mono">{user?.username}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">{userProfile?.email || user?.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Nom complet</span>
                  <span className="profile-info-value">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Rôle(s)</span>
                  <span className="profile-info-value">
                    {user?.roles?.map(role => (
                      <span key={role} className="badge badge-info mr-1">{role}</span>
                    ))}
                  </span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Compte créé le</span>
                  <span className="profile-info-value">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR') : '-'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Dernière connexion</span>
                  <span className="profile-info-value">{userProfile?.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleString('fr-FR') : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conseils de sécurité */}
          <div className="content-card tips-card">
            <div className="content-card-header">
              <div className="content-card-title">
                <div className="content-card-icon" style={{ background: 'var(--cyber-green)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h2>Conseils de sécurité</h2>
              </div>
            </div>
            <div className="content-card-body">
              <div className="tips-grid">
                <div className="tip-item">
                  <span className="tip-icon">🔐</span>
                  <div>
                    <p className="tip-title">Activez la 2FA</p>
                    <p className="tip-desc">Ajoutez une couche de sécurité supplémentaire avec Google Authenticator.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔑</span>
                  <div>
                    <p className="tip-title">Mot de passe fort</p>
                    <p className="tip-desc">Utilisez un mot de passe unique avec des caractères spéciaux.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">👀</span>
                  <div>
                    <p className="tip-title">Surveillez vos sessions</p>
                    <p className="tip-desc">Vérifiez régulièrement les appareils connectés à votre compte.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🚪</span>
                  <div>
                    <p className="tip-title">Déconnectez-vous</p>
                    <p className="tip-desc">Toujours vous déconnecter sur les appareils partagés.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
