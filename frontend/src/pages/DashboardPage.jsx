import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI, childrenAPI, vaccinesAPI, appointmentsAPI } from '../services/api';
import {
  Users,
  Syringe,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Heart,
  Baby,
  RefreshCw,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, role } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await statsAPI.getDashboard();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [role]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <RefreshCw size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading {role} dashboard metrics...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background:
            role === 'admin'
              ? 'linear-gradient(135deg, #0f172a, #0369a1)'
              : role === 'doctor'
              ? 'linear-gradient(135deg, #042f2e, #0d9488)'
              : 'linear-gradient(135deg, #4c0519, #be123c)',
          color: 'white',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {role === 'admin' && <ShieldCheck size={14} />}
              {role === 'doctor' && <Stethoscope size={14} />}
              {role === 'parent' && <Heart size={14} />}
              {role} PORTAL
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
            {role === 'parent' && 'Monitor and protect your child’s health with automated vaccine schedules.'}
            {role === 'doctor' && `Pediatric Care Hub - ${user?.hospitalOrClinic || 'City Immunization Clinic'}`}
            {role === 'admin' && 'Central Administration & Master Vaccine Repository Control.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {role === 'parent' && (
            <Link to="/children" className="btn" style={{ backgroundColor: 'white', color: '#be123c', fontWeight: 700 }}>
              <Baby size={16} /> Register Child
            </Link>
          )}
          {role === 'doctor' && (
            <Link to="/children" className="btn" style={{ backgroundColor: 'white', color: '#0d9488', fontWeight: 700 }}>
              <Syringe size={16} /> Administer Vaccine
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/vaccines" className="btn" style={{ backgroundColor: 'white', color: '#0369a1', fontWeight: 700 }}>
              <Syringe size={16} /> Add Vaccine
            </Link>
          )}
          <button
            onClick={fetchDashboard}
            className="btn"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ----------------- PARENT VIEW ----------------- */}
      {role === 'parent' && dashboardData && (
        <>
          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>My Children</span>
                <Baby size={20} color="#e11d48" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>
                {dashboardData.metrics?.totalChildren || 0}
              </p>
              <Link to="/children" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
                Manage Children <ArrowRight size={12} />
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Completed Doses</span>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#10b981' }}>
                {dashboardData.metrics?.completedRecords || 0}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Protection Rate: <strong>{dashboardData.metrics?.completionRate || 0}%</strong>
              </span>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Due Soon</span>
                <Clock size={20} color="#f59e0b" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#f59e0b' }}>
                {dashboardData.metrics?.dueRecords || 0}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Scheduled in next 14 days</span>
            </div>

            <div className="card" style={{ borderColor: dashboardData.metrics?.overdueRecords > 0 ? '#fecaca' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>Overdue Vaccines</span>
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#ef4444' }}>
                {dashboardData.metrics?.overdueRecords || 0}
              </p>
              <Link to="/reminders" style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
                Check Alerts Now <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Children Quick Overview */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Registered Children</h3>
                <Link to="/children" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>

              {(!dashboardData.children || dashboardData.children.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <Baby size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No children registered yet.</p>
                  <Link to="/children" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                    Register Child
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardData.children.map((child) => (
                    <div
                      key={child._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#ffe4e6',
                            color: '#e11d48',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{child.name}</h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Born: {new Date(child.dateOfBirth).toLocaleDateString()} • Blood: {child.bloodGroup}
                          </p>
                        </div>
                      </div>

                      <Link to={`/children/${child._id}`} className="btn btn-outline btn-sm">
                        View Schedule
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Due Vaccination Milestones */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upcoming / Due Doses</h3>
                <Link to="/vaccines" className="btn btn-outline btn-sm">
                  Full Catalog
                </Link>
              </div>

              {(!dashboardData.nextDueRecords || dashboardData.nextDueRecords.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All current immunization milestones are up to date!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardData.nextDueRecords.map((rec) => (
                    <div
                      key={rec._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${
                          rec.status === 'Overdue' ? '#ef4444' : rec.status === 'Due' ? '#f59e0b' : '#3b82f6'
                        }`,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rec.vaccine?.name}</span>
                          <span className={`badge badge-${rec.status.toLowerCase()}`}>{rec.status}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Child: <strong>{rec.child?.name}</strong> • Due: {new Date(rec.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <Link
                        to="/appointments"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      >
                        Book Slot
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ----------------- DOCTOR VIEW ----------------- */}
      {role === 'doctor' && dashboardData && (
        <>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Patients in System</span>
                <Users size={20} color="#0d9488" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>
                {dashboardData.metrics?.totalPatients || 0}
              </p>
              <Link to="/children" style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>
                Open Registry →
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>My Administrations</span>
                <Syringe size={20} color="#0284c7" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#0284c7' }}>
                {dashboardData.metrics?.myAdministered || 0}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Certified vaccine doses</span>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Scheduled Slots</span>
                <Calendar size={20} color="#6366f1" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#6366f1' }}>
                {dashboardData.metrics?.totalScheduledAppointments || 0}
              </p>
              <Link to="/appointments" style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
                Manage Appointments →
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pending Appointments</span>
                <Clock size={20} color="#f59e0b" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#f59e0b' }}>
                {dashboardData.metrics?.pendingAppointments || 0}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Awaiting Doctor Confirmation</span>
            </div>
          </div>

          {/* Upcoming Appointments Table for Doctor */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upcoming Clinic Appointments</h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Patients scheduled for vaccination at your clinic</p>
              </div>
              <Link to="/appointments" className="btn btn-outline btn-sm">
                View All Appointments
              </Link>
            </div>

            {(!dashboardData.upcomingAppointments || dashboardData.upcomingAppointments.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ color: '#64748b' }}>No pending or confirmed appointments at this time.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Child / Patient</th>
                      <th>Vaccine</th>
                      <th>Parent / Contact</th>
                      <th>Date & Slot</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.upcomingAppointments.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.child?.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            DOB: {new Date(app.child?.dateOfBirth).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            {app.vaccine?.name || 'General Consultation'}
                          </span>
                        </td>
                        <td>
                          {app.parent?.name}
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.parent?.phone}</div>
                        </td>
                        <td>
                          <strong>{new Date(app.appointmentDate).toLocaleDateString()}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.timeSlot}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${app.status === 'Confirmed' ? 'completed' : 'due'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/children/${app.child?._id}`} className="btn btn-secondary btn-sm">
                            Administer Vaccine
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ----------------- ADMIN VIEW ----------------- */}
      {role === 'admin' && dashboardData && (
        <>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Users</span>
                <Users size={20} color="#0284c7" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>
                {dashboardData.metrics?.totalUsers || 0}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Parents: <strong>{dashboardData.metrics?.totalParents || 0}</strong> • Doctors: <strong>{dashboardData.metrics?.totalDoctors || 0}</strong>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Registered Children</span>
                <Baby size={20} color="#e11d48" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#e11d48' }}>
                {dashboardData.metrics?.totalChildren || 0}
              </p>
              <Link to="/children" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                View Directory →
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Vaccine Catalog</span>
                <Syringe size={20} color="#0d9488" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#0d9488' }}>
                {dashboardData.metrics?.totalVaccines || 0}
              </p>
              <Link to="/vaccines" style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>
                Manage Catalog →
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Vaccine Coverage</span>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#10b981' }}>
                {dashboardData.metrics?.completionRate || 0}%
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {dashboardData.metrics?.completedRecords} of {dashboardData.metrics?.totalRecords} doses completed
              </div>
            </div>
          </div>

          {/* Admin Management Links */}
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Vaccine Catalog Management
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Add new vaccines, configure recommended ages, dose counts, routes of administration, and side effects.
                </p>
              </div>
              <Link to="/vaccines" className="btn btn-primary btn-sm">
                Open Vaccine Master
              </Link>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  User & Role Permissions
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Promote users to Doctor or Admin status, inspect registered families, and revoke accounts.
                </p>
              </div>
              <Link to="/admin/users" className="btn btn-outline btn-sm">
                Manage Users
              </Link>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Pediatric Patients Directory
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Audit all children registered in the system, view their immunization completion status, and inspect health histories.
                </p>
              </div>
              <Link to="/children" className="btn btn-outline btn-sm">
                View All Children
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
