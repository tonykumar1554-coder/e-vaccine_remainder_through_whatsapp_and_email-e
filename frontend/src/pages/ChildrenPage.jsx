import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { childrenAPI } from '../services/api';
import {
  Baby,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ArrowRight,
  Heart,
  Phone,
  X,
  RefreshCw,
} from 'lucide-react';

const ChildrenPage = () => {
  const { role, user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'Unknown',
    birthWeight: '',
    allergies: 'None',
    emergencyContact: '',
    notes: '',
  });

  const fetchChildren = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await childrenAPI.getAll();
      if (res.success) {
        setChildren(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching children list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await childrenAPI.create(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Child registered successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          dateOfBirth: '',
          gender: 'male',
          bloodGroup: 'Unknown',
          birthWeight: '',
          allergies: 'None',
          emergencyContact: '',
          notes: '',
        });
        fetchChildren();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add child.');
    }
  };

  const openEditModal = (child) => {
    setSelectedChild(child);
    setFormData({
      name: child.name,
      dateOfBirth: child.dateOfBirth ? child.dateOfBirth.split('T')[0] : '',
      gender: child.gender || 'male',
      bloodGroup: child.bloodGroup || 'Unknown',
      birthWeight: child.birthWeight || '',
      allergies: child.allergies || 'None',
      emergencyContact: child.emergencyContact || '',
      notes: child.notes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateChild = async (e) => {
    e.preventDefault();
    if (!selectedChild) return;
    setError('');
    try {
      const res = await childrenAPI.update(selectedChild._id, formData);
      if (res.success) {
        setSuccessMsg('Child profile updated successfully!');
        setShowEditModal(false);
        fetchChildren();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update child profile');
    }
  };

  const handleDeleteChild = async (childId, childName) => {
    if (!window.confirm(`Are you sure you want to remove child profile '${childName}' and all their vaccination records?`)) {
      return;
    }
    try {
      const res = await childrenAPI.delete(childId);
      if (res.success) {
        setSuccessMsg(`Child profile '${childName}' removed.`);
        fetchChildren();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete child');
    }
  };

  const filteredChildren = children.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.parent?.name && c.parent.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Page Title & Header Actions */}
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
            {role === 'parent' ? 'My Children' : 'Pediatric Patient Registry'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {role === 'parent'
              ? 'Manage your children, calculate custom vaccination timelines, and review schedules.'
              : 'Directory of all registered pediatric patients across hospitals and clinics.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={18} /> Register Child
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

      {/* Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Search size={20} color="#94a3b8" />
        <input
          type="text"
          placeholder={role === 'parent' ? 'Search by child name...' : 'Search by child or parent name...'}
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
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Children List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', color: '#64748b' }}>Loading children profiles...</p>
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Baby size={52} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            No Children Registered Yet
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            {searchTerm
              ? `No child matches '${searchTerm}'. Try a different search.`
              : 'Add your first child to instantly generate their personalized pediatric vaccination schedule.'}
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Register Child Now
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filteredChildren.map((child) => {
            const stats = child.stats || { total: 0, completed: 0, due: 0, overdue: 0, pending: 0 };
            const completionPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            const birthDate = new Date(child.dateOfBirth);
            const ageMonths = Math.floor((new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30.4375));

            return (
              <div
                key={child._id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${
                    stats.overdue > 0 ? '#ef4444' : stats.due > 0 ? '#f59e0b' : '#10b981'
                  }`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: child.gender === 'female' ? '#fdf2f8' : '#e0f2fe',
                          color: child.gender === 'female' ? '#db2777' : '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                        }}
                      >
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{child.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Born {birthDate.toLocaleDateString()} ({ageMonths < 1 ? 'Newborn' : `${ageMonths} months old`})
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => openEditModal(child)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem', color: '#475569' }}
                        title="Edit Child Profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child._id, child.name)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem', color: '#ef4444', borderColor: '#fecaca' }}
                        title="Delete Child Profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Attributes Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                      Blood: {child.bloodGroup}
                    </span>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                      Gender: {child.gender}
                    </span>
                    {child.birthWeight > 0 && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                        Weight: {child.birthWeight} kg
                      </span>
                    )}
                    {child.allergies && child.allergies !== 'None' && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                        Allergies: {child.allergies}
                      </span>
                    )}
                  </div>

                  {/* If Doctor/Admin: Show parent info */}
                  {role !== 'parent' && child.parent && (
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: '#64748b',
                        marginBottom: '1rem',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      Parent: <strong style={{ color: '#1e293b' }}>{child.parent.name}</strong> • Phone: {child.parent.phone || 'N/A'}
                    </div>
                  )}

                  {/* Immunization Progress Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      <span style={{ color: '#475569' }}>Immunization Progress</span>
                      <span style={{ color: '#10b981' }}>{completionPercent}% ({stats.completed}/{stats.total})</span>
                    </div>
                    <div style={{ height: '7px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${completionPercent}%`,
                          backgroundColor: '#10b981',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <span className="badge badge-completed">
                      <CheckCircle2 size={12} /> {stats.completed} Done
                    </span>
                    {stats.due > 0 && (
                      <span className="badge badge-due">
                        <Clock size={12} /> {stats.due} Due Soon
                      </span>
                    )}
                    {stats.overdue > 0 && (
                      <span className="badge badge-overdue">
                        <AlertTriangle size={12} /> {stats.overdue} Overdue
                      </span>
                    )}
                    <span className="badge badge-pending">
                      {stats.pending} Future Doses
                    </span>
                  </div>
                </div>

                <Link
                  to={`/children/${child._id}`}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View Full Schedule & Timeline <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- REGISTER CHILD MODAL ---------------- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Baby size={22} color="var(--primary)" />
                <h3 className="modal-title">Register Child Profile</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#e0f2fe',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: '#0369a1',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <Clock size={18} style={{ flexShrink: 0 }} />
              <span>
                <strong>Automatic Schedule Generation:</strong> Saving will automatically calculate and schedule all standard pediatric vaccine doses for this child based on their Date of Birth!
              </span>
            </div>

            <form onSubmit={handleCreateChild}>
              <div className="form-group">
                <label className="form-label">Child's Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Liam Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="form-select"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Birth Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="birthWeight"
                    className="form-control"
                    placeholder="e.g. 3.2"
                    value={formData.birthWeight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Known Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  className="form-control"
                  placeholder="e.g. Egg, Penicillin (or None)"
                  value={formData.allergies}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Phone Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  className="form-control"
                  placeholder="+1 (555) 019-2834"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes or Birth History</label>
                <textarea
                  name="notes"
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Full-term normal delivery, pediatrician contact"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Child & Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- EDIT CHILD MODAL ---------------- */}
      {showEditModal && selectedChild && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile: {selectedChild.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateChild}>
              <div className="form-group">
                <label className="form-label">Child Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="form-select"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Known Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  className="form-control"
                  value={formData.allergies}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Phone Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  className="form-control"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenPage;
