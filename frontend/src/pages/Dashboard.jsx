import { useState, useEffect } from 'react';
import { userAPI, auditAPI } from '../services/api';
import authService from '../services/authService';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recentLogs: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
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
        <div className="content-card warning-card">
          <div className="content-card-header">
            <div className="content-card-title">
              <div className="content-card-icon warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2>Accès limité</h2>
            </div>
          </div>
          <div className="content-card-body">
            <p className="text-secondary">Votre rôle actuel ne vous donne pas accès aux fonctionnalités avancées.</p>
            <p className="text-muted">Contactez un administrateur pour demander des permissions supplémentaires.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
