import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import {
  Users,
  Shield,
  Stethoscope,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
} from 'lucide-react';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Role Edit Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('parent');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersAPI.getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openRoleModal = (u) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError('');
    try {
      const res = await usersAPI.updateRole(selectedUser._id, newRole);
      if (res.success) {
        setSuccessMsg(`Role for ${selectedUser.name} updated to ${newRole}`);
        setShowRoleModal(false);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user account '${name}'?`)) return;
    try {
      const res = await usersAPI.deleteUser(id);
      if (res.success) {
        setSuccessMsg(`User '${name}' deleted.`);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            User Account & Role Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Administer system access roles: Parents, Attending Pediatricians, and Administrators.
          </p>
        </div>

        <button onClick={fetchUsers} className="btn btn-outline">
          <RefreshCw size={15} /> Refresh Users
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Search size={20} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem',
            width: '100%',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading user accounts...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Hospital / Clinic</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor:
                            u.role === 'admin'
                              ? '#e0f2fe'
                              : u.role === 'doctor'
                              ? '#ccfbf1'
                              : '#ffe4e6',
                          color:
                            u.role === 'admin'
                              ? '#0284c7'
                              : u.role === 'doctor'
                              ? '#0d9488'
                              : '#e11d48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <strong>{u.name}</strong>
                        {u._id === currentUser?._id && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '0.35rem' }}>
                            (You)
                          </span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        backgroundColor:
                          u.role === 'admin'
                            ? '#e0f2fe'
                            : u.role === 'doctor'
                            ? '#ccfbf1'
                            : '#ffe4e6',
                        color:
                          u.role === 'admin'
                            ? '#0369a1'
                            : u.role === 'doctor'
                            ? '#0f766e'
                            : '#9f1239',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td>{u.phone || 'N/A'}</td>
                  <td>{u.hospitalOrClinic || (u.role === 'doctor' ? 'General Clinic' : 'N/A')}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => openRoleModal(u)}
                        className="btn btn-outline btn-sm"
                        title="Change user role"
                      >
                        <Edit2 size={13} /> Change Role
                      </button>

                      {u._id !== currentUser?._id && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fecaca' }}
                          title="Delete account"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Update Role: {selectedUser.name}</h3>
              <button onClick={() => setShowRoleModal(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateRole}>
              <div className="form-group">
                <label className="form-label">Select Project Role</label>
                <select
                  className="form-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="parent">Parent / Patient</option>
                  <option value="doctor">Doctor / Healthcare Worker</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
