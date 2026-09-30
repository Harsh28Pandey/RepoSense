import { AuthModalProvider } from "./context/AuthModalContext";
import React from 'react'
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problems from "./components/Problems";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import ReportPreview from "./components/ReportPreview";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import AuthModal from "./components/auth/AuthModal";

export default function App() {
  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main>
          <Hero />
          <Problems />
          <Features />
          <HowItWorks />
          <ReportPreview />
          <FinalCta />
        </main>
        <Footer />
      </div>
      <AuthModal />
    </AuthModalProvider>
  );
}