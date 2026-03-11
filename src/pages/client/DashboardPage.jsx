import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClientOrders } from '../../firebase/services';
import { StatusBadge, timeAgo } from '../../components/common/StatusHelpers';
import { Plus, ArrowRight, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = getClientOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <span className="section-eyebrow">Client Portal</span>
            <h2>My Orders</h2>
            <p style={{ color: 'var(--muted)', marginTop: 6 }}>Welcome back, {profile?.displayName || 'there'}!</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/request')}>
            <Plus size={16} /> New Request
          </button>
        </div>

        {/* Stats */}
        {orders.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 36 }}>
            {[
              { label: 'Total Orders', val: orders.length },
              { label: 'In Progress', val: (statusCounts.in_progress || 0) + (statusCounts.negotiating || 0) },
              { label: 'Awaiting Payment', val: (statusCounts.advance_due || 0) + (statusCounts.awaiting_final_payment || 0) },
              { label: 'Completed', val: statusCounts.completed || 0 },
            ].map(stat => (
              <div key={stat.label} className="card card-pad" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--forest)' }}>{stat.val}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <h3>No orders yet</h3>
            <p style={{ marginBottom: 24 }}>Browse our topics or submit a custom research request to get started.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/topics')}>Browse Topics</button>
              <button className="btn btn-outline" onClick={() => navigate('/request')}>Custom Request</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate(`/order/${order.id}`)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="var(--forest)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {order.category && <span>{order.category}</span>}
                      {order.level && <span>· {order.level}</span>}
                      <span>· {timeAgo(order.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StatusBadge status={order.status} />
                    {order.agreedPrice && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--forest)', fontWeight: 600 }}>
                        ₦{Number(order.agreedPrice).toLocaleString()}
                      </span>
                    )}
                    <ArrowRight size={16} color="var(--muted)" />
                  </div>
                </div>

                {/* Payment progress bar */}
                {order.agreedPrice && (
                  <div style={{ padding: '0 22px 16px', display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: order.advancePaid ? 'var(--forest)' : 'var(--cream-dark)' }} />
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: order.balancePaid ? 'var(--forest)' : 'var(--cream-dark)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
