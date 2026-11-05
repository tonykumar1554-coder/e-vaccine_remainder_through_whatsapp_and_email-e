import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { remindersAPI } from '../services/api';
import {
  Bell,
  Check,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const RemindersPage = () => {
  const { role } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReminders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await remindersAPI.getAll();
      if (res.success) {
        setReminders(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching reminder notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await remindersAPI.markRead(id);
      if (res.success) {
        setReminders((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isRead: true } : r))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to update reminder status');
    }
  };

  const handleDismiss = async (id) => {
    try {
      const res = await remindersAPI.dismiss(id);
      if (res.success) {
        setReminders((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      setError(err.message || 'Failed to dismiss reminder');
    }
  };

  const handleTriggerRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const res = await remindersAPI.refreshReminders();
      if (res.success) {
        setSuccessMsg(res.message);
        fetchReminders();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to scan reminders');
    } finally {
      setRefreshing(false);
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
            Vaccine Reminders & Alerts
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Proactive alerts tracking upcoming, due, and overdue vaccination milestones.
          </p>
        </div>

        <button
          onClick={handleTriggerRefresh}
          className="btn btn-outline"
          disabled={refreshing}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Scanning Dates...' : 'Scan & Refresh Alerts'}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Checking vaccination due dates...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3>All Clear! No Active Alerts</h3>
          <p style={{ color: '#64748b', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            There are no pending alerts. All scheduled vaccines are either up to date or upcoming outside the 14-day alert window.
          </p>
          <button onClick={handleTriggerRefresh} className="btn btn-outline btn-sm">
            Run Manual Due Date Scan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reminders.map((rem) => {
            const isOverdue = rem.reminderType === 'Overdue';
            const isDueToday = rem.reminderType === 'Due Today';

            return (
              <div
                key={rem._id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: rem.isRead ? '#ffffff' : isOverdue ? '#fff1f2' : '#f0fdf4',
                  borderLeft: `5px solid ${isOverdue ? '#ef4444' : isDueToday ? '#f59e0b' : '#3b82f6'}`,
                  opacity: rem.isRead ? 0.75 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: isOverdue ? '#fee2e2' : '#e0f2fe',
                      color: isOverdue ? '#ef4444' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isOverdue ? <ShieldAlert size={22} /> : <Bell size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{rem.title}</h3>
                      <span className={`badge badge-${isOverdue ? 'overdue' : 'due'}`}>{rem.reminderType}</span>
                      {rem.isRead && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Read</span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {rem.message}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Due: <strong>{new Date(rem.dueDate).toLocaleDateString()}</strong></span>
                      <span>Target: <strong>{rem.vaccine?.diseasePrevented || 'Pediatric Health'}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <Link
                    to="/appointments"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Calendar size={13} /> Book Slot
                  </Link>

                  {rem.child && (
                    <Link
                      to={`/children/${rem.child._id || rem.child}`}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      View Schedule <ArrowRight size={12} />
                    </Link>
                  )}

                  {!rem.isRead && (
                    <button
                      onClick={() => handleMarkRead(rem._id)}
                      className="btn btn-outline btn-sm"
                      title="Mark as read"
                      style={{ padding: '0.35rem 0.5rem', color: '#10b981' }}
                    >
                      <Check size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDismiss(rem._id)}
                    className="btn btn-outline btn-sm"
                    title="Dismiss alert"
                    style={{ padding: '0.35rem 0.5rem', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
