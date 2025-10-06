import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx'
import { Suspense, lazy } from 'react'
import Dashboard from './pages/dashboard'
import LoginPage from './pages/index'
const HomePage = lazy(() => import('./pages/home'))
const FeaturesPage = lazy(() => import('./pages/features'))
const PricingPage = lazy(() => import('./pages/pricing'))
const ContactPage = lazy(() => import('./pages/contact'))
const SignupPage = lazy(() => import('./pages/signup'))
const PaymentsPage = lazy(() => import('./pages/payments'))
const NotFoundPage = lazy(() => import('./pages/not-found'))
import Profile from './pages/profile'
import Reports from './pages/reports'
import Subscription from './pages/subscription'
import CustomersList from './pages/customers/index'
import CustomerNew from './pages/customers/new'
import CustomerDetail from './pages/customers/[id]'
import InvoicesList from './pages/invoices/index'
import InvoiceDetail from './pages/invoices/[id]'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
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
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoicesList />
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  )
}


