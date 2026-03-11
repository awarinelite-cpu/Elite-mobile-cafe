// src/pages/OrdersPage.jsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { STATUS_LABELS, STATUS_BADGE } from "../utils/orders";
import { format } from "date-fns";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function OrdersPage() {
  const { user }         = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate          = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <h1 className="section-title">📦 My Orders</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <ShoppingBag size={40} style={{ color: "var(--gold)", margin: "0 auto 12px" }} />
          <p style={{ color: "rgba(255,255,255,0.6)" }}>No orders yet. Browse topics or submit a custom request.</p>
          <button onClick={() => navigate("/topics")} className="btn btn-gold" style={{ marginTop: 16 }}>
            Browse Topics
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {orders.map(o => (
            <div key={o.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{o.topic}</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span className={`badge ${STATUS_BADGE[o.status] || "badge-pending"}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  {o.quotedPrice && (
                    <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.9rem" }}>
                      ₦{Number(o.quotedPrice).toLocaleString()}
                    </span>
                  )}
                  {o.createdAt?.toDate && (
                    <span className="muted">{format(o.createdAt.toDate(), "dd MMM yyyy")}</span>
                  )}
                  {o.deadline && <span className="muted">Due: {o.deadline}</span>}
                </div>
              </div>
              {/* Action hints */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                {o.status === "quoted" && (
                  <span style={{ fontSize: "0.8rem", color: "#fb923c", fontWeight: 700 }}>⚡ Quote awaiting your response</span>
                )}
                {o.status === "draft_uploaded" && (
                  <span style={{ fontSize: "0.8rem", color: "#86efac", fontWeight: 700 }}>📄 Draft ready to review</span>
                )}
                {o.status === "corrected" && (
                  <span style={{ fontSize: "0.8rem", color: "#86efac", fontWeight: 700 }}>✅ Corrected work ready</span>
                )}
                {o.status === "approved" && !o.finalPaid && (
                  <span style={{ fontSize: "0.8rem", color: "#fcd34d", fontWeight: 700 }}>💳 Final payment needed</span>
                )}
                {o.status === "complete" && (
                  <span style={{ fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700 }}>⬇️ Ready to download</span>
                )}
                <button onClick={() => navigate(`/orders/${o.id}`)} className="btn btn-glass" style={{ padding: "7px 14px", fontSize: "0.85rem" }}>
                  View <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
