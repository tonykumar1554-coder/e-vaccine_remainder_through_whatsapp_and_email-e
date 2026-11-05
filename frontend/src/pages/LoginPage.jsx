import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Syringe, LogIn, AlertCircle, Heart, Stethoscope, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Syringe size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome Back to VaxCare
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access your role-based dashboard & immunization records
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div
          style={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            One-Click Demo Auto-Fill:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('parent@evaccine.com', 'parent123')}
              className="btn btn-sm"
              style={{ backgroundColor: '#ffffff', color: '#e11d48', border: '1px solid #fecdd3', fontSize: '0.75rem' }}
            >
              <Heart size={12} /> Parent
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('doctor@evaccine.com', 'doctor123')}
              className="btn btn-sm"
              style={{ backgroundColor: '#ffffff', color: '#0d9488', border: '1px solid #99f6e4', fontSize: '0.75rem' }}
            >
              <Stethoscope size={12} /> Doctor
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@evaccine.com', 'admin123')}
              className="btn btn-sm"
              style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '1px solid #bfdbfe', fontSize: '0.75rem' }}
            >
              <ShieldCheck size={12} /> Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748b',
            }}
          >
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
