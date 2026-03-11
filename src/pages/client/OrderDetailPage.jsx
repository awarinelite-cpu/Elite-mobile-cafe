import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getOrder, subscribeMessages, sendMessage,
  markMessagesRead, recordPayment, getPayments
} from '../../firebase/services';
import { StatusBadge, StatusProgress, timeAgo, formatCurrency } from '../../components/common/StatusHelpers';
import { Send, Download, Lock, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PAYSTACK_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [payingType, setPayingType] = useState(null);
  const msgEnd = useRef(null);

  useEffect(() => {
    getOrder(id).then(o => { setOrder(o); setLoading(false); });
    const unsub = subscribeMessages(id, setMessages);
    getPayments(id).then(setPayments);
    return unsub;
  }, [id]);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (user) markMessagesRead(id, isAdmin ? 'admin' : 'client'); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await sendMessage(id, {
        text: msg.trim(),
        senderId: user.uid,
        senderName: profile?.displayName || user.email,
        senderRole: isAdmin ? 'admin' : 'client',
      });
      setMsg('');
    } catch { toast.error('Failed to send message.'); }
    finally { setSending(false); }
  };

  const initPaystack = (type) => {
    if (!window.PaystackPop) return toast.error('Paystack not loaded. Check your internet connection.');
    const isAdvance = type === 'advance';
    const total = Number(order.agreedPrice);
    const advancePct = Number(order.advancePercent || 50);
    const amount = isAdvance ? Math.round(total * advancePct / 100) : total - (order.advancePaidAmount || Math.round(total * advancePct / 100));

    setPayingType(type);
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: user.email,
      amount: amount * 100, // kobo
      currency: 'NGN',
      ref: `EMC-${id}-${type}-${Date.now()}`,
      metadata: { orderId: id, paymentType: type, clientId: user.uid },
      onClose: () => setPayingType(null),
      callback: async (response) => {
        try {
          await recordPayment(id, {
            type,
            reference: response.reference,
            amount,
            status: 'success',
          });
          const updated = await getOrder(id);
          setOrder(updated);
          const pay = await getPayments(id);
          setPayments(pay);
          toast.success(isAdvance ? 'Advance payment confirmed! Work begins now.' : '🔓 Final payment complete! Your download is now unlocked.');
        } catch { toast.error('Payment recorded but order update failed. Contact support.'); }
        finally { setPayingType(null); }
      },
    });
    handler.openIframe();
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!order) return <div className="container page-content"><p>Order not found.</p></div>;

  const canViewOrder = isAdmin || order.clientId === user.uid;
  if (!canViewOrder) return <div className="container page-content"><p>Access denied.</p></div>;

  const total = Number(order.agreedPrice || 0);
  const advancePct = Number(order.advancePercent || 50);
  const advanceAmt = Math.round(total * advancePct / 100);
  const balanceAmt = total - advanceAmt;

  return (
    <div className="page-content">
      <div className="container">
        {/* Back */}
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
          <ArrowLeft size={16} /> {isAdmin ? 'Admin Panel' : 'My Orders'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Details + Chat ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Order Info */}
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>Order #{id.slice(-8).toUpperCase()}</span>
                  <h3 style={{ marginTop: 4 }}>{order.title}</h3>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Category', val: order.category || '—' },
                  { label: 'Level', val: order.level || '—' },
                  { label: 'Words', val: order.wordCount ? `~${Number(order.wordCount).toLocaleString()}` : '—' },
                  { label: 'Deadline', val: order.deadline || '—' },
                  { label: 'Ref. Style', val: order.referenceStyle || '—' },
                  { label: 'Submitted', val: timeAgo(order.createdAt) },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.val}</div>
                  </div>
                ))}
              </div>
              {order.instructions && (
                <div style={{ background: 'var(--cream-dark)', borderRadius: 8, padding: '12px 14px', fontSize: '0.87rem', color: '#3a4a42' }}>
                  <strong style={{ display: 'block', marginBottom: 4, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Instructions</strong>
                  {order.instructions}
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <StatusProgress status={order.status} />
              </div>
            </div>

            {/* Chat */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <h4 style={{ margin: 0 }}>Messages</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Negotiate price, ask questions, share updates</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280, maxHeight: 420 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', margin: 'auto' }}>
                    No messages yet. Send a message to start the conversation.
                  </div>
                )}
                {messages.map(m => {
                  const isMine = m.senderId === user.uid;
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '78%', padding: '10px 14px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMine ? 'var(--forest)' : '#f0ece4',
                        color: isMine ? 'var(--cream)' : 'var(--ink)',
                        fontSize: '0.9rem', lineHeight: 1.55,
                      }}>
                        {!isMine && <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, opacity: 0.7 }}>{m.senderName}</div>}
                        {m.text}
                        {m.quoteData && (
                          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 4 }}>💰 PRICE QUOTE</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₦{Number(m.quoteData.price).toLocaleString()}</div>
                            <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{m.quoteData.advancePercent || 50}% advance required</div>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 3 }}>{timeAgo(m.createdAt)}</div>
                    </div>
                  );
                })}
                <div ref={msgEnd} />
              </div>

              <form onSubmit={handleSend} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input className="form-input" placeholder="Type a message…" value={msg} onChange={e => setMsg(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-primary" disabled={sending || !msg.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* ── RIGHT: Payment + Download ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>

            {/* Agreed Price */}
            {order.agreedPrice ? (
              <div className="card card-pad">
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                  Agreed Price
                </div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--forest)', marginBottom: 16 }}>
                  ₦{total.toLocaleString()}
                </div>

                {/* Payment breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {[
                    { label: `Advance (${advancePct}%)`, amount: advanceAmt, paid: order.advancePaid },
                    { label: `Balance (${100 - advancePct}%)`, amount: balanceAmt, paid: order.balancePaid },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: row.paid ? '#d1fae5' : 'var(--cream-dark)', borderRadius: 8 }}>
                      <span style={{ fontSize: '0.85rem' }}>{row.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>₦{row.amount.toLocaleString()}</span>
                        {row.paid && <CheckCircle size={14} color="#065f46" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pay buttons */}
                {!isAdmin && (
                  <>
                    {!order.advancePaid && order.status === 'advance_due' && (
                      <button className="btn btn-gold btn-full" disabled={!!payingType}
                        onClick={() => initPaystack('advance')}>
                        <CreditCard size={16} />
                        {payingType === 'advance' ? 'Processing…' : `Pay Advance ₦${advanceAmt.toLocaleString()}`}
                      </button>
                    )}
                    {order.advancePaid && !order.balancePaid && order.status === 'awaiting_final_payment' && (
                      <button className="btn btn-primary btn-full" disabled={!!payingType}
                        onClick={() => initPaystack('balance')}>
                        <CreditCard size={16} />
                        {payingType === 'balance' ? 'Processing…' : `Pay Balance ₦${balanceAmt.toLocaleString()}`}
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>💬</div>
                <p style={{ fontSize: '0.88rem' }}>Awaiting price quote from our team. Check back in the chat above.</p>
              </div>
            )}

            {/* Download Gate */}
            <div className="card card-pad" style={{ background: order.downloadUnlocked ? 'var(--forest)' : '#f8f4ee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {order.downloadUnlocked
                  ? <CheckCircle size={22} color="var(--gold)" />
                  : <Lock size={22} color="var(--muted)" />}
                <h4 style={{ margin: 0, color: order.downloadUnlocked ? 'var(--cream)' : 'var(--forest)' }}>
                  {order.downloadUnlocked ? 'Download Ready' : 'Download Locked'}
                </h4>
              </div>
              {order.downloadUnlocked && order.deliverableUrl ? (
                <>
                  <p style={{ color: 'rgba(245,240,227,0.8)', fontSize: '0.87rem', marginBottom: 14 }}>
                    Your research document is ready. Final payment confirmed ✓
                  </p>
                  <a href={order.deliverableUrl} download={order.deliverableFileName || 'research.pdf'}
                    className="btn btn-gold btn-full" target="_blank" rel="noreferrer">
                    <Download size={16} /> Download File
                  </a>
                </>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {!order.deliverableUrl
                    ? 'Your deliverable will appear here once work is complete.'
                    : 'Complete the final payment above to unlock your download.'}
                </p>
              )}
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="card card-pad">
                <h4 style={{ marginBottom: 14, fontSize: '0.9rem' }}>Payment History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {payments.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--muted)' }}>{p.type}</span>
                      <span style={{ fontWeight: 600 }}>₦{Number(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paystack script */}
      <script src="https://js.paystack.co/v1/inline.js" async />

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .order-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
