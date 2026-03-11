import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { CATEGORIES, ACADEMIC_LEVELS } from '../../components/common/StatusHelpers';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate('/dashboard');
      toast.success('Account created! Welcome to The Elites Mobile Cafe.');
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email already registered.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-dark)' }}>
            The Elites <span style={{ color: 'var(--gold)' }}>Mobile Cafe</span>
          </h2>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>Create your free account</p>
        </div>

        <div className="card card-pad">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" required placeholder="Your full name" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} required placeholder="Minimum 6 characters"
                  value={form.password} onChange={set('password')} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" required placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
