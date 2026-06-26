/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { AppLayout } from "./layouts/app-layout";
import { TenantLayout } from "./layouts/tenant-layout";
import { RoleGuard } from "./components/auth/role-guard";
import { useAuth } from "./contexts/auth-context";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { useOfflineSync } from "./hooks/use-offline-sync";

import DashboardPage from "./pages/tenant/dashboard";
import POSPage from "./pages/tenant/pos";
import InventoryPage from "./pages/tenant/inventory";
import ReceiptsPage from "./pages/tenant/receipts";
import ReceiptDetailPage from "./pages/tenant/receipt-detail";
import ExpensesPage from "./pages/tenant/expenses";
import CustomersPage from "./pages/tenant/customers";
import ReportsPage from "./pages/tenant/reports";
import IntelligencePage from "./pages/tenant/intelligence";
import SettingsPage from "./pages/tenant/settings";
import SupportPage from "./pages/tenant/support";
import SalesHistoryPage from "./pages/tenant/sales";
import StaffPage from "./pages/tenant/staff";
import PayrollPage from "./pages/tenant/payroll";
import SuppliersPage from "./pages/tenant/suppliers";
import InvoicesPage from "./pages/tenant/invoices";
import MobileMoneyPage from "./pages/tenant/mobile-money";
import OnlineStorePage from "./pages/tenant/online-store";
import AccountingPage from "./pages/tenant/accounting";

import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import VerifyReceiptPage from "./pages/verify-receipt";

const LoadingFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
    <div className="relative">
      <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 animate-pulse flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
      <div className="absolute inset-0 h-20 w-20 rounded-3xl bg-indigo-500 blur-2xl opacity-10 animate-pulse" />
    </div>
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/40">OBOY YANKEE ENTERPRISE</span>
      <div className="flex gap-1 mt-2">
        {[1, 2, 3].map(i => <div key={i} className="h-1 w-4 bg-indigo-500/20 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
        </div>)}
      </div>
    </div>
  </div>
);

import { ErrorBoundary } from "./components/error-boundary";

export default function App() {
  const { authInitialized, isAuthenticated } = useAuth();
  useOfflineSync();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="oboy-yankee-theme">
      <ErrorBoundary>
        <Toaster position="top-right" richColors expand={false} theme="dark" />
        <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          {!authInitialized ? (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
               <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <Routes>
            <Route element={<AppLayout />}>
              {/* Auth */}
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

              {/* Public receipt verification */}
              <Route path="/verify-receipt/:receiptId" element={<VerifyReceiptPage />} />

              {/* Protected Enterprise Routes */}
              <Route
                element={
                  <RoleGuard>
                    <TenantLayout />
                  </RoleGuard>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/receipts" element={<ReceiptsPage />} />
                <Route path="/receipts/:receiptId" element={<ReceiptDetailPage />} />
                <Route path="/sales" element={<SalesHistoryPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/accounting" element={<AccountingPage />} />
                <Route path="/mobile-money" element={<MobileMoneyPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/online-store" element={<OnlineStorePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/intelligence" element={<IntelligencePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/support" element={<SupportPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Route>
          </Routes>
          )}
        </Suspense>
      </BrowserRouter>
     </ErrorBoundary>
    </ThemeProvider>
  );
}

