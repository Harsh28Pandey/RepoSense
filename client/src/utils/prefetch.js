/**
 * Prefetch utility for lazy loaded route components.
 */

const prefetchMap = {
  // Public routes
  '/': () => import('../pages/LandingPage'),
  '/features': () => import('../pages/FeaturesPage'),
  '/how-it-works': () => import('../pages/HowItWorksPage'),
  '/faq': () => import('../pages/FaqPage'),
  '/about': () => import('../pages/AboutPage'),
  '/contact': () => import('../pages/ContactPage'),
  '/privacy': () => import('../pages/PrivacyPage'),
  
  // Auth routes
  '/signin': () => import('../pages/SigninPage'),
  '/signup': () => import('../pages/SignupPage'),
  '/verify-otp': () => import('../pages/VerifyOtpPage'),
  '/verify-github': () => import('../pages/VerifyGithubPage'),
  '/forgot-password': () => import('../pages/ForgotPasswordPage'),
  '/reset-password': () => import('../pages/ResetPasswordPage'),

  // App routes
  '/app/dashboard': () => import('../pages/tabs/DashboardTab'),
  '/app/scan': () => import('../pages/tabs/ScanTab'),
  '/app/readme': () => import('../pages/tabs/ReadMeTab'),
  '/app/review': () => import('../pages/tabs/ReviewTab'),
  '/app/docs': () => import('../pages/tabs/DocsTab'),
  '/app/onboard': () => import('../pages/tabs/OnboardTab'),
  '/app/issues': () => import('../pages/tabs/IssuesTab'),
  '/app/health': () => import('../pages/tabs/HealthTab'),
  '/app/digest': () => import('../pages/tabs/DigestTab'),
  '/app/fix': () => import('../pages/tabs/FixTab'),
  '/app/chat': () => import('../pages/tabs/ChatTab'),
};

const prefetchedPaths = new Set();

export function prefetchRoute(path) {
  if (!path || prefetchedPaths.has(path)) return;
  const loader = prefetchMap[path];
  if (typeof loader === 'function') {
    prefetchedPaths.add(path);
    loader().catch(() => {
      // Ignore prefetch network errors silently
      prefetchedPaths.delete(path);
    });
  }
}

export function prefetchAppRoutesIdle() {
  const appPaths = [
    '/app/dashboard', '/app/scan', '/app/readme', '/app/review',
    '/app/docs', '/app/onboard', '/app/issues', '/app/health',
    '/app/digest', '/app/fix', '/app/chat'
  ];

  const doPrefetch = () => {
    appPaths.forEach((path) => prefetchRoute(path));
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(doPrefetch);
  } else {
    setTimeout(doPrefetch, 2000);
  }
}
