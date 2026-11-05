import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Syringe,
  Bell,
  CalendarCheck,
  ShieldCheck,
  Heart,
  Stethoscope,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert(`Demo login error: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #075985 60%, #0284c7 100%)',
          color: 'white',
          padding: '5rem 0 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ShieldCheck size={16} color="#38bdf8" />
              <span>Smart E-Vaccine & Pediatric Health Tracking</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: '1.25rem',
              }}
            >
              Never Miss a Crucial <span style={{ color: '#38bdf8' }}>Vaccine</span> for Your Child.
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#e2e8f0',
                marginBottom: '2rem',
                lineHeight: 1.6,
                maxWidth: '650px',
              }}
            >
              Automated immunization schedules from birth to childhood, proactive reminder alerts,
              certified doctor administration tracking, and role-based access for parents,
              pediatricians, and clinic administrators.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ backgroundColor: '#0284c7' }}>
                  Go to {user?.role ? user.role.toUpperCase() : ''} Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" style={{ backgroundColor: '#0284c7' }}>
                    Register Child & Get Schedule <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/vaccines"
                    className="btn btn-outline btn-lg"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    View Vaccine Guide
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Evaluation Panel */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'inline-block',
                width: '100%',
                maxWidth: '720px',
              }}
            >
              <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
                🚀 QUICK EVALUATION DEMO LOGINS (Click to Login Directly):
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleQuickDemoLogin('parent@evaccine.com', 'parent123')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#e11d48', color: 'white' }}
                >
                  <Heart size={14} /> Login as Parent (Emily Doe)
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('doctor@evaccine.com', 'doctor123')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#0d9488', color: 'white' }}
                >
                  <Stethoscope size={14} /> Login as Doctor (Dr. Jenkins)
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('admin@evaccine.com', 'admin123')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#0284c7', color: 'white' }}
                >
                  <ShieldCheck size={14} /> Login as Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Capabilities Section */}
      <section style={{ padding: '5rem 0 3rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Tailored Role Experience
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>
              Built for Every Healthcare Stakeholder
            </h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Our platform coordinates between families, clinics, and health authorities with custom workflows.
            </p>
          </div>

          <div className="grid-3">
            {/* Parent Card */}
            <div className="card card-hover" style={{ borderTop: '4px solid #e11d48' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#ffe4e6',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                For Parents & Guardians
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Register your child once and get a complete, automatic immunization timeline from birth to 5+ years.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Auto-calculated vaccine due dates
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Timely overdue & upcoming alerts
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Easy appointment booking with pediatricians
                </li>
              </ul>
            </div>

            {/* Doctor Card */}
            <div className="card card-hover" style={{ borderTop: '4px solid #0d9488' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#ccfbf1',
                  color: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Stethoscope size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                For Doctors & Clinics
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Effortlessly verify patient histories, record dose administrations, and verify vaccine batch records.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Patient directory & dose verification
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Batch number & clinical remarks logging
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Manage & confirm appointment requests
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="card card-hover" style={{ borderTop: '4px solid #0284c7' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                For Health Administrators
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Maintain the master vaccine catalog, manage clinic staff and parent accounts, and monitor system immunization metrics.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Manage standard national vaccine catalog
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> User role assignments & permissions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" /> Real-time vaccination coverage statistics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ backgroundColor: '#f1f5f9', padding: '4rem 0' }}>
        <div className="container">
          <div className="grid-4">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                <Clock size={36} style={{ margin: '0 auto' }} />
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Zero Setup Scheduling</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Enter child birthdate once; 15+ vital vaccine milestones are calculated automatically.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ color: '#e11d48', marginBottom: '0.75rem' }}>
                <Bell size={36} style={{ margin: '0 auto' }} />
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Smart Reminders</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Proactive notifications for upcoming and overdue doses to ensure full immunity.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ color: '#0d9488', marginBottom: '0.75rem' }}>
                <CalendarCheck size={36} style={{ margin: '0 auto' }} />
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Online Booking</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Schedule vaccination slots with pediatricians at registered local clinics.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ color: '#6366f1', marginBottom: '0.75rem' }}>
                <Syringe size={36} style={{ margin: '0 auto' }} />
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Digital Health Record</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Official immunization pass with doctor stamps, batch IDs, and administration dates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
