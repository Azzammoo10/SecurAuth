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
    <div className="container">
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading users...
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title">User Management</h1>
          <p className="card-subtitle">Manage user accounts, roles, and permissions</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          + New User
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create New User' : 'Edit User'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-ghost btn-icon"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreateUser : handleUpdateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Roles</label>
                  <select
                    multiple
                    className="form-select"
                    value={formData.roles}
                    onChange={(e) => setFormData({
                      ...formData,
                      roles: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    style={{ minHeight: '120px' }}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                  <span className="form-help">
                    Hold Ctrl/Cmd to select multiple roles
                  </span>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
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
