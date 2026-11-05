import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { remindersAPI } from '../services/api';
import {
  Syringe,
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  BookOpen,
  UserCheck,
  LogOut,
  Menu,
  X,
  Shield,
  Stethoscope,
  Heart,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll or fetch unread reminder count if logged in
  useEffect(() => {
    if (isAuthenticated) {
      remindersAPI
        .getAll()
        .then((res) => {
          if (res.success) {
            setUnreadCount(res.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getRoleIcon = () => {
    if (role === 'admin') return <Shield size={14} color="#0284c7" />;
    if (role === 'doctor') return <Stethoscope size={14} color="#0d9488" />;
    return <Heart size={14} color="#e11d48" />;
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: isActive ? 'var(--primary)' : '#475569',
    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Syringe size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Vax<span style={{ color: 'var(--primary)' }}>Care</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                }}
              >
                E-REMINDER
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '-2px' }}>
              Immunization & Vaccine Tracker
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links - Dynamic by Role */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-nav"
        >
          {!isAuthenticated ? (
            // GUEST MENU
            <>
              <NavLink to="/" style={navLinkStyle}>
                Home
              </NavLink>
              <NavLink to="/vaccines" style={navLinkStyle}>
                <BookOpen size={16} /> Vaccine Guide
              </NavLink>
            </>
          ) : (
            // ROLE-BASED MENUS
            <>
              <NavLink to="/dashboard" style={navLinkStyle}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>

              {role === 'parent' && (
                <>
                  <NavLink to="/children" style={navLinkStyle}>
                    <Users size={16} /> My Children
                  </NavLink>
                  <NavLink to="/appointments" style={navLinkStyle}>
                    <Calendar size={16} /> Appointments
                  </NavLink>
                  <NavLink to="/vaccines" style={navLinkStyle}>
                    <Syringe size={16} /> Schedule
                  </NavLink>
                </>
              )}

              {role === 'doctor' && (
                <>
                  <NavLink to="/children" style={navLinkStyle}>
                    <Users size={16} /> Patient Registry
                  </NavLink>
                  <NavLink to="/appointments" style={navLinkStyle}>
                    <Calendar size={16} /> Appointments
                  </NavLink>
                  <NavLink to="/vaccines" style={navLinkStyle}>
                    <Syringe size={16} /> Vaccines Catalog
                  </NavLink>
                </>
              )}

              {role === 'admin' && (
                <>
                  <NavLink to="/vaccines" style={navLinkStyle}>
                    <Syringe size={16} /> Manage Vaccines
                  </NavLink>
                  <NavLink to="/admin/users" style={navLinkStyle}>
                    <UserCheck size={16} /> Manage Users
                  </NavLink>
                  <NavLink to="/children" style={navLinkStyle}>
                    <Users size={16} /> All Children
                  </NavLink>
                  <NavLink to="/appointments" style={navLinkStyle}>
                    <Calendar size={16} /> Appointments
                  </NavLink>
                </>
              )}

              {/* Reminders menu with badge */}
              <NavLink to="/reminders" style={navLinkStyle}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span>Reminders</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Auth Actions (Login/Register or User Profile + Logout) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getRoleIcon()}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    {user?.name?.split(' ')[0]}
                  </p>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--primary-dark)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Log Out"
                style={{ color: '#ef4444', borderColor: '#fecaca' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#334155',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {isAuthenticated ? (
            <>
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.5rem',
                }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {user?.email} • <strong style={{ textTransform: 'capitalize' }}>{role}</strong>
                </p>
              </div>

              <Link
                to="/dashboard"
                style={navLinkStyle({ isActive: false })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link
                to="/children"
                style={navLinkStyle({ isActive: false })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users size={18} /> {role === 'parent' ? 'My Children' : 'Patient Children'}
              </Link>
              <Link
                to="/vaccines"
                style={navLinkStyle({ isActive: false })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Syringe size={18} /> Vaccines & Schedule
              </Link>
              <Link
                to="/appointments"
                style={navLinkStyle({ isActive: false })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar size={18} /> Appointments
              </Link>
              <Link
                to="/reminders"
                style={navLinkStyle({ isActive: false })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell size={18} /> Reminders ({unreadCount})
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin/users"
                  style={navLinkStyle({ isActive: false })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCheck size={18} /> Manage Users
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.5rem', color: '#ef4444' }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/" style={navLinkStyle({ isActive: false })} onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link
                to="/vaccines"
                style={navLinkStyle({ isActive: false })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen size={18} /> Vaccine Guide
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Media query styling for responsive navbar */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
