// src/pages/AdminOrder.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  STATUS_LABELS, STATUS_BADGE,
  sendQuote, markInProgress, uploadDraft,
  uploadCorrected, unlockDownload, addMessage,
} from "../utils/orders";
import toast from "react-hot-toast";
import { Send, ArrowLeft, Upload, CheckCircle, MessageSquare, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminOrder() {
  const { id }             = useParams();
  const { user, profile }  = useAuth();
  const navigate           = useNavigate();
  const [order, setOrder]  = useState(null);
  const [loading, setLoading] = useState({});

  // Quote form
  const [price, setPrice]     = useState("");
  const [qDeadline, setQDeadline] = useState("");
  const [qNote, setQNote]     = useState("");

  // Draft / corrected / final URLs
  const [draftUrl, setDraftUrl]       = useState("");
  const [correctedUrl, setCorrectedUrl] = useState("");
  const [finalUrl, setFinalUrl]         = useState("");

  // Message
  const [msgText, setMsgText] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", id), snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [id]);

  function setL(key, val) { setLoading(p => ({ ...p, [key]: val })); }

  async function handleSendQuote() {
    if (!price) return toast.error("Enter a price");
    setL("quote", true);
    try {
      await sendQuote(id, { price: Number(price), deadline: qDeadline, note: qNote });
      toast.success("Quote sent to client!");
    } catch (e) { toast.error(e.message); }
    setL("quote", false);
  }

  async function handleMarkInProgress() {
    setL("progress", true);
    try {
      await markInProgress(id);
      toast.success("Order marked as In Progress");
    } catch (e) { toast.error(e.message); }
    setL("progress", false);
  }

  async function handleUploadDraft() {
    if (!draftUrl.trim()) return toast.error("Paste the draft file URL");
    setL("draft", true);
    try {
      await uploadDraft(id, draftUrl.trim());
      setDraftUrl("");
      toast.success("Draft uploaded and sent to client!");
    } catch (e) { toast.error(e.message); }
    setL("draft", false);
  }

  async function handleUploadCorrected() {
    if (!correctedUrl.trim()) return toast.error("Paste the corrected file URL");
    setL("corrected", true);
    try {
      await uploadCorrected(id, correctedUrl.trim());
      setCorrectedUrl("");
      toast.success("Corrected version sent to client!");
    } catch (e) { toast.error(e.message); }
    setL("corrected", false);
  }

  async function handleUnlockDownload() {
    if (!finalUrl.trim()) return toast.error("Paste the final file URL/download link");
    setL("unlock", true);
    try {
      await unlockDownload(id, finalUrl.trim());
      setFinalUrl("");
      toast.success("Download unlocked for client! Order complete.");
    } catch (e) { toast.error(e.message); }
    setL("unlock", false);
  }

  async function handleSendMsg() {
    if (!msgText.trim()) return;
    try {
      await addMessage(id, {
        senderId:   user.uid,
        senderName: profile?.name || "Admin",
        text:       msgText.trim(),
        isAdmin:    true,
      });
      setMsgText("");
    } catch (e) { toast.error(e.message); }
  }

  if (!order) return <div className="spinner" />;

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <button onClick={() => navigate("/admin")} className="btn btn-glass" style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: 8 }}>{order.topic}</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span className={`badge ${STATUS_BADGE[order.status] || "badge-pending"}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          <span className="muted">Client: {order.clientName} ({order.clientEmail})</span>
          {order.deadline && <span className="muted">Deadline: {order.deadline}</span>}
        </div>
        {order.details && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
            <strong style={{ color: "var(--gold)" }}>Client Requirements:</strong><br />{order.details}
          </div>
        )}
      </div>

      {/* Payment summary */}
      {order.quotedPrice && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>💰 Payment Status</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Total",   val: order.quotedPrice,   paid: null },
              { label: "Advance", val: order.advanceAmount, paid: order.advancePaid },
              { label: "Balance", val: order.finalAmount,   paid: order.finalPaid },
            ].map(p => (
              <div key={p.label} style={{ flex: 1, minWidth: 100, textAlign: "center" }}>
                <div className="muted">{p.label}</div>
                <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1.05rem" }}>₦{Number(p.val || 0).toLocaleString()}</div>
                {p.paid !== null && <span className={`badge ${p.paid ? "badge-paid" : "badge-pending"}`}>{p.paid ? "Paid" : "Pending"}</span>}
              </div>
            ))}
          </div>
          {order.paystackRefs?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {order.paystackRefs.map((r, i) => (
                <div key={i} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
                  [{r.type?.toUpperCase()}] {r.ref} — {r.paidAt}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN ACTIONS ── */}

      {/* 1. Send Quote */}
      {order.status === "pending_quote" && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>💬 Send Quote to Client</h3>
          <div className="grid-2">
            <div>
              <label>Price (₦) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 30000" />
            </div>
            <div>
              <label>Delivery Deadline</label>
              <input type="date" value={qDeadline} onChange={e => setQDeadline(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Note to Client (optional)</label>
            <textarea value={qNote} onChange={e => setQNote(e.target.value)} rows={2} placeholder="Additional notes about the project, scope, etc." />
          </div>
          <button onClick={handleSendQuote} disabled={loading.quote} className="btn btn-gold" style={{ marginTop: 12 }}>
            <Send size={15} /> {loading.quote ? "Sending…" : "Send Quote"}
          </button>
        </div>
      )}

      {/* 2. Mark in progress after advance confirmed */}
      {order.status === "advance_paid" && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.05)" }}>
          <h3 style={{ fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>✅ Advance Payment Received</h3>
          <p className="muted" style={{ marginBottom: 12 }}>Client has paid the advance via Paystack. Begin writing and mark as In Progress.</p>
          <button onClick={handleMarkInProgress} disabled={loading.progress} className="btn btn-green">
            <CheckCircle size={15} /> {loading.progress ? "Updating…" : "Mark as In Progress"}
          </button>
        </div>
      )}

      {/* 3. Upload draft */}
      {["in_progress","advance_paid"].includes(order.status) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>
            <FileText size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Upload Watermarked Draft
          </h3>
          <p className="muted" style={{ marginBottom: 10 }}>Upload the draft to Firebase Storage or Google Drive and paste the shareable link below.</p>
          <input value={draftUrl} onChange={e => setDraftUrl(e.target.value)} placeholder="https://… (Firebase Storage / Drive link)" />
          <button onClick={handleUploadDraft} disabled={loading.draft} className="btn btn-gold" style={{ marginTop: 10 }}>
            <Upload size={15} /> {loading.draft ? "Uploading…" : "Send Draft to Client"}
          </button>
        </div>
      )}

      {/* 4. View corrections & upload corrected version */}
      {order.status === "correction_sent" && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(251,146,60,0.4)", background: "rgba(251,146,60,0.05)" }}>
          <h3 style={{ fontWeight: 700, color: "#fb923c", marginBottom: 12 }}>📥 Supervisor Corrections Received</h3>
          {order.corrections?.map((c, i) => (
            <div key={i} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 10 }}>
              <div className="muted" style={{ marginBottom: 4 }}>Round {i + 1} — {c.sentAt ? format(new Date(c.sentAt), "dd MMM yyyy HH:mm") : ""}</div>
              <p style={{ fontSize: "0.92rem" }}>{c.note}</p>
              {c.fileUrl && <a href={c.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--gold)", fontSize: "0.85rem" }}>📎 Attached file</a>}
            </div>
          ))}
          <hr className="divider" />
          <label>Upload Corrected Version</label>
          <input value={correctedUrl} onChange={e => setCorrectedUrl(e.target.value)} placeholder="https://… (link to corrected document)" />
          <button onClick={handleUploadCorrected} disabled={loading.corrected} className="btn btn-gold" style={{ marginTop: 10 }}>
            <Upload size={15} /> {loading.corrected ? "Sending…" : "Send Corrected Version to Client"}
          </button>
        </div>
      )}

      {/* 5. Unlock download after final payment */}
      {order.status === "final_paid" && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.06)" }}>
          <h3 style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: 10 }}>🔓 Final Payment Received — Unlock Download</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Client has paid in full. Upload the final clean document and mark the order complete.</p>
          <input value={finalUrl} onChange={e => setFinalUrl(e.target.value)} placeholder="https://… (final clean download link)" />
          <button onClick={handleUnlockDownload} disabled={loading.unlock} className="btn btn-gold" style={{ marginTop: 10 }}>
            <CheckCircle size={15} /> {loading.unlock ? "Unlocking…" : "Upload & Unlock Download for Client"}
          </button>
        </div>
      )}

      {/* Order complete */}
      {order.status === "complete" && (
        <div className="card" style={{ marginBottom: 16, textAlign: "center", padding: "28px 20px", borderColor: "rgba(99,102,241,0.4)" }}>
          <div style={{ fontSize: "2.5rem" }}>🎉</div>
          <h3 style={{ fontWeight: 700, color: "#a5b4fc", marginTop: 8 }}>Order Complete!</h3>
          <p className="muted">Client can now download their research document.</p>
        </div>
      )}

      {/* Messaging */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 14, color: "var(--gold)" }}>
          <MessageSquare size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Client Messages
        </h3>
        <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column" }}>
          {(!order.messages || order.messages.length === 0) ? (
            <p className="muted" style={{ textAlign: "center", padding: 20 }}>No messages yet.</p>
          ) : (
            order.messages.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.isAdmin ? "msg-mine" : "msg-theirs"}`}>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>
                  {m.isAdmin ? "🛠️ Admin (You)" : `👤 ${m.senderName}`} · {m.sentAt ? format(new Date(m.sentAt), "HH:mm") : ""}
                </div>
                <p style={{ fontSize: "0.92rem" }}>{m.text}</p>
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Reply to client…"
            onKeyDown={e => e.key === "Enter" && handleSendMsg()} style={{ flex: 1 }} />
          <button onClick={handleSendMsg} className="btn btn-gold" style={{ padding: "10px 16px" }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
