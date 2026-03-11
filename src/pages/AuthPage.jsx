// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { login, register }     = useAuth();
  const navigate                = useNavigate();

  async function handleSubmit() {
    if (!email || !password) return toast.error("Fill in all fields");
    if (mode === "register" && !name) return toast.error("Enter your name");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await register(email, password, name);
        toast.success("Account created!");
      }
      navigate("/topics");
    } catch (e) {
      toast.error(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-sm" style={{ paddingTop: 80 }}>
      <div className="card">
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.12)", marginBottom: 28 }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "12px", fontWeight: 700, fontSize: "0.95rem",
              background: "none", border: "none", cursor: "pointer",
              color: mode === m ? "var(--gold)" : "rgba(255,255,255,0.45)",
              fontFamily: "var(--font)",
              borderBottom: mode === m ? "2px solid var(--gold)" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              {m === "login" ? <><LogIn size={14} style={{ verticalAlign: "middle", marginRight: 6 }}/>Login</> : <><UserPlus size={14} style={{ verticalAlign: "middle", marginRight: 6 }}/>Register</>}
            </button>
          ))}
        </div>

        <h2 style={{ fontWeight: 700, fontSize: "1.4rem", color: "var(--gold)", marginBottom: 24, textAlign: "center" }}>
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div>
              <label>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Adaeze Okonkwo" />
            </div>
          )}
          <div>
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>
            {mode === "login" ? "No account? " : "Have an account? "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{
              background: "none", border: "none", color: "var(--gold)", cursor: "pointer",
              fontWeight: 700, fontFamily: "var(--font)", fontSize: "0.85rem",
            }}>
              {mode === "login" ? "Register here" : "Login instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
