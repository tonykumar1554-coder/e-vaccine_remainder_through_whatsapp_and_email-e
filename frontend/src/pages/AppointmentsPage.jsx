import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, childrenAPI, vaccinesAPI, usersAPI } from '../services/api';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  User,
  Syringe,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const AppointmentsPage = () => {
  const { role, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);

  const [formData, setFormData] = useState({
    childId: '',
    vaccineId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: '10:00 AM',
    hospitalOrClinic: 'Metro City Pediatric Clinic',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, childRes, vacRes, docRes] = await Promise.all([
        appointmentsAPI.getAll(),
        childrenAPI.getAll(),
        vaccinesAPI.getAll(),
        usersAPI.getDoctors(),
      ]);

      if (appRes.success) setAppointments(appRes.data);
      if (childRes.success) {
        setChildren(childRes.data);
        if (childRes.data.length > 0 && !formData.childId) {
          setFormData((prev) => ({ ...prev, childId: childRes.data[0]._id }));
        }
      }
      if (vacRes.success) {
        setVaccines(vacRes.data);
        if (vacRes.data.length > 0 && !formData.vaccineId) {
          setFormData((prev) => ({ ...prev, vaccineId: vacRes.data[0]._id }));
        }
      }
      if (docRes.success) {
        setDoctors(docRes.data);
        if (docRes.data.length > 0 && !formData.doctorId) {
          setFormData((prev) => ({ ...prev, doctorId: docRes.data[0]._id }));
        }
      }
    } catch (err) {
      setError(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await appointmentsAPI.create(formData);
      if (res.success) {
        setSuccessMsg('Vaccination appointment booked successfully!');
        setShowBookModal(false);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentsAPI.updateStatus(appointmentId, newStatus);
      if (res.success) {
        setSuccessMsg(`Appointment status updated to ${newStatus}`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this appointment?')) return;
    try {
      const res = await appointmentsAPI.delete(id);
      if (res.success) {
        setSuccessMsg('Appointment cancelled.');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    }
  };

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
            Vaccination Appointments
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Schedule and manage clinic visits for upcoming pediatric vaccinations.
          </p>
        </div>

        <button onClick={() => setShowBookModal(true)} className="btn btn-primary">
          <Plus size={16} /> Book New Appointment
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3>No Appointments Scheduled</h3>
          <p style={{ color: '#64748b', margin: '0.5rem auto 1.5rem', maxWidth: '400px' }}>
            Keep your children's vaccinations timely by booking upcoming slots with attending pediatricians.
          </p>
          <button onClick={() => setShowBookModal(true)} className="btn btn-primary">
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child</th>
                <th>Vaccine</th>
                <th>Date & Time</th>
                <th>Doctor / Clinic</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.child?.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Parent: {app.parent?.name}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {app.vaccine?.name || 'General Immunization'}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {app.vaccine?.diseasePrevented}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="#64748b" />
                      <strong>{new Date(app.appointmentDate).toLocaleDateString()}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Slot: {app.timeSlot}
                    </div>
                  </td>

                  <td>
                    <div>{app.doctor?.name || 'Assigned Clinic Pediatrician'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {app.hospitalOrClinic || app.doctor?.hospitalOrClinic}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge badge-${
                        app.status === 'Confirmed' || app.status === 'Completed'
                          ? 'completed'
                          : app.status === 'Cancelled'
                          ? 'overdue'
                          : 'due'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      {/* Doctor or Admin can confirm */}
                      {role !== 'parent' && app.status === 'Scheduled' && (
                        <button
                          onClick={() => handleStatusChange(app._id, 'Confirmed')}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#0d9488', borderColor: '#99f6e4' }}
                          title="Confirm appointment"
                        >
                          Confirm
                        </button>
                      )}

                      {/* Doctor or Admin can complete */}
                      {role !== 'parent' && app.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(app._id, 'Completed')}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#10b981', borderColor: '#a7f3d0' }}
                          title="Mark completed"
                        >
                          Done
                        </button>
                      )}

                      {/* Delete / Cancel button */}
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#ef4444', borderColor: '#fecaca', padding: '0.3rem 0.5rem' }}
                        title="Cancel Appointment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- BOOK APPOINTMENT MODAL ---------------- */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Book Vaccination Appointment</h3>
              <button onClick={() => setShowBookModal(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleBookSubmit}>
              <div className="form-group">
                <label className="form-label">Select Child *</label>
                <select
                  className="form-select"
                  value={formData.childId}
                  onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                  required
                >
                  {children.length === 0 ? (
                    <option value="">No registered children. Please register child first.</option>
                  ) : (
                    children.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} (DOB: {new Date(c.dateOfBirth).toLocaleDateString()})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Vaccine Milestone *</label>
                <select
                  className="form-select"
                  value={formData.vaccineId}
                  onChange={(e) => setFormData({ ...formData, vaccineId: e.target.value })}
                  required
                >
                  {vaccines.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.ageLabel}) - {v.diseasePrevented}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Appointment Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot *</label>
                  <select
                    className="form-select"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    required
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attending Doctor / Specialist</label>
                <select
                  className="form-select"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                >
                  <option value="">Any Available Pediatrician</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.hospitalOrClinic || 'City Clinic'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hospital or Clinic Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.hospitalOrClinic}
                  onChange={(e) => setFormData({ ...formData, hospitalOrClinic: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Notes (Special requests or queries)</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Mild cold symptoms last week, check if safe to administer"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={children.length === 0}>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
