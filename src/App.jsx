// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import LandingPage    from "./pages/LandingPage";
import AuthPage       from "./pages/AuthPage";
import TopicsPage     from "./pages/TopicsPage";
import RequestPage    from "./pages/RequestPage";
import OrdersPage     from "./pages/OrdersPage";
import OrderDetail    from "./pages/OrderDetail";
import MessagesPage   from "./pages/MessagesPage";
import PaymentsPage   from "./pages/PaymentsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrder     from "./pages/AdminOrder";
import Navbar         from "./components/Navbar";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/orders" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/auth"    element={user ? <Navigate to="/topics" /> : <AuthPage />} />
        <Route path="/topics"  element={<PrivateRoute><TopicsPage /></PrivateRoute>} />
        <Route path="/request" element={<PrivateRoute><RequestPage /></PrivateRoute>} />
        <Route path="/orders"  element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="/messages"   element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/payments"   element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
        {/* Admin */}
        <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrder /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(26,58,10,0.95)",
              color: "#fff",
              border: "1px solid rgba(212,175,55,0.4)",
              fontFamily: "'Times New Roman', Times, serif",
              fontWeight: 700,
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
