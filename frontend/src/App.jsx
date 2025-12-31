import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx'
import { ImportProvider } from './context/ImportContext.jsx'
import { Suspense, lazy } from 'react'
import Dashboard from './pages/dashboard'
import LoginPage from './pages/index'
import SignupPage from './pages/signup'
const PaymentsPage = lazy(() => import('./pages/payments'))
const PaymentNewPage = lazy(() => import('./pages/payments/new.jsx'))
const NotFoundPage = lazy(() => import('./pages/not-found'))
import Profile from './pages/profile'
import Reports from './pages/reports'
import Subscription from './pages/subscription'
import ContactPage from './pages/contact-dashboard'
import AlertsPage from './pages/alerts'
import SettingsPage from './pages/settings'
import MOMPage from './pages/mom'
import LoadingScreen from './pages/loading'
import CustomersList from './pages/customers/index'
import CustomerNew from './pages/customers/new'
import CustomerDetail from './pages/customers/[id]'
import POEntryListPage from './pages/po-entry/list.jsx'
import POEntry from './pages/po-entry/index'
import InvoicesList from './pages/invoices/index'
import InvoiceNewPage from './pages/invoices/new.jsx'
import InvoiceDetail from './pages/invoices/[id]'
import NewPOPage from './pages/dashboard/new-po'
import BoqEntry from './pages/dashboard/boq-entry'
import InvItems from './pages/dashboard/inv-items'
import PaymentSummary from './pages/dashboard/payment-summary'
import MonthlyPlanPage from './pages/dashboard/monthly-plan'
import DebtorsSummaryPage from './pages/dashboard/debtors-summary'
import BoqActualPage from './pages/dashboard/boq-actual'
import PerformancePage from './pages/dashboard/performance'
import OthersPage from './pages/dashboard/others'
import DatabaseManagementPage from './pages/admin/database'
import UsersManagementPage from './pages/admin/users'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function RootGate() {
  const { isAuthenticated, loading } = useAuthContext()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ImportProvider>
        <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <Routes>
        {/* Gate root based on auth */}
        <Route path="/" element={<RootGate />} />
        {/* Loading screen route (used after login) */}
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/new-po"
          element={
            <ProtectedRoute>
              <NewPOPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/monthly-plan"
          element={
            <ProtectedRoute>
              <MonthlyPlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/debtors-summary"
          element={
            <ProtectedRoute>
              <DebtorsSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/boq-actual"
          element={
            <ProtectedRoute>
              <BoqActualPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/performance"
          element={
            <ProtectedRoute>
              <PerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/others"
          element={
            <ProtectedRoute>
              <OthersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/boq-entry"
          element={
            <ProtectedRoute>
              <BoqEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inv-items"
          element={
            <ProtectedRoute>
              <InvItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/payment-summary"
          element={
            <ProtectedRoute>
              <PaymentSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/new"
          element={
            <ProtectedRoute>
              <PaymentNewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute>
              <CustomerNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/po-entry"
          element={
            <ProtectedRoute>
              <POEntryListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/po-entry/new"
          element={
            <ProtectedRoute>
              <POEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/po-entry/:id"
          element={
            <ProtectedRoute>
              <POEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoicesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <ProtectedRoute>
              <InvoiceNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mom"
          element={
            <ProtectedRoute>
              <MOMPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/database"
          element={
            <ProtectedRoute>
              <DatabaseManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </ImportProvider>
    </AuthProvider>
  )
}


