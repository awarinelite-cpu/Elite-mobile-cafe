// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { STATUS_LABELS, STATUS_BADGE } from "../utils/orders";
import { format } from "date-fns";
import { Plus, ArrowRight, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const FILTER_OPTIONS = ["all","pending_quote","quoted","agreed","advance_paid","in_progress","draft_uploaded","correction_sent","corrected","approved","final_paid","complete"];

export default function AdminDashboard() {
  const [orders, setOrders]       = useState([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(true);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: "", category: "", description: "", basePrice: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  // Stats
  const stats = {
    total:    orders.length,
    active:   orders.filter(o => !["complete","pending_quote"].includes(o.status)).length,
    complete: orders.filter(o => o.status === "complete").length,
    revenue:  orders.filter(o => o.finalPaid).reduce((s, o) => s + (o.quotedPrice || 0), 0),
  };

  async function handleAddTopic() {
    if (!topicForm.title) return toast.error("Title is required");
    try {
      await addDoc(collection(db, "topics"), { ...topicForm, createdAt: serverTimestamp() });
      toast.success("Topic added!");
      setTopicForm({ title: "", category: "", description: "", basePrice: "" });
      setShowTopicForm(false);
    } catch (e) { toast.error(e.message); }
  }

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <LayoutDashboard size={24} style={{ color: "var(--gold)" }} />
        <h1 className="section-title" style={{ margin: 0 }}>Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 28 }}>
        {[
          { label: "Total Orders", val: stats.total,    color: "var(--gold)" },
          { label: "Active",       val: stats.active,   color: "#fb923c" },
          { label: "Completed",    val: stats.complete, color: "#4ade80" },
          { label: "Revenue",      val: `₦${Number(stats.revenue).toLocaleString()}`, color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.val}</div>
            <div className="muted" style={{ marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Topic */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowTopicForm(!showTopicForm)} className="btn btn-gold">
          <Plus size={16} /> {showTopicForm ? "Cancel" : "Add Topic to Catalog"}
        </button>

        {showTopicForm && (
          <div className="card" style={{ marginTop: 14 }}>
            <h3 style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>New Topic</h3>
            <div className="grid-2">
              <div>
                <label>Topic Title *</label>
                <input value={topicForm.title} onChange={e => setTopicForm(p => ({...p, title: e.target.value}))} placeholder="Research topic title" />
              </div>
              <div>
                <label>Category</label>
                <input value={topicForm.category} onChange={e => setTopicForm(p => ({...p, category: e.target.value}))} placeholder="e.g. Nursing, Public Health" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Description</label>
              <textarea value={topicForm.description} onChange={e => setTopicForm(p => ({...p, description: e.target.value}))} rows={3} placeholder="Brief description of the topic" />
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Base Price (₦)</label>
              <input type="number" value={topicForm.basePrice} onChange={e => setTopicForm(p => ({...p, basePrice: e.target.value}))} placeholder="e.g. 25000" />
            </div>
            <button onClick={handleAddTopic} className="btn btn-gold" style={{ marginTop: 14 }}>
              <Plus size={15} /> Add Topic
            </button>
          </div>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {["all","pending_quote","in_progress","correction_sent","complete"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn" style={{
            padding: "6px 14px", fontSize: "0.82rem",
            background: filter === f ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${filter === f ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
            color: filter === f ? "var(--gold)" : "rgba(255,255,255,0.6)",
          }}>
            {f === "all" ? "All" : STATUS_LABELS[f] || f}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {loading ? <div className="spinner" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(o => (
            <div key={o.id} className="card" style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: "0.95rem" }}>{o.topic}</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span className={`badge ${STATUS_BADGE[o.status] || "badge-pending"}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span className="muted">{o.clientName}</span>
                  {o.quotedPrice && <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.88rem" }}>₦{Number(o.quotedPrice).toLocaleString()}</span>}
                  {o.createdAt?.toDate && <span className="muted">{format(o.createdAt.toDate(), "dd MMM yyyy")}</span>}
                </div>
                {/* Attention flags */}
                <div style={{ marginTop: 6 }}>
                  {o.status === "pending_quote" && <span style={{ fontSize: "0.78rem", color: "#fb923c", fontWeight: 700 }}>⚡ Needs quote</span>}
                  {o.status === "advance_paid" && <span style={{ fontSize: "0.78rem", color: "#4ade80", fontWeight: 700 }}>✅ Advance paid — start writing</span>}
                  {o.status === "correction_sent" && <span style={{ fontSize: "0.78rem", color: "#fb923c", fontWeight: 700 }}>📥 Corrections received — action needed</span>}
                  {o.status === "final_paid" && <span style={{ fontSize: "0.78rem", color: "#4ade80", fontWeight: 700 }}>💰 Final paid — upload final document</span>}
                </div>
              </div>
              <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="btn btn-gold" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                Manage <ArrowRight size={14} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 24 }}>No orders in this category.</p>}
        </div>
      )}
    </div>
  );
}
