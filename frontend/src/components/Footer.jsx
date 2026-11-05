import React from 'react';
import { Syringe, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        padding: '3rem 0 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Syringe size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Vax<span style={{ color: 'var(--primary)' }}>Care</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
              Comprehensive digital immunization management system providing parents, doctors, and health administrators with timely vaccine reminders and immunization tracking.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
              Project Roles
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Parent:</strong> Register children, track schedules, receive timely reminder alerts.</li>
              <li><strong>Doctor:</strong> Record administered vaccines, verify batches, manage appointments.</li>
              <li><strong>Admin:</strong> Manage national vaccine catalog, user accounts, and system analytics.</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
              Immunization Safety
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                WHO and national pediatric guidelines recommend strict adherence to immunization schedules.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={16} color="#0284c7" />
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Pediatric Emergency Hotline: <strong>1-800-VAX-KIDS</strong>
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#94a3b8',
          }}
        >
          <p>© {new Date().getFullYear()} VaxCare E-Vaccine Reminder System. MERN Stack Implementation.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Clinical Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
