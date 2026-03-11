// src/pages/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  STATUS_LABELS, STATUS_BADGE,
  acceptQuote, recordAdvancePayment, sendCorrections,
  approveFinal, recordFinalPayment, addMessage,
} from "../utils/orders";
import { openPaystack, generateRef } from "../utils/paystack";
import toast from "react-hot-toast";
import { Send, Download, Upload, CheckCircle, MessageSquare, CreditCard } from "lucide-react";
import { format } from "date-fns";

const STEPS = [
  { key: "pending_quote",   label: "Requested" },
  { key: "quoted",          label: "Quoted" },
  { key: "advance_paid",    label: "Advance Paid" },
  { key: "draft_uploaded",  label: "Draft Ready" },
  { key: "correction_sent", label: "Corrections" },
  { key: "corrected",       label: "Revised" },
  { key: "approved",        label: "Approved" },
  { key: "complete",        label: "Complete" },
];
const STEP_ORDER = STEPS.map(s => s.key);

export default function OrderDetail() {
  const { id }              = useParams();
  const { user, profile }   = useAuth();
  const [order, setOrder]   = useState(null);
  const [msgText, setMsgText] = useState("");
  const [corrNote, setCorrNote] = useState("");
  const [loading, setLoading]  = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", id), snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [id]);

  function setL(key, val) { setLoading(p => ({ ...p, [key]: val })); }

  async function handleAcceptQuote() {
    setL("accept", true);
    try {
      await acceptQuote(id);
      toast.success("Quote accepted! Please pay the advance to begin.");
    } catch (e) { toast.error(e.message); }
    setL("accept", false);
  }

  async function handleAdvancePay() {
    setL("advance", true);
    try {
      const ref = generateRef("ADV");
      await openPaystack({
        email:     user.email,
        amountNGN: order.advanceAmount,
        reference: ref,
        label:     `Advance Payment – ${order.topic}`,
        async onSuccess(resp) {
          await recordAdvancePayment(id, resp.reference);
          toast.success("Advance payment confirmed! Work will begin shortly.");
        },
        onClose() { toast("Payment cancelled."); },
      });
    } catch (e) { toast.error(e.message); }
    setL("advance", false);
  }

  async function handleSendCorrections() {
    if (!corrNote.trim()) return toast.error("Please describe the corrections.");
    setL("corr", true);
    try {
      await sendCorrections(id, corrNote, null);
      setCorrNote("");
      toast.success("Supervisor corrections sent to admin!");
    } catch (e) { toast.error(e.message); }
    setL("corr", false);
  }

  async function handleApprove() {
    setL("approve", true);
    try {
      await approveFinal(id);
      toast.success("Version approved! Please make final payment to download.");
    } catch (e) { toast.error(e.message); }
    setL("approve", false);
  }

  async function handleFinalPay() {
    setL("final", true);
    try {
      const ref = generateRef("FIN");
      await openPaystack({
        email:     user.email,
        amountNGN: order.finalAmount,
        reference: ref,
        label:     `Final Payment – ${order.topic}`,
        async onSuccess(resp) {
          await recordFinalPayment(id, resp.reference);
          toast.success("🎉 Final payment confirmed! Your download is now unlocked.");
        },
        onClose() { toast("Payment cancelled."); },
      });
    } catch (e) { toast.error(e.message); }
    setL("final", false);
  }

  async function handleSendMsg() {
    if (!msgText.trim()) return;
    try {
      await addMessage(id, {
        senderId:   user.uid,
        senderName: profile?.name || user.displayName || "Client",
        text:       msgText.trim(),
        isAdmin:    false,
      });
      setMsgText("");
    } catch (e) { toast.error(e.message); }
  }

  if (!order) return <div className="spinner" />;

  const stepIdx = STEP_ORDER.indexOf(order.status);

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>{order.topic}</h1>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span className={`badge ${STATUS_BADGE[order.status] || "badge-pending"}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              {order.deadline && <span className="muted">Deadline: {order.deadline}</span>}
              {order.quotedPrice && (
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>₦{Number(order.quotedPrice).toLocaleString()}</span>
              )}
            </div>
          </div>
          {order.status === "complete" && order.downloadUrl && (
            <a href={order.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-gold">
              <Download size={16} /> Download
            </a>
          )}
        </div>
      </div>

      {/* Step Progress */}
      <div className="steps" style={{ marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s.key} className={`step ${i < stepIdx ? "done" : i === stepIdx ? "active" : ""}`}>
            {i < stepIdx ? "✓ " : ""}{s.label}
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      {order.quotedPrice && (
        <div className="card" style={{ marginBottom: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Total Price", val: `₦${Number(order.quotedPrice).toLocaleString()}` },
            { label: "Advance (50%)", val: `₦${Number(order.advanceAmount).toLocaleString()}`, paid: order.advancePaid },
            { label: "Balance (50%)", val: `₦${Number(order.finalAmount).toLocaleString()}`, paid: order.finalPaid },
          ].map(p => (
            <div key={p.label} style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
              <div className="muted" style={{ marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gold)" }}>{p.val}</div>
              {p.paid !== undefined && (
                <span className={`badge ${p.paid ? "badge-paid" : "badge-pending"}`} style={{ marginTop: 4 }}>
                  {p.paid ? "Paid ✓" : "Pending"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ACTION CARDS ── */}

      {/* 1. Quote received — accept it */}
      {order.status === "quoted" && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.07)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 8 }}>💬 Quote Received</h3>
          <p style={{ marginBottom: 6 }}>Price: <strong style={{ color: "var(--gold)" }}>₦{Number(order.quotedPrice).toLocaleString()}</strong></p>
          {order.quoteDeadline && <p style={{ marginBottom: 6 }}>Deadline: <strong>{order.quoteDeadline}</strong></p>}
          {order.quoteNote && <p className="muted" style={{ marginBottom: 12 }}>{order.quoteNote}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleAcceptQuote} disabled={loading.accept} className="btn btn-gold">
              <CheckCircle size={15} /> {loading.accept ? "Accepting…" : "Accept Quote"}
            </button>
          </div>
        </div>
      )}

      {/* 2. Pay advance */}
      {order.status === "agreed" && !order.advancePaid && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.05)" }}>
          <h3 style={{ fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>💳 Pay Advance to Begin</h3>
          <p className="muted" style={{ marginBottom: 12 }}>
            Pay 50% advance (₦{Number(order.advanceAmount).toLocaleString()}) via Paystack to start your project.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={handleAdvancePay} disabled={loading.advance} className="btn btn-gold">
              <CreditCard size={15} /> {loading.advance ? "Opening Paystack…" : `Pay ₦${Number(order.advanceAmount).toLocaleString()} via Paystack`}
            </button>
            <span className="paystack-badge">🔒 Secure</span>
          </div>
        </div>
      )}

      {/* 3. Draft ready — view & send corrections */}
      {["draft_uploaded","under_review","corrected"].includes(order.status) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>📄 Draft / Corrected Work</h3>
          {order.draftUrl && (
            <a href={order.draftUrl} target="_blank" rel="noreferrer" className="btn btn-glass" style={{ marginBottom: 14, display: "inline-flex" }}>
              <Download size={14} /> View Draft (Watermarked)
            </a>
          )}
          {order.correctedUrl && (
            <a href={order.correctedUrl} target="_blank" rel="noreferrer" className="btn btn-green" style={{ marginBottom: 14, marginLeft: 8, display: "inline-flex" }}>
              <Download size={14} /> View Corrected Version
            </a>
          )}

          {/* Send supervisor corrections */}
          {["draft_uploaded","corrected"].includes(order.status) && (
            <div style={{ marginTop: 10 }}>
              <label>📤 Send Supervisor Correction Notes to Admin</label>
              <textarea
                value={corrNote} onChange={e => setCorrNote(e.target.value)}
                rows={4} placeholder="Paste or type your supervisor's corrections, comments, and required changes here…"
              />
              <button onClick={handleSendCorrections} disabled={loading.corr} className="btn btn-gold" style={{ marginTop: 10 }}>
                <Upload size={15} /> {loading.corr ? "Sending…" : "Send Corrections to Admin"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Corrected — approve final version */}
      {order.status === "corrected" && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.05)" }}>
          <h3 style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: 8 }}>✅ Approve Final Version</h3>
          <p className="muted" style={{ marginBottom: 12 }}>If you and your supervisor are satisfied with the corrected work, approve it to proceed to final payment.</p>
          <button onClick={handleApprove} disabled={loading.approve} className="btn btn-gold">
            <CheckCircle size={15} /> {loading.approve ? "Approving…" : "Approve Final Version"}
          </button>
        </div>
      )}

      {/* 5. Pay final */}
      {order.status === "approved" && !order.finalPaid && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.07)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 8 }}>💰 Final Payment — Unlock Download</h3>
          <p className="muted" style={{ marginBottom: 12 }}>
            Pay the remaining 50% balance (₦{Number(order.finalAmount).toLocaleString()}) to unlock and download your completed research work.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={handleFinalPay} disabled={loading.final} className="btn btn-gold">
              <CreditCard size={15} /> {loading.final ? "Opening Paystack…" : `Pay ₦${Number(order.finalAmount).toLocaleString()} & Download`}
            </button>
            <span className="paystack-badge">🔒 Secure</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: 10 }}>
            🔒 Download is locked until Paystack confirms full payment automatically.
          </p>
        </div>
      )}

      {/* 6. Complete — download */}
      {order.status === "complete" && order.downloadUrl && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.08)", textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: 8 }}>Your Work is Ready!</h3>
          <p className="muted" style={{ marginBottom: 16 }}>Full payment confirmed. Your research document is unlocked.</p>
          <a href={order.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ justifyContent: "center" }}>
            <Download size={18} /> Download Final Document
          </a>
        </div>
      )}

      {/* Corrections history */}
      {order.corrections?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: "var(--gold)" }}>🔄 Correction History</h3>
          {order.corrections.map((c, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="muted" style={{ marginBottom: 4 }}>Round {i + 1} — {c.sentAt ? format(new Date(c.sentAt), "dd MMM yyyy HH:mm") : ""}</div>
              <p style={{ fontSize: "0.9rem" }}>{c.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Messaging */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 14, color: "var(--gold)" }}>
          <MessageSquare size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Messages
        </h3>
        <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column" }}>
          {(!order.messages || order.messages.length === 0) ? (
            <p className="muted" style={{ textAlign: "center", padding: 20 }}>No messages yet. Send a message to the admin below.</p>
          ) : (
            order.messages.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.senderId === user.uid ? "msg-mine" : "msg-theirs"}`}>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>
                  {m.isAdmin ? "🛠️ Admin" : m.senderName} · {m.sentAt ? format(new Date(m.sentAt), "HH:mm") : ""}
                </div>
                <p style={{ fontSize: "0.92rem" }}>{m.text}</p>
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type a message…"
            onKeyDown={e => e.key === "Enter" && handleSendMsg()} style={{ flex: 1 }} />
          <button onClick={handleSendMsg} className="btn btn-gold" style={{ padding: "10px 16px" }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
