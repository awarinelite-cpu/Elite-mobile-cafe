import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Signed out successfully');
    setMenuOpen(false);
  };

  const go = (path) => { navigate(path); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => go('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          The Elites <span>Mobile Cafe</span>
        </button>

        {/* Desktop Nav */}
        <div className="nav-links hide-mobile">
          <button className={`nav-link ${isActive('/topics') ? 'active' : ''}`} onClick={() => go('/topics')}>
            Browse Topics
          </button>
          <button className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`} onClick={() => go('/how-it-works')}>
            How It Works
          </button>

          {user && !isAdmin && (
            <>
              <button className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => go('/dashboard')}>
                My Orders
              </button>
              <button className={`nav-link ${isActive('/request') ? 'active' : ''}`} onClick={() => go('/request')}>
                New Request
              </button>
            </>
          )}

          {isAdmin && (
            <button className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => go('/admin')}>
              Admin Panel
            </button>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="nav-links hide-mobile">
          {!user ? (
            <>
              <button className="nav-link" onClick={() => go('/login')}>Sign In</button>
              <button className="nav-cta" onClick={() => go('/register')}>Get Started</button>
            </>
          ) : (
            <>
              <span className="nav-link" style={{ cursor: 'default', opacity: 0.6, fontSize: '0.82rem' }}>
                {profile?.displayName || user.email?.split('@')[0]}
              </span>
              <button className="nav-link" onClick={handleLogout}>Sign Out</button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="btn btn-ghost"
          style={{ display: 'none', padding: '8px' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="mobile-toggle"
        >
          {menuOpen ? <X size={22} color="var(--cream)" /> : <Menu size={22} color="var(--cream)" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--forest-dark)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <button className="nav-link" style={{ textAlign: 'left' }} onClick={() => go('/topics')}>Browse Topics</button>
          <button className="nav-link" style={{ textAlign: 'left' }} onClick={() => go('/how-it-works')}>How It Works</button>
          {user && !isAdmin && (
            <>
              <button className="nav-link" style={{ textAlign: 'left' }} onClick={() => go('/dashboard')}>My Orders</button>
              <button className="nav-link" style={{ textAlign: 'left' }} onClick={() => go('/request')}>New Request</button>
            </>
          )}
          {isAdmin && (
            <button className="nav-link" style={{ textAlign: 'left' }} onClick={() => go('/admin')}>Admin Panel</button>
          )}
          {!user ? (
            <>
              <button className="nav-link" style={{ textAlign: 'left' }} onClick={() => go('/login')}>Sign In</button>
              <button className="nav-cta" style={{ marginTop: 8, width: '100%' }} onClick={() => go('/register')}>Get Started</button>
            </>
          ) : (
            <button className="nav-link" style={{ textAlign: 'left' }} onClick={handleLogout}>Sign Out</button>
          )}
        </div>
      )}

      {/* Mobile CSS injection */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
