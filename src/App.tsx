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
import { ProtectedRoute } from "./components/auth/protected-route";
import { useAuth } from "./contexts/auth-context";
import { UserRole } from "./types/auth";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { useOfflineSync } from "./hooks/use-offline-sync";

// Lazy-load all pages for code splitting — only loads what the user navigates to
const DashboardPage = lazy(() => import("./pages/tenant/dashboard"));
const POSPage = lazy(() => import("./pages/tenant/pos"));
const InventoryPage = lazy(() => import("./pages/tenant/inventory"));
const ReceiptsPage = lazy(() => import("./pages/tenant/receipts"));
const ReceiptDetailPage = lazy(() => import("./pages/tenant/receipt-detail"));
const ExpensesPage = lazy(() => import("./pages/tenant/expenses"));
const CustomersPage = lazy(() => import("./pages/tenant/customers"));
const ReportsPage = lazy(() => import("./pages/tenant/reports"));
const IntelligencePage = lazy(() => import("./pages/tenant/intelligence"));
const SettingsPage = lazy(() => import("./pages/tenant/settings"));
const ChangePasswordPage = lazy(() => import("./pages/tenant/change-password"));
const SupportPage = lazy(() => import("./pages/tenant/support"));
const SalesHistoryPage = lazy(() => import("./pages/tenant/sales"));
const StaffPage = lazy(() => import("./pages/tenant/staff"));
const PayrollPage = lazy(() => import("./pages/tenant/payroll"));
const SuppliersPage = lazy(() => import("./pages/tenant/suppliers"));
const InvoicesPage = lazy(() => import("./pages/tenant/invoices"));
const MobileMoneyPage = lazy(() => import("./pages/tenant/mobile-money"));
const OnlineStorePage = lazy(() => import("./pages/tenant/online-store"));
const AccountingPage = lazy(() => import("./pages/tenant/accounting"));
const ZReportsPage = lazy(() => import("./pages/tenant/z-reports"));
const AirtimePage = lazy(() => import("./pages/tenant/airtime"));
const BillPaymentsPage = lazy(() => import("./pages/tenant/bill-payments"));
const CreditSalesPage = lazy(() => import("./pages/tenant/credit-sales"));
const ReturnsPage = lazy(() => import("./pages/tenant/returns"));
const ProfitAnalysisPage = lazy(() => import("./pages/tenant/profit-analysis"));
const PromotionsPage = lazy(() => import("./pages/tenant/promotions"));
const ActivityLogsPage = lazy(() => import("./pages/tenant/activity-logs"));
const BranchesPage = lazy(() => import("./pages/tenant/branches"));

const LoginPage = lazy(() => import("./pages/auth/login"));
const ResetPasswordPage = lazy(() => import("./pages/auth/reset-password"));
const VerifyReceiptPage = lazy(() => import("./pages/verify-receipt"));

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
import { PWAUpdatePrompt } from "./components/pwa-update-prompt";
import { ScrollToTop } from "./components/scroll-to-top";

export default function App() {
  const { authInitialized, isAuthenticated } = useAuth();
  useOfflineSync();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="oboy-yankee-theme">
      <ErrorBoundary>
        <Toaster position="top-right" richColors expand={false} theme="dark" />
        <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          {!authInitialized ? (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
               <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <Routes>
            <Route element={<AppLayout />}>
              {/* Auth */}
              <Route path="/login" element={isAuthenticated ? <Navigate to="/pos" replace /> : <LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.STORE_KEEPER, UserRole.SALES_OFFICER]}><DashboardPage /></ProtectedRoute>} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/receipts" element={<ReceiptsPage />} />
                <Route path="/receipts/:receiptId" element={<ReceiptDetailPage />} />
                <Route path="/sales" element={<SalesHistoryPage />} />
                <Route path="/invoices" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT]}><InvoicesPage /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.STORE_KEEPER, UserRole.ACCOUNTANT]}><ExpensesPage /></ProtectedRoute>} />
                <Route path="/accounting" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.ACCOUNTANT]}><AccountingPage /></ProtectedRoute>} />
                <Route path="/mobile-money" element={<MobileMoneyPage />} />
                <Route path="/staff" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.HR]}><StaffPage /></ProtectedRoute>} />
                <Route path="/payroll" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.HR]}><PayrollPage /></ProtectedRoute>} />
                <Route path="/suppliers" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.STORE_KEEPER]}><SuppliersPage /></ProtectedRoute>} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/online-store" element={<OnlineStorePage />} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.SALES_OFFICER, UserRole.STORE_KEEPER]}><ReportsPage /></ProtectedRoute>} />
                <Route path="/intelligence" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.SALES_OFFICER, UserRole.STORE_KEEPER]}><IntelligencePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN]}><SettingsPage /></ProtectedRoute>} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/z-reports" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER]}><ZReportsPage /></ProtectedRoute>} />
                <Route path="/airtime" element={<AirtimePage />} />
                <Route path="/bill-payments" element={<BillPaymentsPage />} />
                <Route path="/credit-sales" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT]}><CreditSalesPage /></ProtectedRoute>} />
                <Route path="/returns" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.STORE_KEEPER]}><ReturnsPage /></ProtectedRoute>} />
                <Route path="/profit-analysis" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT]}><ProfitAnalysisPage /></ProtectedRoute>} />
                <Route path="/promotions" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.STORE_KEEPER]}><PromotionsPage /></ProtectedRoute>} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/activity-logs" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MANAGER]}><ActivityLogsPage /></ProtectedRoute>} />
                <Route path="/branches" element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN]}><BranchesPage /></ProtectedRoute>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/pos" : "/login"} replace />} />
            </Route>
          </Routes>
          )}
        </Suspense>
      </BrowserRouter>
      <PWAUpdatePrompt />
     </ErrorBoundary>
    </ThemeProvider>
  );
}
