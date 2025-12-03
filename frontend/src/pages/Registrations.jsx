import { useState, useEffect } from 'react';
import { registrationAPI } from '../services/api';

function Registrations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all' or 'pending'
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
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading registrations...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card-header">
        <div>
          <h1 className="page-title">Registration Requests</h1>
          <p className="page-subtitle">Review and approve user registration requests</p>
        </div>
        <div className="btn-group">
          <button
            onClick={() => setFilter('pending')}
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="table-container">
        {requests.length === 0 ? (
          <div className="empty-state">
            <p>No {filter === 'pending' ? 'pending ' : ''}registration requests found.</p>
          </div>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>DATE</th>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>COMPANY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-mono text-sm">
                    {new Date(request.requestedAt).toLocaleDateString('en-US')}
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
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
