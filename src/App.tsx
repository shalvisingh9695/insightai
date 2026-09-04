import React, { useState, useEffect } from 'react';
import { NavigationSection, ToastMessage, ParsedResume, UserProfile } from './types';
import { SAMPLE_RESUMES, SAMPLE_JOB_PRESETS } from './data/mockResumeData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ResumeUploadSection } from './components/ResumeUploadSection';
import { DashboardSection } from './components/DashboardSection';
import { FooterSection } from './components/FooterSection';
import { Toast } from './components/Toast';
import { fetchLatestResume } from './api/resumeApi';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('hero');
  const [activeResume, setActiveResume] = useState<ParsedResume | null>(() => {
    try {
      const saved = localStorage.getItem('insight_ai_latest_resume');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      // Respect explicit user logout across reloads
      if (localStorage.getItem('insight_ai_logged_out') === 'true') {
        return null;
      }
      const saved = localStorage.getItem('insight_ai_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name || parsed.email)) return parsed;
      }
      const defaultUser: UserProfile = {
        id: 'usr-shalvi-01',
        name: 'Shalvi Singh',
        email: 'shalvi.singh@example.com',
        token: 'jwt-token-shalvi'
      };
      localStorage.setItem('insight_ai_user', JSON.stringify(defaultUser));
      return defaultUser;
    } catch (e) {
      return null;
    }
  });

  // Fetch the latest uploaded resume from backend on startup
  useEffect(() => {
    let isMounted = true;
    async function loadLatestResumeData() {
      try {
        const result = await fetchLatestResume();
        if (isMounted && result.success && result.resume) {
          setActiveResume(result.resume);
          try {
            localStorage.setItem('insight_ai_latest_resume', JSON.stringify(result.resume));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Could not fetch latest resume on startup:', err);
      }
    }
    loadLatestResumeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    try {
      localStorage.setItem('insight_ai_user', JSON.stringify(newUser));
      localStorage.removeItem('insight_ai_logged_out');
      if (newUser.token) {
        localStorage.setItem('token', newUser.token);
        localStorage.setItem('jwt_token', newUser.token);
      }
    } catch (e) {}

    const firstName = newUser.name ? newUser.name.trim().split(' ')[0] : 'User';
    addToast(`Welcome, ${firstName}`, 'Logged in successfully. Redirecting to dashboard...', 'success');

    // Automatically redirect user to dashboard upon login
    scrollToSection('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('insight_ai_user');
      localStorage.removeItem('token');
      localStorage.removeItem('jwt_token');
      localStorage.setItem('insight_ai_logged_out', 'true');
    } catch (e) {}
    addToast('Signed Out', 'You have been logged out successfully.', 'info');
  };

  const handleResumeScanned = (scannedResume: ParsedResume) => {
    setActiveResume(scannedResume);
    try {
      localStorage.setItem('insight_ai_latest_resume', JSON.stringify(scannedResume));
    } catch (e) {}
    setCurrentSection('dashboard');
  };

  const handleUpdateResume = (updated: ParsedResume) => {
    setActiveResume(updated);
    try {
      localStorage.setItem('insight_ai_latest_resume', JSON.stringify(updated));
    } catch (e) {}
  };

  // Add toast helper
  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'orange' = 'success'
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const scrollToSection = (sectionId: NavigationSection) => {
    setCurrentSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetId = sectionId === 'upload' ? 'resume-upload' : sectionId === 'dashboard' ? 'resume-dashboard' : 'features';
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          const retryEl = document.getElementById(targetId);
          if (retryEl) {
            retryEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      }
    }
  };

  const handleSelectSampleRole = (presetId: string) => {
    if (SAMPLE_RESUMES[presetId]) {
      setActiveResume(SAMPLE_RESUMES[presetId]);
    } else {
      const preset = SAMPLE_JOB_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setActiveResume((prev) => (prev ? {
          ...prev,
          targetRole: preset.title
        } : null));
      }
    }
    addToast('Target Role Calibrated', `Auditing resume alignment for selected position.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-body selection:bg-[#00ED64]/30 selection:text-[#00ED64] antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={scrollToSection}
        onQuickScan={() => scrollToSection('upload')}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onShowToast={addToast}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <HeroSection
          onStartUpload={() => scrollToSection('upload')}
          onSelectSampleRole={handleSelectSampleRole}
          onExploreDashboard={() => scrollToSection('dashboard')}
        />

        {/* Section 2: Features */}
        <FeaturesSection
          onSelectFeature={(featureId) => {
            if (featureId === 'f-1' || featureId === 'f-6') {
              scrollToSection('dashboard');
            } else {
              scrollToSection('upload');
            }
          }}
        />

        {/* Section 3: Resume Upload */}
        <ResumeUploadSection
          onScanComplete={handleResumeScanned}
          onShowToast={addToast}
        />

        {/* Section 4: Live Dashboard */}
        <DashboardSection
          resumeData={activeResume}
          user={user}
          onUpdateResume={handleUpdateResume}
          onShowToast={addToast}
          onLogout={handleLogout}
        />
      </main>

      {/* Section 5: Dark Footer with High-Impact CTA */}
      <FooterSection
        onStartUpload={() => scrollToSection('upload')}
        onShowToast={addToast}
      />

      {/* Notification Toast Manager */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
