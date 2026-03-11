import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllOrders, getAllTopicsAdmin, createTopic, updateTopic,
  deleteTopic, updateOrder, uploadDeliverable, sendMessage
} from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, timeAgo, CATEGORIES, ACADEMIC_LEVELS } from '../../components/common/StatusHelpers';
import { Plus, Upload, Trash2, Edit2, X, Send, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Orders', 'Topics'];

export default function AdminPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [topicModal, setTopicModal] = useState(null);
  const [topicForm, setTopicForm] = useState({ title: '', category: '', description: '', level: '', estimatedPrice: '' });
  const [savingTopic, setSavingTopic] = useState(false);

  const [quoteModal, setQuoteModal] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ price: '', advancePercent: '50', message: '' });
  const [sendingQuote, setSendingQuote] = useState(false);

  const [uploadingId, setUploadingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const unsub = getAllOrders(data => { setOrders(data); setLoading(false); });
    getAllTopicsAdmin().then(setTopics);
    return unsub;
  }, []);

  const openTopicModal = (topic = null) => {
    setTopicForm(topic
      ? { title: topic.title, category: topic.category, description: topic.description || '', level: topic.level || '', estimatedPrice: topic.estimatedPrice || '' }
      : { title: '', category: '', description: '', level: '', estimatedPrice: '' });
    setTopicModal(topic || 'new');
  };

  const saveTopic = async () => {
    if (!topicForm.title || !topicForm.category) return toast.error('Title and category required.');
    setSavingTopic(true);
    try {
      if (topicModal === 'new') {
        const docRef = await createTopic(topicForm);
        setTopics(t => [{ id: docRef.id, ...topicForm, active: true }, ...t]);
        toast.success('Topic created!');
      } else {
        await updateTopic(topicModal.id, topicForm);
        setTopics(t => t.map(x => x.id === topicModal.id ? { ...x, ...topicForm } : x));
        toast.success('Topic updated!');
      }
      setTopicModal(null);
    } catch { toast.error('Failed to save topic.'); }
    finally { setSavingTopic(false); }
  };

  const toggleTopicActive = async (topic) => {
    await updateTopic(topic.id, { active: !topic.active });
    setTopics(t => t.map(x => x.id === topic.id ? { ...x, active: !topic.active } : x));
  };

  const removeTopic = async (id) => {
    if (!window.confirm('Delete this topic?')) return;
    await deleteTopic(id);
    setTopics(t => t.filter(x => x.id !== id));
    toast.success('Topic deleted.');
  };

  const openQuote = (order) => {
    setQuoteForm({ price: order.agreedPrice || '', advancePercent: order.advancePercent || '50', message: '' });
    setQuoteModal(order);
  };

  const sendQuote = async () => {
    if (!quoteForm.price) return toast.error('Enter a price.');
    setSendingQuote(true);
    try {
      await updateOrder(quoteModal.id, {
        agreedPrice: Number(quoteForm.price),
        advancePercent: Number(quoteForm.advancePercent),
        status: 'negotiating',
      });
      await sendMessage(quoteModal.id, {
        text: quoteForm.message || `Hi! We've reviewed your request and propose ₦${Number(quoteForm.price).toLocaleString()} for this project.`,
        senderId: user.uid,
        senderName: profile?.displayName || 'The Elites Team',
        senderRole: 'admin',
        quoteData: { price: quoteForm.price, advancePercent: quoteForm.advancePercent },
      });
      toast.success('Quote sent to client!');
      setQuoteModal(null);
    } catch { toast.error('Failed to send quote.'); }
    finally { setSendingQuote(false); }
  };

  const updateStatus = async (orderId, status) => {
    await updateOrder(orderId, { status });
    toast.success(`Status updated to ${status}`);
  };

  const handleUpload = async (orderId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(orderId);
    setUploadProgress(0);
    try {
      await uploadDeliverable(orderId, file, setUploadProgress);
      toast.success('File uploaded! Status set to awaiting final payment.');
    } catch { toast.error('Upload failed.'); }
    finally { setUploadingId(null); setUploadProgress(0); }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['submitted', 'negotiating', 'advance_due'].includes(o.status)).length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.balancePaid).reduce((s, o) => s + Number(o.agreedPrice || 0), 0),
  };

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <span className="section-eyebrow">Admin Panel</span>
          <h2>Management Dashboard</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Total Orders', val: stats.total },
            { label: 'Pending Review', val: stats.pending },
            { label: 'In Progress', val: stats.inProgress },
            { label: 'Completed', val: stats.completed },
            { label: 'Total Revenue', val: `₦${stats.revenue.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="card card-pad" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--forest)' }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--cream-dark)', padding: 4, borderRadius: 10, width: 'fit-content', marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 24px', borderRadius: 8, border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--forest)' : 'var(--muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === 'Orders' && (
          loading ? <div className="loading-center"><div className="spinner" /></div> :
          orders.length === 0 ? (
            <div className="empty-state"><h3>No orders yet</h3></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {orders.map(order => (
                <div key={order.id} className="card" style={{ padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{order.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>👤 {order.clientName}</span>
                        {order.category && <span>📂 {order.category}</span>}
                        <span>🕐 {timeAgo(order.createdAt)}</span>
                        {order.deadline && <span>📅 Due: {order.deadline}</span>}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/order/${order.id}`)}>View / Chat</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openQuote(order)}>
                      <DollarSign size={14} /> {order.agreedPrice ? `₦${Number(order.agreedPrice).toLocaleString()}` : 'Set Quote'}
                    </button>
                    {order.status === 'negotiating' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(order.id, 'advance_due')}>→ Advance Due</button>
                    )}
                    {order.status === 'in_progress' && (
                      <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                        <Upload size={14} />
                        {uploadingId === order.id ? `${uploadProgress}%` : 'Upload File'}
                        <input type="file" style={{ display: 'none' }} onChange={e => handleUpload(order.id, e)} />
                      </label>
                    )}
                    {order.agreedPrice && (
                      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', display: 'flex', gap: 10 }}>
                        {order.advancePaid ? <span style={{ color: '#2a5c45' }}>✓ Advance</span> : <span style={{ color: 'var(--muted)' }}>○ Advance</span>}
                        {order.balancePaid ? <span style={{ color: '#2a5c45' }}>✓ Balance</span> : <span style={{ color: 'var(--muted)' }}>○ Balance</span>}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TOPICS TAB */}
        {tab === 'Topics' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button className="btn btn-primary" onClick={() => openTopicModal()}>
                <Plus size={16} /> Add Topic
              </button>
            </div>
            {topics.length === 0 ? (
              <div className="empty-state"><h3>No topics yet</h3><p>Add topics so clients can browse and select them.</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {topics.map(topic => (
                  <div key={topic.id} className="card card-pad" style={{ opacity: topic.active ? 1 : 0.55 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{topic.category}</span>
                      <span className={`badge badge-${topic.active ? 'active' : 'inactive'}`}>{topic.active ? 'Active' : 'Hidden'}</span>
                    </div>
                    <h4 style={{ marginBottom: 6 }}>{topic.title}</h4>
                    {topic.description && <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 8 }}>{topic.description}</p>}
                    {topic.estimatedPrice && <p style={{ fontSize: '0.82rem', color: 'var(--forest)', fontWeight: 600, marginBottom: 10 }}>Est. ₦{Number(topic.estimatedPrice).toLocaleString()}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openTopicModal(topic)}><Edit2 size={13} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleTopicActive(topic)}>{topic.active ? 'Hide' : 'Show'}</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#c0392b' }} onClick={() => removeTopic(topic.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOPIC MODAL */}
      {topicModal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>{topicModal === 'new' ? 'New Topic' : 'Edit Topic'}</h4>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setTopicModal(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: 24 }}>
              {[['title', 'Topic Title *'], ['description', 'Description'], ['estimatedPrice', 'Estimated Price (₦)']].map(([key, label]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  {key === 'description'
                    ? <textarea className="form-textarea" rows={3} value={topicForm[key]} onChange={e => setTopicForm(f => ({ ...f, [key]: e.target.value }))} />
                    : <input className="form-input" type={key === 'estimatedPrice' ? 'number' : 'text'} value={topicForm[key]} onChange={e => setTopicForm(f => ({ ...f, [key]: e.target.value }))} />
                  }
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={topicForm.category} onChange={e => setTopicForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={topicForm.level} onChange={e => setTopicForm(f => ({ ...f, level: e.target.value }))}>
                    <option value="">Any</option>
                    {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-full" disabled={savingTopic} onClick={saveTopic}>
                {savingTopic ? 'Saving…' : topicModal === 'new' ? 'Create Topic' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUOTE MODAL */}
      {quoteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Send Price Quote</h4>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setQuoteModal(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginBottom: 20 }}>For: <strong>{quoteModal.title}</strong></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Total Price (₦) *</label>
                  <input className="form-input" type="number" value={quoteForm.price} onChange={e => setQuoteForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 25000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Advance %</label>
                  <select className="form-select" value={quoteForm.advancePercent} onChange={e => setQuoteForm(f => ({ ...f, advancePercent: e.target.value }))}>
                    {[30, 40, 50, 60, 70].map(p => <option key={p} value={p}>{p}%</option>)}
                  </select>
                </div>
              </div>
              {quoteForm.price && (
                <div style={{ background: 'var(--gold-pale)', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16, color: 'var(--forest)' }}>
                  Advance: ₦{Math.round(quoteForm.price * quoteForm.advancePercent / 100).toLocaleString()} · Balance: ₦{Math.round(quoteForm.price * (100 - quoteForm.advancePercent) / 100).toLocaleString()}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Message to Client (optional)</label>
                <textarea className="form-textarea" rows={3} value={quoteForm.message}
                  onChange={e => setQuoteForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Add context, timeline, or any notes…" />
              </div>
              <button className="btn btn-primary btn-full" disabled={sendingQuote} onClick={sendQuote}>
                <Send size={16} /> {sendingQuote ? 'Sending…' : 'Send Quote to Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
