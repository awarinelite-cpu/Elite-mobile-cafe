import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, BookOpen } from 'lucide-react';
import { getTopics } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../components/common/StatusHelpers';

export default function TopicsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    getTopics(category ? { category } : {})
      .then(setTopics)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = topics.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (topic) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/request' } } });
      return;
    }
    navigate('/request', { state: { topic } });
  };

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <span className="section-eyebrow">Research Library</span>
          <h2 style={{ marginBottom: 12 }}>Browse Available Topics</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 520 }}>
            Choose from our curated library of research topics, or scroll down to submit a custom request.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input className="form-input" placeholder="Search topics…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <select className="form-select" style={{ flex: '0 1 220px' }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || category) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); }}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen /></div>
            <h3>No topics found</h3>
            <p style={{ marginBottom: 20 }}>Try a different search or browse all categories.</p>
            <button className="btn btn-primary" onClick={() => navigate('/request')}>
              Submit Custom Request <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(topic => (
              <div key={topic.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 20px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {topic.category}
                    </span>
                    {topic.level && <span className="badge badge-active">{topic.level}</span>}
                  </div>
                  <h4 style={{ marginBottom: 8, lineHeight: 1.3 }}>{topic.title}</h4>
                  <p style={{ fontSize: '0.87rem', color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {topic.description}
                  </p>
                </div>
                {topic.estimatedPrice && (
                  <div style={{ padding: '0 20px', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--forest)', fontWeight: 600 }}>
                      Est. from ₦{Number(topic.estimatedPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{ padding: '14px 20px 20px', marginTop: 'auto' }}>
                  <button className="btn btn-primary btn-full btn-sm" onClick={() => handleSelect(topic)}>
                    Select This Topic <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 64, background: 'var(--forest)', borderRadius: 16, padding: '40px 36px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--cream)', marginBottom: 8 }}>Don't see your topic?</h3>
            <p style={{ color: 'rgba(245,240,227,0.7)', maxWidth: 440 }}>
              Submit a fully custom research request — provide your topic, specifications, academic level and deadline.
            </p>
          </div>
          <button className="btn btn-gold btn-lg" onClick={() => navigate('/request')}>
            Custom Request <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
