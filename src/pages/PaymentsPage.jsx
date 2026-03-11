// src/pages/PaymentsPage.jsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  const { user, isAdmin }       = useAuth();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let q;
    if (isAdmin) {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "orders"), where("clientId", "==", user.uid), orderBy("createdAt", "desc"));
    }
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(o => o.paystackRefs?.length > 0 || o.quotedPrice));
      setLoading(false);
    });
    return unsub;
  }, [user.uid, isAdmin]);

  const totalPaid = orders.reduce((s, o) => {
    let amt = 0;
    if (o.advancePaid) amt += o.advanceAmount || 0;
    if (o.finalPaid)   amt += o.finalAmount   || 0;
    return s + amt;
  }, 0);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <h1 className="section-title">
        <CreditCard size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
        Payments & Invoices
      </h1>

      {/* Summary */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 28 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--gold)" }}>
            ₦{Number(totalPaid).toLocaleString()}
          </div>
          <div className="muted">{isAdmin ? "Total Revenue" : "Total Paid"}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#4ade80" }}>
            {orders.filter(o => o.advancePaid).length}
          </div>
          <div className="muted">Advance Payments</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#a5b4fc" }}>
            {orders.filter(o => o.finalPaid).length}
          </div>
          <div className="muted">Final Payments</div>
        </div>
      </div>

      {/* Payment records */}
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <CreditCard size={36} style={{ color: "var(--gold)", margin: "0 auto 10px" }} />
          <p className="muted">No payment records yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{o.topic}</h3>
                {isAdmin && <span className="muted">{o.clientName}</span>}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 130, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>Total Agreed</div>
                  <div style={{ fontWeight: 700, color: "var(--gold)" }}>₦{Number(o.quotedPrice || 0).toLocaleString()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 130, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>Advance (50%)</div>
                  <div style={{ fontWeight: 700 }}>₦{Number(o.advanceAmount || 0).toLocaleString()}</div>
                  <span className={`badge ${o.advancePaid ? "badge-paid" : "badge-pending"}`} style={{ marginTop: 4 }}>
                    {o.advancePaid ? "Paid" : "Pending"}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 130, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>Balance (50%)</div>
                  <div style={{ fontWeight: 700 }}>₦{Number(o.finalAmount || 0).toLocaleString()}</div>
                  <span className={`badge ${o.finalPaid ? "badge-paid" : "badge-pending"}`} style={{ marginTop: 4 }}>
                    {o.finalPaid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
              {/* Paystack references */}
              {o.paystackRefs?.map((r, i) => (
                <div key={i} style={{ marginTop: 8, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  <span className="paystack-badge" style={{ marginRight: 8 }}>PAYSTACK</span>
                  [{r.type?.toUpperCase()}] Ref: {r.ref} · {r.paidAt}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
