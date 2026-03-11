import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../firebase/services';
import { CATEGORIES, ACADEMIC_LEVELS } from '../../components/common/StatusHelpers';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function RequestPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillTopic = location.state?.topic;

  const [form, setForm] = useState({
    title: prefillTopic?.title || '',
    category: prefillTopic?.category || '',
    level: '',
    wordCount: '',
    deadline: '',
    instructions: '',
    referenceStyle: '',
    topicId: prefillTopic?.id || null,
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Please enter a research topic.');
    setLoading(true);
    try {
      const order = await createOrder({
        ...form,
        clientId: user.uid,
        clientName: profile?.displayName || user.email,
        clientEmail: user.email,
        wordCount: form.wordCount ? Number(form.wordCount) : null,
      });
      toast.success("Request submitted! We'll review it and get back to you shortly.");
      navigate(`/order/${order.id}`);
    } catch (err) {
      toast.error('Failed to submit request. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="container-sm">
        <div style={{ marginBottom: 36 }}>
          <span className="section-eyebrow">New Order</span>
          <h2 style={{ marginBottom: 10 }}>Submit Research Request</h2>
          <p style={{ color: 'var(--muted)' }}>
            {prefillTopic
              ? `You selected: "${prefillTopic.title}" — review and add your requirements below.`
              : 'Fill in the details of your custom research request.'}
          </p>
        </div>

        <div className="card card-pad">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Research Topic *</label>
              <input className="form-input" type="text" required maxLength={200}
                placeholder="Enter your research topic or title"
                value={form.title} onChange={set('title')} />
              <span className="form-hint">Be as specific as possible for accurate pricing.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Academic / Work Level</label>
                <select className="form-select" value={form.level} onChange={set('level')}>
                  <option value="">Select level</option>
                  {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Word Count (approx.)</label>
                <input className="form-input" type="number" min={100} max={100000}
                  placeholder="e.g. 3000" value={form.wordCount} onChange={set('wordCount')} />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={form.deadline} onChange={set('deadline')}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reference / Citation Style</label>
              <select className="form-select" value={form.referenceStyle} onChange={set('referenceStyle')}>
                <option value="">Not specified</option>
                <option>APA 7th Edition</option>
                <option>MLA</option>
                <option>Harvard</option>
                <option>Chicago / Turabian</option>
                <option>Vancouver</option>
                <option>IEEE</option>
                <option>Other (specify in instructions)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Instructions</label>
              <textarea className="form-textarea" rows={5}
                placeholder="Any specific requirements, sources to use/avoid, formatting instructions…"
                value={form.instructions} onChange={set('instructions')} />
            </div>

            <div style={{ background: 'var(--gold-pale)', borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: '0.87rem', color: 'var(--forest)', borderLeft: '3px solid var(--gold)' }}>
              <strong>What happens next?</strong> After submission, our team will review your request and send you a price quote via the messaging system.
            </div>

            <button className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Submitting…' : <><Send size={18} /> Submit Request</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
