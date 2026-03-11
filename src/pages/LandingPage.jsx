// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import { BookOpen, MessageSquare, Shield, Download, RefreshCw, CreditCard } from "lucide-react";

const features = [
  { icon: <BookOpen size={28} />, title: "Rich Topic Catalog",       desc: "Browse pre-uploaded research topics or submit your own custom topic for expert writing." },
  { icon: <MessageSquare size={28}/>, title: "Direct Messaging",     desc: "Chat with the admin in real time to negotiate price, deadline, and scope." },
  { icon: <CreditCard size={28} />, title: "Auto Paystack Payments", desc: "Pay securely via card, bank transfer, or USSD. 50% advance, 50% on completion." },
  { icon: <RefreshCw size={28} />,   title: "Correction Loop",       desc: "Send your supervisor's corrections to admin. Admin applies them and returns the revised work." },
  { icon: <Shield size={28} />,      title: "Payment-Gated Download",desc: "Final document is locked until full payment is confirmed by Paystack — automatically." },
  { icon: <Download size={28} />,    title: "Secure Delivery",       desc: "Download your completed research directly from your secure order dashboard." },
];

const steps = [
  { n:"01", label:"Browse or Request a Topic" },
  { n:"02", label:"Negotiate Price with Admin" },
  { n:"03", label:"Pay 50% Advance via Paystack" },
  { n:"04", label:"Receive Watermarked Draft" },
  { n:"05", label:"Send Supervisor Corrections" },
  { n:"06", label:"Admin Applies Corrections" },
  { n:"07", label:"Approve Final Version" },
  { n:"08", label:"Pay 50% Balance — Download Unlocked" },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{
        minHeight: "88vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "60px 24px",
        background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)",
      }}>
        <div style={{ fontSize: "0.85rem", letterSpacing: 4, color: "var(--gold)", fontWeight: 700, marginBottom: 16, textTransform: "uppercase" }}>
          Professional Research Writing Services
        </div>
        <h1 style={{
          fontSize: "clamp(2.2rem,6vw,4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.2,
          textShadow: "2px 2px 12px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.2)",
          maxWidth: 750, margin: "0 auto 20px",
        }}>
          Expert Research & Academic Writing — On Demand
        </h1>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", maxWidth: 580, marginBottom: 36, lineHeight: 1.7 }}>
          Choose from our curated topic catalog or submit your own. We negotiate, write, revise, and deliver — securely gated behind Paystack auto-payments.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/auth" className="btn btn-gold" style={{ fontSize: "1rem", padding: "13px 32px" }}>
            Get Started
          </Link>
          <Link to="/topics" className="btn btn-glass" style={{ fontSize: "1rem", padding: "13px 32px" }}>
            Browse Topics
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="page">
        <h2 className="section-title" style={{ textAlign: "center" }}>Why ResearchHub?</h2>
        <div className="grid-3" style={{ marginBottom: 60 }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ textAlign: "center" }}>
              <div style={{ color: "var(--gold)", marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.05rem" }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="section-title" style={{ textAlign: "center" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, marginBottom: 60 }}>
          {steps.map((s) => (
            <div key={s.n} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                minWidth: 42, height: 42, borderRadius: "50%",
                background: "rgba(212,175,55,0.15)", border: "2px solid var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 700, color: "var(--gold)",
              }}>{s.n}</div>
              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>
            Ready to Start Your Research?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 24 }}>
            Create a free account and browse our topic catalog today.
          </p>
          <Link to="/auth" className="btn btn-gold" style={{ fontSize: "1rem", padding: "13px 36px" }}>
            Create Account — It's Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "24px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.45)", fontSize: "0.85rem",
      }}>
        © {new Date().getFullYear()} ResearchHub · Powered by Firebase + Paystack · Deployed on Render
      </footer>
    </div>
  );
}
