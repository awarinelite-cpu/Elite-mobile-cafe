// src/pages/MessagesPage.jsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function MessagesPage() {
  const { user, isAdmin }     = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    let q;
    if (isAdmin) {
      q = query(collection(db, "orders"), orderBy("updatedAt", "desc"));
    } else {
      q = query(collection(db, "orders"), where("clientId", "==", user.uid), orderBy("updatedAt", "desc"));
    }
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(o => o.messages?.length > 0));
      setLoading(false);
    });
    return unsub;
  }, [user.uid, isAdmin]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <h1 className="section-title">
        <MessageSquare size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
        Messages
      </h1>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <MessageSquare size={40} style={{ color: "var(--gold)", margin: "0 auto 12px" }} />
          <p className="muted">No conversations yet. Messages appear here once you have active orders.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map(o => {
            const lastMsg = o.messages[o.messages.length - 1];
            return (
              <div key={o.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center", cursor: "pointer" }}
                onClick={() => navigate(isAdmin ? `/admin/orders/${o.id}` : `/orders/${o.id}`)}>
                <MessageSquare size={22} style={{ color: "var(--gold)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{o.topic}</h3>
                  {lastMsg && (
                    <>
                      <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <strong>{lastMsg.isAdmin ? "Admin" : lastMsg.senderName}:</strong> {lastMsg.text}
                      </p>
                      <span className="muted" style={{ fontSize: "0.78rem" }}>
                        {lastMsg.sentAt ? format(new Date(lastMsg.sentAt), "dd MMM HH:mm") : ""}
                      </span>
                    </>
                  )}
                </div>
                <ArrowRight size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
