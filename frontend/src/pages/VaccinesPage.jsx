import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vaccinesAPI } from '../services/api';
import {
  Syringe,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Info,
  Clock,
  HeartPulse,
} from 'lucide-react';

const VaccinesPage = () => {
  const { role } = useAuth();
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    diseasePrevented: '',
    doseNumber: 1,
    targetAgeDays: 0,
    targetAgeMonths: 0,
    ageLabel: 'At Birth',
    description: '',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Mild soreness or low fever.',
  });

  const fetchVaccines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vaccinesAPI.getAll();
      if (res.success) {
        setVaccines(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching vaccine list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCreateVaccine = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await vaccinesAPI.create(formData);
      if (res.success) {
        setSuccessMsg(`Vaccine '${formData.name}' created successfully!`);
        setShowAddModal(false);
        fetchVaccines();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create vaccine');
    }
  };

  const openEditModal = (vaccine) => {
    setSelectedVaccine(vaccine);
    setFormData({
      name: vaccine.name,
      diseasePrevented: vaccine.diseasePrevented,
      doseNumber: vaccine.doseNumber || 1,
      targetAgeDays: vaccine.targetAgeDays || 0,
      targetAgeMonths: vaccine.targetAgeMonths || 0,
      ageLabel: vaccine.ageLabel || 'At Birth',
      description: vaccine.description || '',
      routeOfAdministration: vaccine.routeOfAdministration || 'Intramuscular',
      isMandatory: vaccine.isMandatory !== undefined ? vaccine.isMandatory : true,
      possibleSideEffects: vaccine.possibleSideEffects || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateVaccine = async (e) => {
    e.preventDefault();
    if (!selectedVaccine) return;
    setError('');
    try {
      const res = await vaccinesAPI.update(selectedVaccine._id, formData);
      if (res.success) {
        setSuccessMsg(`Vaccine '${formData.name}' updated successfully!`);
        setShowEditModal(false);
        fetchVaccines();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update vaccine');
    }
  };

  const handleDeleteVaccine = async (vaccineId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete vaccine '${name}' from the master catalog?`)) {
      return;
    }
    try {
      const res = await vaccinesAPI.delete(vaccineId);
      if (res.success) {
        setSuccessMsg(`Vaccine '${name}' deleted.`);
        fetchVaccines();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete vaccine');
    }
  };

  const handleSeedCatalog = async () => {
    if (!window.confirm('Reset/Seed the default national pediatric vaccination schedule?')) return;
    try {
      const res = await vaccinesAPI.seedCatalog(true);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchVaccines();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to seed vaccines');
    }
  };

  const filteredVaccines = vaccines.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.diseasePrevented.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ageLabel.toLowerCase().includes(searchTerm.toLowerCase())
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
            Pediatric Immunization Master Catalog
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Standard national vaccine milestone guidelines, target age windows, and clinical instructions.
          </p>
        </div>

        {role === 'admin' && (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleSeedCatalog}
              className="btn btn-outline"
              title="Reset to default national schedule"
            >
              <RefreshCw size={15} /> Reset / Seed Standard Catalog
            </button>
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  diseasePrevented: '',
                  doseNumber: 1,
                  targetAgeDays: 0,
                  targetAgeMonths: 0,
                  ageLabel: 'At Birth',
                  description: '',
                  routeOfAdministration: 'Intramuscular',
                  isMandatory: true,
                  possibleSideEffects: 'Mild soreness or low fever.',
                });
                setShowAddModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} /> Add Vaccine
            </button>
          </div>
        )}
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

      {/* Search Input */}
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
          placeholder="Filter by vaccine name, disease, or target age (e.g. BCG, Polio, 6 Weeks)..."
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

      {/* Vaccines Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading vaccine schedule...</p>
        </div>
      ) : filteredVaccines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Syringe size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3>No Vaccines Found</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Try clearing your search or seeding the master catalog.</p>
          {role === 'admin' && (
            <button onClick={handleSeedCatalog} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
              Seed Standard Catalog
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filteredVaccines.map((v) => (
            <div
              key={v._id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--primary)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{v.name}</h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        backgroundColor: 'var(--primary-light)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginTop: '0.2rem',
                      }}
                    >
                      Dose #{v.doseNumber || 1} • {v.ageLabel}
                    </span>
                  </div>

                  {role === 'admin' && (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={() => openEditModal(v)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.45rem' }}
                        title="Edit Vaccine"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteVaccine(v._id, v.name)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.45rem', color: '#ef4444', borderColor: '#fecaca' }}
                        title="Delete Vaccine"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#334155' }}>
                  <p>
                    <strong>Protects Against:</strong> {v.diseasePrevented}
                  </p>
                  <p style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <strong>Route:</strong> {v.routeOfAdministration || 'Intramuscular'}
                  </p>
                </div>

                {v.description && (
                  <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {v.description}
                  </p>
                )}
              </div>

              <div
                style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0d9488' }}>
                  <HeartPulse size={13} />
                  <span><strong>Side Effects:</strong> {v.possibleSideEffects || 'Mild soreness or fever'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- ADD / EDIT VACCINE MODALS ---------------- */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {showAddModal ? 'Add New Vaccine' : `Edit Vaccine: ${selectedVaccine?.name}`}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateVaccine : handleUpdateVaccine}>
              <div className="form-group">
                <label className="form-label">Vaccine Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Hepatitis B, Pentavalent 1, MMR"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Disease Prevented *</label>
                <input
                  type="text"
                  name="diseasePrevented"
                  className="form-control"
                  placeholder="e.g. Measles, Rubella, Mumps"
                  value={formData.diseasePrevented}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target Age Label *</label>
                  <input
                    type="text"
                    name="ageLabel"
                    className="form-control"
                    placeholder="e.g. 6 Weeks, 9 Months"
                    value={formData.ageLabel}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age in Days (from birth) *</label>
                  <input
                    type="number"
                    name="targetAgeDays"
                    className="form-control"
                    placeholder="0 for birth, 42 for 6w, 270 for 9m"
                    value={formData.targetAgeDays}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Dose Number</label>
                  <input
                    type="number"
                    min="1"
                    name="doseNumber"
                    className="form-control"
                    value={formData.doseNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Route of Administration</label>
                  <select
                    name="routeOfAdministration"
                    className="form-select"
                    value={formData.routeOfAdministration}
                    onChange={handleInputChange}
                  >
                    <option value="Intramuscular">Intramuscular (IM)</option>
                    <option value="Oral">Oral</option>
                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                    <option value="Intradermal">Intradermal (ID)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Description</label>
                <textarea
                  rows="2"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Known Possible Side Effects</label>
                <input
                  type="text"
                  name="possibleSideEffects"
                  className="form-control"
                  value={formData.possibleSideEffects}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showAddModal ? 'Save New Vaccine' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinesPage;
