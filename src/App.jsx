import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ── Layouts ───────────────────────────────────────────────────────────────
import AdminLayout    from "@/components/layout/AdminLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";
import PublicLayout   from "@/components/layout/PublicLayout";

// ── Public Pages ──────────────────────────────────────────────────────────
import LandingPage        from "@/pages/public/LandingPage";
import LoginPage          from "@/pages/public/LoginPage";
import RegisterPage       from "@/pages/public/RegisterPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import ResetPasswordPage  from "@/pages/public/ResetPasswordPage";

// ── Customer Pages ────────────────────────────────────────────────────────
import CatalogPage          from "@/pages/customer/CatalogPage";
import CustomerDashboard    from "@/pages/customer/CustomerDashboard";
import CustomerMessagesPage from "@/pages/customer/CustomerMessagesPage";
import CustomerOrdersPage   from "@/pages/customer/CustomerOrdersPage";
import CustomizerPage       from "@/pages/customer/CustomizerPage";
import PaymentGatewayPage   from "@/pages/customer/PaymentGatewayPage";

// ── Admin Pages ───────────────────────────────────────────────────────────
import AdminCustomizerPage from "@/pages/admin/AdminCustomizerPage";
import AdminDashboard      from "@/pages/admin/AdminDashboard";
import DesignsPage         from "@/pages/admin/DesignsPage";
import InventoryPage       from "@/pages/admin/InventoryPage";
import MessageHubPage      from "@/pages/admin/MessageHubPage";
import OrderManagementPage from "@/pages/admin/OrderManagementPage";
import ReportsPage         from "@/pages/admin/ReportsPage";
import SystemSettingsPage  from "@/pages/admin/SystemSettingsPage";
import UserAccountsPage    from "@/pages/admin/UserAccountsPage";

// ── Loading screen ────────────────────────────────────────────────────────
function AppLoader() {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100vh',
      background:     '#0a0a0a',
      color:          '#888',
      fontSize:       '14px',
      fontFamily:     'sans-serif',
    }}>
      Loading...
    </div>
  );
}

// ── Route Guards ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user            = useAuthStore(s => s.user);
  const _hasHydrated    = useAuthStore(s => s._hasHydrated);

  if (!_hasHydrated) return <AppLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const fallback = user?.role === "admin"
      ? "/admin/dashboard"
      : "/customer/catalog";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user            = useAuthStore(s => s.user);
  const _hasHydrated    = useAuthStore(s => s._hasHydrated);

  if (!_hasHydrated) return <AppLoader />;

  if (isAuthenticated) {
    const dest = user?.role === "admin"
      ? "/admin/dashboard"
      : "/customer/catalog";
    return <Navigate to={dest} replace />;
  }

  return children;
}

// ── Password Recovery Listener ────────────────────────────────────────────
// Listens for Supabase PASSWORD_RECOVERY event (fired when user clicks
// the reset link in their email) and redirects to /reset-password.
function PasswordRecoveryHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          navigate("/reset-password", { replace: true });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      {/* Listens globally for PASSWORD_RECOVERY across all routes */}
      <PasswordRecoveryHandler />

      <Routes>
        {/* ── Public Routes ─────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login"
            element={<GuestRoute><LoginPage /></GuestRoute>}
          />
          <Route path="register"
            element={<GuestRoute><RegisterPage /></GuestRoute>}
          />
          {/* Password reset flow — accessible without auth */}
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password"  element={<ResetPasswordPage />} />
        </Route>

        {/* ── Customer Routes ───────────────────────────── */}
        <Route
          path="customer"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="catalog" replace />} />
          <Route path="dashboard"             element={<CustomerDashboard />} />
          <Route path="catalog"               element={<CatalogPage />} />
          <Route path="customize"             element={<CustomizerPage />} />
          <Route path="customize/:templateId" element={<CustomizerPage />} />
          <Route path="orders"                element={<CustomerOrdersPage />} />
          <Route path="messages"              element={<CustomerMessagesPage />} />
          <Route path="payment"               element={<PaymentGatewayPage />} />
        </Route>

        {/* ── Admin Routes ──────────────────────────────── */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders"    element={<OrderManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="settings"  element={<SystemSettingsPage />} />
          <Route path="messages"  element={<MessageHubPage />} />
          <Route path="users"     element={<UserAccountsPage />} />
          <Route path="designs"   element={<DesignsPage />} />
          <Route path="customize" element={<AdminCustomizerPage />} />
          <Route path="reports"   element={<ReportsPage />} />
        </Route>

        {/* ── Catch-all ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}