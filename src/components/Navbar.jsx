// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, LayoutDashboard, ShoppingBag, MessageSquare, CreditCard, LogOut, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const active = (p) => (location.pathname.startsWith(p) ? "nav-link active" : "nav-link");

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">📜 ResearchHub</Link>

      <div className="nav-links">
        {!user ? (
          <Link to="/auth" className="btn btn-gold" style={{ padding: "7px 18px", fontSize: "0.88rem" }}>
            <LogIn size={15} /> Login
          </Link>
        ) : (
          <>
            <Link to="/topics"   className={active("/topics")}>   <BookOpen size={14} /> Topics</Link>
            <Link to="/orders"   className={active("/orders")}>   <ShoppingBag size={14} /> Orders</Link>
            <Link to="/messages" className={active("/messages")}> <MessageSquare size={14} /> Messages</Link>
            <Link to="/payments" className={active("/payments")}> <CreditCard size={14} /> Payments</Link>
            {isAdmin && (
              <Link to="/admin" className={active("/admin")}>
                <LayoutDashboard size={14} /> Admin
              </Link>
            )}
            <button onClick={handleLogout} className="nav-link" style={{ color: "#fca5a5" }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
