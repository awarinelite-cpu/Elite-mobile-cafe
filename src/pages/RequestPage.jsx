// src/pages/RequestPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createOrder } from "../utils/orders";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

export default function RequestPage() {
  const { state }             = useLocation(); // may carry { topic }
  const preloaded             = state?.topic;
  const { user, profile }     = useAuth();
  const navigate              = useNavigate();

  const [title, setTitle]     = useState(preloaded?.title || "");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title || !details || !deadline) return toast.error("Fill in all fields");
    setLoading(true);
    try {
      const id = await createOrder({
        clientId:        user.uid,
        clientEmail:     user.email,
        clientName:      profile?.name || user.displayName || "Client",
        topic:           title,
        details,
        deadline,
        isCustom:        !preloaded,
        existingTopicId: preloaded?.id || null,
      });
      toast.success("Request submitted! Admin will send you a quote.");
      navigate(`/orders/${id}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-sm" style={{ paddingTop: 48 }}>
      <h1 className="section-title">
        {preloaded ? "📘 Request This Topic" : "✍️ Custom Research Request"}
      </h1>

      {preloaded && (
        <div className="card" style={{ marginBottom: 20, background: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.3)" }}>
          <p style={{ fontWeight: 700, color: "var(--gold)" }}>Selected Topic:</p>
          <p style={{ marginTop: 4 }}>{preloaded.title}</p>
          {preloaded.basePrice && <p style={{ marginTop: 4, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Base price: ₦{Number(preloaded.basePrice).toLocaleString()}</p>}
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!preloaded && (
            <div>
              <label>Research Topic / Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Effect of social media on nursing students' academic performance" />
            </div>
          )}

          <div>
            <label>Project Details & Requirements</label>
            <textarea
              value={details} onChange={e => setDetails(e.target.value)}
              rows={5}
              placeholder="Describe what you need — chapters, pages, referencing style (APA/Vancouver), institution requirements, etc."
            />
          </div>

          <div>
            <label>Desired Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            <Send size={16} />
            {loading ? "Submitting…" : "Submit Request"}
          </button>

          <p className="muted" style={{ textAlign: "center" }}>
            Admin will review your request and send a quote via the messaging system.
          </p>
        </div>
      </div>
    </div>
  );
}
