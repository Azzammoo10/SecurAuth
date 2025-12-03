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
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 'var(--space-xs)' }}>
            Dashboard
          </h1>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>
        <div className="flex gap-1">
          {user.roles?.map(role => (
            <span key={role} className="badge badge-secondary">{role}</span>
          ))}
        </div>
      </div>

      {authService.hasAnyRole(['ADMIN', 'MANAGER']) && (
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-change text-muted">All registered users</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-change positive">Enabled accounts</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Recent Activity</div>
            <div className="stat-value">{stats.recentLogs}</div>
            <div className="stat-change text-muted">Audit log entries</div>
          </div>
        </div>
      )}

      {authService.hasAnyRole(['ADMIN', 'SECURITY']) && recentActivity.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
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
        <div className="card" style={{ 
          border: '1px solid var(--warning)',
          background: 'rgba(244, 162, 97, 0.05)'
        }}>
          <div className="card-header">
            <h2 className="card-title">Limited Access</h2>
          </div>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
            Your current role does not grant access to advanced features.
          </p>
          <p className="text-muted">
            Contact an administrator to request additional permissions.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
