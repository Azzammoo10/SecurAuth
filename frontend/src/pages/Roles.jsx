import { useState, useEffect } from 'react';
import { roleAPI } from '../services/api';

function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await roleAPI.getAll();
      setRoles(response.data.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des rôles' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await roleAPI.create(formData);
      setMessage({ type: 'success', text: 'Rôle créé avec succès' });
      setShowModal(false);
      resetForm();
      loadRoles();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la création' 
      });
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await roleAPI.update(selectedRole.id, formData);
      setMessage({ type: 'success', text: 'Rôle mis à jour avec succès' });
      setShowModal(false);
      resetForm();
      loadRoles();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la mise à jour' 
      });
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return;
    
    try {
      await roleAPI.delete(id);
      setMessage({ type: 'success', text: 'Rôle supprimé avec succès' });
      loadRoles();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading roles...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card-header">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Manage system roles and permissions</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          + New Role
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="table-container">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>NAME</th>
              <th>DESCRIPTION</th>
              <th>PERMISSIONS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>
                  <span className="text-cyber-green font-mono">{role.name}</span>
                </td>
                <td className="text-muted">{role.description || '-'}</td>
                <td>
                  {role.permissions && role.permissions.size > 0 ? (
                    <span className="badge badge-info">
                      {Array.from(role.permissions).length} permissions
                    </span>
                  ) : (
                    <span className="badge badge-warning">None</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${role.active ? 'badge-success' : 'badge-danger'}`}>
                    {role.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button onClick={() => openEditModal(role)} className="btn btn-sm btn-primary">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteRole(role.id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create Role' : 'Edit Role'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                ×
              </button>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreateRole : handleUpdateRole}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Role Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., MANAGER, SUPERVISOR"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    placeholder="Role description and responsibilities"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Create Role' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles;
