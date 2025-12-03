import { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    success: '',
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      const response = await auditAPI.getAll(page, 20);
      setLogs(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        success: filters.success === '' ? null : filters.success === 'true',
        page,
        size: 20,
      };
      const response = await auditAPI.search(searchFilters);
      setLogs(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error searching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ username: '', action: '', success: '' });
    setPage(0);
    loadLogs();
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('LOGIN')) return 'badge-info';
    if (action.includes('CREATED')) return 'badge-success';
    if (action.includes('DELETED')) return 'badge-danger';
    if (action.includes('UPDATED')) return 'badge-warning';
    return 'badge-secondary';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading audit logs...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header avec icône */}
      <div className="page-header-box">
        <div className="page-header-icon audit">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Journal d'audit</h1>
          <p className="page-subtitle">Trace de sécurité et surveillance des activités</p>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div className="content-card-title">
            <div className="content-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h2>Filtres de recherche</h2>
          </div>
        </div>
        <div className="content-card-body">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-3 gap-2">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                placeholder="Search by username..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Action</label>
              <input
                type="text"
                className="form-input"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="e.g., LOGIN_SUCCESS..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Rechercher
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Réinitialiser
            </button>
          </div>
        </form>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div className="content-card-title">
            <div className="content-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h2>Résultats</h2>
          </div>
          <div className="content-card-actions">
            <span className="content-card-badge">{logs.length} entrée(s)</span>
            <div className="btn-group">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-sm btn-secondary"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn btn-sm btn-secondary"
            >
              Next →
            </button>
          </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>USERNAME</th>
                <th>ACTION</th>
                <th>DETAILS</th>
                <th>IP ADDRESS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-sm">
                    {new Date(log.timestamp).toLocaleString('en-US')}
                  </td>
                  <td>
                    <span className="text-cyber-green font-mono">{log.username}</span>
                  </td>
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-muted text-truncate" style={{ maxWidth: '300px' }}>
                    {log.details || '-'}
                  </td>
                  <td className="font-mono text-sm text-muted">
                    {log.ipAddress || '-'}
                  </td>
                  <td>
                    <span className={`badge ${log.success ? 'badge-success' : 'badge-danger'}`}>
                      {log.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
