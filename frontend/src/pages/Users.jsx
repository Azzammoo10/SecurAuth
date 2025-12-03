import { useState, useEffect } from 'react';
import { userAPI, roleAPI } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roles: ['USER'],
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll(0, 100);
      setUsers(response.data.data.content);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des utilisateurs' });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await roleAPI.getAll();
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.create(formData);
      setMessage({ 
        type: 'success', 
        text: `Utilisateur créé avec succès ! Mot de passe temporaire: ${response.data.data.temporaryPassword}` 
      });
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la création' 
      });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.update(selectedUser.id, formData);
      setMessage({ type: 'success', text: 'Utilisateur mis à jour avec succès' });
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la mise à jour' 
      });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await userAPI.delete(id);
      setMessage({ type: 'success', text: 'Utilisateur supprimé avec succès' });
      loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id);
      setMessage({ type: 'success', text: 'Statut modifié avec succès' });
      loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de statut' });
    }
  };

  const handleUnlock = async (id) => {
    try {
      await userAPI.unlock(id);
      setMessage({ type: 'success', text: 'Utilisateur déverrouillé avec succès' });
      loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur' });
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      roles: Array.from(user.roles),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roles: ['USER'],
    });
    setSelectedUser(null);
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading users...
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header avec icône */}
      <div className="page-header-box">
        <div className="page-header-icon users">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">Gérez les comptes, rôles et permissions</p>
        </div>
        <div className="page-header-actions">
          <button onClick={openCreateModal} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvel utilisateur
          </button>
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Liste des utilisateurs</h2>
          </div>
          <span className="content-card-badge">{users.length} utilisateur(s)</span>
        </div>
        <div className="table-container">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>ROLES</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="font-mono text-success font-semibold">{user.username}</span>
                  </td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td className="text-secondary">{user.email}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from(user.roles).map(role => (
                        <span key={role} className="badge badge-info">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <span className={`badge ${user.enabled ? 'badge-success' : 'badge-danger'}`}>
                        {user.enabled ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      {!user.accountNonLocked && (
                        <span className="badge badge-warning">LOCKED</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditModal(user)} 
                        className="btn btn-secondary btn-sm"
                        title="Edit user"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)} 
                        className="btn btn-ghost btn-sm"
                        title={user.enabled ? 'Disable' : 'Enable'}
                      >
                        {user.enabled ? 'Disable' : 'Enable'}
                      </button>
                      {!user.accountNonLocked && (
                        <button 
                          onClick={() => handleUnlock(user.id)} 
                          className="btn btn-success btn-sm"
                          title="Unlock account"
                        >
                          Unlock
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="btn btn-danger btn-sm"
                        title="Delete user"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <div className={`modal-icon ${modalMode === 'create' ? 'create' : 'edit'}`}>
                  {modalMode === 'create' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="modal-title">
                    {modalMode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
                  </h2>
                  <p className="modal-subtitle">
                    {modalMode === 'create' 
                      ? 'Remplissez les informations pour créer un nouveau compte' 
                      : 'Modifiez les informations de l\'utilisateur'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="modal-close-btn"
                aria-label="Fermer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreateUser : handleUpdateUser}>
              <div className="modal-body">
                {/* Section Informations de contact */}
                <div className="form-section">
                  <div className="form-section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>Informations de contact</span>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Adresse email</label>
                    <div className="input-with-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="utilisateur@exemple.com"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Téléphone <span className="form-optional">(optionnel)</span></label>
                    <div className="input-with-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Identité */}
                <div className="form-section">
                  <div className="form-section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Identité</span>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        placeholder="Jean"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Rôles */}
                <div className="form-section">
                  <div className="form-section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Rôle</span>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Attribuer un rôle</label>
                    <div className="roles-grid">
                      {roles.map(role => (
                        <label key={role.id} className={`role-checkbox ${formData.roles.includes(role.name) ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="user-role"
                            checked={formData.roles.includes(role.name)}
                            onChange={() => {
                              setFormData({ ...formData, roles: [role.name] });
                            }}
                          />
                          <span className="role-checkbox-indicator">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                          <span className="role-checkbox-label">{role.name}</span>
                          {role.description && (
                            <span className="role-checkbox-desc">{role.description}</span>
                          )}
                        </label>
                      ))}
                    </div>
                    <span className="form-help">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      Sélectionnez le rôle de cet utilisateur
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {modalMode === 'create' ? (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </>
                    ) : (
                      <polyline points="20 6 9 17 4 12"/>
                    )}
                  </svg>
                  {modalMode === 'create' ? 'Créer l\'utilisateur' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
