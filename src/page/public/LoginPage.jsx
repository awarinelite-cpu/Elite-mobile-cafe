import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : err.message);
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(form.email);
      toast.success('Password reset email sent! Check your inbox.');
      setResetMode(false);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-dark)' }}>
            The Elites <span style={{ color: 'var(--gold)' }}>Mobile Cafe</span>
          </h2>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>
            {resetMode ? 'Reset your password' : 'Sign in to your account'}
          </p>
        </div>

        <div className="card card-pad">
          {!resetMode ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPw ? 'text' : 'password'} required placeholder="Your password"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setResetMode(true)}>
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Email'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setResetMode(false)}>
                ← Back to sign in
              </button>
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--forest)', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
