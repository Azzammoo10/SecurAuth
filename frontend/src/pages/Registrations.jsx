import { useState, useEffect } from 'react';
import { registrationAPI } from '../services/api';

function Registrations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'pending'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      const response = filter === 'pending'
        ? await registrationAPI.getPending()
        : await registrationAPI.getAll();
      setRequests(response.data.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des demandes' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await registrationAPI.approve(selectedRequest.id, comment);
      setMessage({ 
        type: 'success', 
        text: `Demande approuvée ! Mot de passe temporaire: ${response.data.data.temporaryPassword}` 
      });
      setShowModal(false);
      setComment('');
      loadRequests();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de l\'approbation' 
      });
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;

    try {
      await registrationAPI.reject(selectedRequest.id, comment);
      setMessage({ type: 'success', text: 'Demande rejetée' });
      setShowModal(false);
      setComment('');
      loadRequests();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du rejet' });
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setComment('');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'badge-warning', text: 'PENDING' },
      APPROVED: { class: 'badge-success', text: 'APPROVED' },
      REJECTED: { class: 'badge-danger', text: 'REJECTED' },
    };
    const badge = badges[status] || badges.PENDING;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading registrations...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header avec icône */}
      <div className="page-header-box">
        <div className="page-header-icon registrations">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Demandes d'inscription</h1>
          <p className="page-subtitle">Évaluez et approuvez les demandes d'inscription</p>
        </div>
        <div className="page-header-actions">
          <div className="btn-group">
            <button
              onClick={() => setFilter('pending')}
              className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            >
              En attente ({requests.filter(r => r.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Toutes
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} animate-fadeIn`}>
          <span className="alert-icon">{message.type === 'success' ? '✓' : '⚠️'}</span>
          {message.text}
          <button className="alert-close" onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="content-card">
        <div className="content-card-header">
          <div className="content-card-title">
            <div className="content-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Liste des demandes</h2>
          </div>
          <span className="content-card-badge">{requests.length} demande(s)</span>
        </div>
        <div className="table-container">
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>Aucune demande</h3>
              <p>Aucune demande {filter === 'pending' ? 'en attente ' : ''}trouvée.</p>
            </div>
          ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>DATE</th>
                <th>NOM COMPLET</th>
                <th>EMAIL</th>
                <th>ENTREPRISE</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-mono text-sm">
                    {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <span className="text-cyber-green font-mono">
                      {request.firstName} {request.lastName}
                    </span>
                  </td>
                  <td className="text-muted">{request.email}</td>
                  <td>{request.companyName}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    <button
                      onClick={() => openModal(request)}
                      className="btn btn-sm btn-primary"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Request Details</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <span className="info-label">Name:</span>
                <span className="text-cyber-green">{selectedRequest.firstName} {selectedRequest.lastName}</span>
                
                <span className="info-label">Email:</span>
                <span>{selectedRequest.email}</span>
                
                <span className="info-label">Phone:</span>
                <span>{selectedRequest.phoneNumber || '-'}</span>
                
                <span className="info-label">Company:</span>
                <span>{selectedRequest.companyName}</span>
                
                <span className="info-label">Reason:</span>
                <span>{selectedRequest.requestReason || '-'}</span>
                
                <span className="info-label">Date:</span>
                <span className="font-mono text-sm">
                  {new Date(selectedRequest.requestedAt).toLocaleString('en-US')}
                </span>
                
                <span className="info-label">Status:</span>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              
              {selectedRequest.processedAt && (
                <div className="alert alert-success" style={{ marginTop: 'var(--space-lg)' }}>
                  <div className="info-grid">
                    <span className="info-label">Processed:</span>
                    <span className="font-mono text-sm">
                      {new Date(selectedRequest.processedAt).toLocaleString('en-US')}
                    </span>
                    
                    <span className="info-label">Processed By:</span>
                    <span>{selectedRequest.processedBy}</span>
                    
                    {selectedRequest.adminComment && (
                      <>
                        <span className="info-label">Comment:</span>
                        <span>{selectedRequest.adminComment}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedRequest.status === 'PENDING' && (
              <>
                <div className="form-group">
                  <label className="form-label">Comment (optional)</label>
                  <textarea
                    className="form-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                    placeholder="Add a comment"
                  />
                </div>

                <div className="modal-footer">
                  <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Close
                  </button>
                  <div className="btn-group">
                    <button onClick={handleReject} className="btn btn-danger">
                      Reject
                    </button>
                    <button onClick={handleApprove} className="btn btn-success">
                      Approve
                    </button>
                  </div>
                </div>
              </>
            )}

            {selectedRequest.status !== 'PENDING' && (
              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Registrations;
