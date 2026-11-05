import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { childrenAPI, recordsAPI } from '../services/api';
import {
  Baby,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Syringe,
  Stethoscope,
  Building,
  Tag,
  FileText,
  Edit,
  RefreshCw,
  Plus,
} from 'lucide-react';

const ChildDetailPage = () => {
  const { id } = useParams();
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Administer / Update Record modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({
    status: 'Completed',
    administeredDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    clinicOrHospital: '',
    doctorName: '',
    remarks: '',
  });

  const fetchChildDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await childrenAPI.getById(id);
      if (res.success) {
        setChildData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching child record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildDetails();
  }, [id]);

  const openAdministerModal = (record) => {
    setSelectedRecord(record);
    setRecordForm({
      status: 'Completed',
      administeredDate: record.administeredDate
        ? record.administeredDate.split('T')[0]
        : new Date().toISOString().split('T')[0],
      batchNumber: record.batchNumber || `BATCH-${record.vaccine?.name.slice(0, 3).toUpperCase()}-001`,
      clinicOrHospital: record.clinicOrHospital || user?.hospitalOrClinic || 'City Immunization Center',
      doctorName: record.doctorName || (role === 'doctor' ? user?.name : 'Attending Pediatrician'),
      remarks: record.remarks || '',
    });
    setShowRecordModal(true);
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setError('');
    try {
      const res = await recordsAPI.update(selectedRecord._id, recordForm);
      if (res.success) {
        setSuccessMsg(`Vaccine '${selectedRecord.vaccine?.name}' record updated successfully!`);
        setShowRecordModal(false);
        fetchChildDetails();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update record');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <RefreshCw size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading child immunization profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2>Child Profile Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The requested child record does not exist.</p>
        <Link to="/children" className="btn btn-primary">
          Back to Children
        </Link>
      </div>
    );
  }

  const { stats, records } = childData;
  const filteredRecords = (records || []).filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const completionRate = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Navigation Breadcrumb */}
      <button
        onClick={() => navigate('/children')}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Children Registry
      </button>

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

      {/* Child Profile Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          marginBottom: '2rem',
          borderLeft: '6px solid var(--primary)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: childData.gender === 'female' ? '#fdf2f8' : '#e0f2fe',
                color: childData.gender === 'female' ? '#db2777' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.75rem',
              }}
            >
              {childData.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{childData.name}</h1>
                <span className="badge badge-role">{childData.gender}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Date of Birth: <strong>{new Date(childData.dateOfBirth).toLocaleDateString()}</strong> • Blood Group: <strong>{childData.bloodGroup}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/appointments" className="btn btn-primary">
              <Calendar size={16} /> Book Appointment
            </Link>
          </div>
        </div>

        {/* Extended Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <span style={{ color: '#64748b' }}>Birth Weight:</span>
            <p style={{ fontWeight: 700 }}>{childData.birthWeight ? `${childData.birthWeight} kg` : 'Not recorded'}</p>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Allergies:</span>
            <p style={{ fontWeight: 700, color: childData.allergies !== 'None' ? '#ef4444' : 'inherit' }}>
              {childData.allergies || 'None reported'}
            </p>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Emergency Contact:</span>
            <p style={{ fontWeight: 700 }}>{childData.emergencyContact || 'None'}</p>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Parent / Guardian:</span>
            <p style={{ fontWeight: 700 }}>{childData.parent?.name || 'Registered User'}</p>
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Scheduled</span>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{stats?.total || 0}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Milestone Doses</span>
        </div>

        <div className="card" style={{ textAlign: 'center', borderColor: '#a7f3d0' }}>
          <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>Completed</span>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981' }}>{stats?.completed || 0}</p>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{completionRate}% Protected</span>
        </div>

        <div className="card" style={{ textAlign: 'center', borderColor: '#fde68a' }}>
          <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>Due Soon</span>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.due || 0}</p>
          <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Next 14 Days</span>
        </div>

        <div className="card" style={{ textAlign: 'center', borderColor: stats?.overdue > 0 ? '#fecaca' : 'var(--border)' }}>
          <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Overdue</span>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ef4444' }}>{stats?.overdue || 0}</p>
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>Requires Attention</span>
        </div>
      </div>

      {/* Filter Tabs for Timeline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Immunization Schedule & Clinical History</h2>

        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {['ALL', 'Overdue', 'Due', 'Completed', 'Pending'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className="btn btn-sm"
              style={{
                backgroundColor: statusFilter === filter ? 'white' : 'transparent',
                color: statusFilter === filter ? 'var(--primary)' : '#64748b',
                boxShadow: statusFilter === filter ? 'var(--shadow-sm)' : 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Vaccination Records Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccine Name & Target</th>
                <th>Recommended Age</th>
                <th>Scheduled Due Date</th>
                <th>Status</th>
                <th>Administration Details</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    No vaccination records match the filter '{statusFilter}'.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: record.status === 'Completed' ? '#d1fae5' : '#e0f2fe',
                            color: record.status === 'Completed' ? '#059669' : '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Syringe size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{record.vaccine?.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {record.vaccine?.diseasePrevented} • Dose #{record.vaccine?.doseNumber || 1}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {record.vaccine?.ageLabel || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} color="#64748b" />
                        <span style={{ fontWeight: 600 }}>{new Date(record.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>

                    <td>
                      {record.status === 'Completed' ? (
                        <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                          <div style={{ color: '#065f46', fontWeight: 600 }}>
                            Given on: {record.administeredDate ? new Date(record.administeredDate).toLocaleDateString() : 'Recorded'}
                          </div>
                          {record.doctorName && (
                            <div style={{ color: '#64748b' }}>Doctor: {record.doctorName}</div>
                          )}
                          {record.batchNumber && (
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              Batch: <code>{record.batchNumber}</code>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Not administered yet
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openAdministerModal(record)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit size={13} />
                        {record.status === 'Completed' ? 'Edit Record' : 'Record Dose'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- ADMINISTER / UPDATE RECORD MODAL ---------------- */}
      {showRecordModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Record Dose: {selectedRecord.vaccine?.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Child: {childData.name}</p>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateRecord}>
              <div className="form-group">
                <label className="form-label">Vaccination Status</label>
                <select
                  className="form-select"
                  value={recordForm.status}
                  onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
                >
                  <option value="Completed">Completed (Administered)</option>
                  <option value="Due">Due</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {recordForm.status === 'Completed' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Date Administered</label>
                    <input
                      type="date"
                      className="form-control"
                      value={recordForm.administeredDate}
                      onChange={(e) => setRecordForm({ ...recordForm, administeredDate: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vaccine Batch / Lot Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. VAC-BCG-8291A"
                      value={recordForm.batchNumber}
                      onChange={(e) => setRecordForm({ ...recordForm, batchNumber: e.target.value })}
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Administering Doctor / Nurse</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dr. Sarah Jenkins"
                        value={recordForm.doctorName}
                        onChange={(e) => setRecordForm({ ...recordForm, doctorName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hospital / Clinic</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Metro Children Hospital"
                        value={recordForm.clinicOrHospital}
                        onChange={(e) => setRecordForm({ ...recordForm, clinicOrHospital: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Clinical Remarks / Observations</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Dose administered on right anterolateral thigh. No immediate adverse reaction."
                  value={recordForm.remarks}
                  onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vaccination Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildDetailPage;
