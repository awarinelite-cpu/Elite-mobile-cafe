// src/pages/TopicsPage.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, ArrowRight } from "lucide-react";

export default function TopicsPage() {
  const [topics, setTopics]   = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    async function load() {
      const q    = query(collection(db, "topics"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTopics(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = topics.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <h1 className="section-title" style={{ margin: 0 }}>📚 Research Topics</h1>
        <button onClick={() => navigate("/request")} className="btn btn-gold">
          <Plus size={16} /> Custom Request
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gold)", opacity: 0.7 }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search topics or categories…"
          style={{ paddingLeft: 44 }}
        />
      </div>

      {loading ? <div className="spinner" /> : (
        filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <BookOpen size={40} style={{ color: "var(--gold)", margin: "0 auto 12px" }} />
            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              {search ? "No topics match your search." : "No topics uploaded yet."}
            </p>
            <button onClick={() => navigate("/request")} className="btn btn-gold" style={{ marginTop: 16 }}>
              Submit Custom Topic
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(t => (
              <div key={t.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <BookOpen size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.4 }}>{t.title}</h3>
                </div>
                {t.category && (
                  <span className="badge badge-active" style={{ alignSelf: "flex-start" }}>{t.category}</span>
                )}
                {t.description && (
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {t.description.slice(0, 130)}{t.description.length > 130 ? "…" : ""}
                  </p>
                )}
                {t.basePrice && (
                  <p style={{ color: "var(--gold)", fontWeight: 700 }}>From ₦{Number(t.basePrice).toLocaleString()}</p>
                )}
                <button
                  onClick={() => navigate("/request", { state: { topic: t } })}
                  className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                >
                  Request This Topic <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Custom request CTA */}
      <div className="card" style={{ marginTop: 40, textAlign: "center", padding: "32px 24px" }}>
        <Plus size={32} style={{ color: "var(--gold)", marginBottom: 10 }} />
        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Don't see your topic?</h3>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 16 }}>Submit a custom research request and we'll get back to you with a quote.</p>
        <button onClick={() => navigate("/request")} className="btn btn-gold">Submit Custom Topic</button>
      </div>
    </div>
  );
}
