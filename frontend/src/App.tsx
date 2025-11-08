import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import { Skeleton } from './components/ui/skeleton';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const CompanyDetailPage = lazy(() => import('./pages/company/CompanyDetailPage'));
const CreateCompanyPage = lazy(() => import('./pages/company/CreateCompanyPage'));
const AcceptInvitePage = lazy(() => import('./pages/invite/AcceptInvitePage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/new"
            element={
              <ProtectedRoute>
                <CreateCompanyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:id"
            element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accept-invite/:token"
            element={<AcceptInvitePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

