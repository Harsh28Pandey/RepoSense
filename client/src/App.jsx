import React, { useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

// Layouts & Guards
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import DesktopOnlyGuard from './components/DesktopOnlyGuard';
import ScrollManager from './components/ScrollManager';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy-loaded Auth Pages
const SigninPage = lazy(() => import('./pages/SigninPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'));
const VerifyGithubPage = lazy(() => import('./pages/VerifyGithubPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Lazy-loaded App Tabs
const DashboardTab = lazy(() => import('./pages/tabs/DashboardTab'));
const ScanTab = lazy(() => import('./pages/tabs/ScanTab'));
const ReadMeTab = lazy(() => import('./pages/tabs/ReadMeTab'));
const ReviewTab = lazy(() => import('./pages/tabs/ReviewTab'));
const DocsTab = lazy(() => import('./pages/tabs/DocsTab'));
const OnboardTab = lazy(() => import('./pages/tabs/OnboardTab'));
const IssuesTab = lazy(() => import('./pages/tabs/IssuesTab'));
const HealthTab = lazy(() => import('./pages/tabs/HealthTab'));
const DigestTab = lazy(() => import('./pages/tabs/DigestTab'));
const FixTab = lazy(() => import('./pages/tabs/FixTab'));
const ChatTab = lazy(() => import('./pages/tabs/ChatTab'));
const DevUiPage = lazy(() => import('./pages/DevUiPage'));

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingUser } = useStore();
  const location = useLocation();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#EEF1F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2F6FDE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

// Unauthenticated Route Guard
function UnauthenticatedOnly({ children }) {
  const { isAuthenticated, isLoadingUser } = useStore();
  if (isLoadingUser) return null;
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const { fetchUser } = useStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <DesktopOnlyGuard>
      <BrowserRouter>
        <ScrollManager />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#F7F8FA',
              color: '#1F2A37',
              borderRadius: '1rem',
              border: '1px solid #D3D9E2'
            }
          }}
        />
        <ErrorBoundary>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/dev/ui" element={<DevUiPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Auth Layout Routes */}
            <Route element={<AuthLayout />}>
              <Route
                path="/signin"
                element={
                  <UnauthenticatedOnly>
                    <SigninPage />
                  </UnauthenticatedOnly>
                }
              />
              <Route
                path="/signup"
                element={
                  <UnauthenticatedOnly>
                    <SignupPage />
                  </UnauthenticatedOnly>
                }
              />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/verify-github" element={<VerifyGithubPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected App Routes (/app/*) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardTab />} />
              <Route path="scan" element={<ScanTab />} />
              <Route path="readme" element={<ReadMeTab />} />
              <Route path="review" element={<ReviewTab />} />
              <Route path="docs" element={<DocsTab />} />
              <Route path="onboard" element={<OnboardTab />} />
              <Route path="issues" element={<IssuesTab />} />
              <Route path="health" element={<HealthTab />} />
              <Route path="digest" element={<DigestTab />} />
              <Route path="fix" element={<FixTab />} />
              <Route path="chat/*" element={<ChatTab />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </DesktopOnlyGuard>
  );
}
