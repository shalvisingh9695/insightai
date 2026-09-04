import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Lock, Mail, User, LogOut, UserCheck } from 'lucide-react';
import { NavigationSection, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { loginUserApi, registerUserApi } from '../api/resumeApi';

interface NavbarProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  onQuickScan?: () => void;
  user?: UserProfile | null;
  onLoginSuccess?: (user: UserProfile) => void;
  onLogout?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'orange') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  onQuickScan,
  user,
  onLoginSuccess,
  onLogout,
  onShowToast
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Minimal menu per user requirement: Dashboard, Features
  const navLinks: { id: NavigationSection; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'features', label: 'Features' }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setAuthError(null);
    setIsLoading(true);

    try {
      let res;
      if (authMode === 'register') {
        res = await registerUserApi(loginName || loginEmail.split('@')[0], loginEmail, loginPassword);
      } else {
        res = await loginUserApi(loginEmail, loginPassword, loginName);
      }

      if (res && res.user) {
        const loggedUser: UserProfile = {
          id: res.user.id || 'user_1',
          name: res.user.name || loginName || loginEmail.split('@')[0],
          email: res.user.email || loginEmail,
          token: res.token
        };

        // Persist login credentials in localStorage
        try {
          localStorage.setItem('insight_ai_user', JSON.stringify(loggedUser));
          localStorage.removeItem('insight_ai_logged_out');
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('jwt_token', res.token);
          }
        } catch (e) {}

        const firstName = loggedUser.name ? loggedUser.name.trim().split(' ')[0] : 'User';

        if (onLoginSuccess) {
          onLoginSuccess(loggedUser);
        }
        if (onShowToast) {
          onShowToast(
            `Welcome, ${firstName}`,
            `Signed in as ${loggedUser.email}. Redirecting to your dashboard...`,
            'success'
          );
        }
        setIsLoginModalOpen(false);

        // Redirect user to dashboard
        onNavigate('dashboard');
      } else if (res && res.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      console.warn('[Auth Request Note]:', err.message);
      const errMsg = err?.response?.data?.error || err.message || 'Authentication failed. Please check credentials.';
      setAuthError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'user_demo',
      name: 'Ayushman Singh',
      email: 'ayushmansingh8957@gmail.com',
      token: 'jwt_demo_token_authenticated'
    };
    try {
      localStorage.setItem('insight_ai_user', JSON.stringify(demoUser));
      localStorage.removeItem('insight_ai_logged_out');
      localStorage.setItem('token', demoUser.token!);
      localStorage.setItem('jwt_token', demoUser.token!);
    } catch (e) {}

    const firstName = demoUser.name.trim().split(' ')[0];

    if (onLoginSuccess) {
      onLoginSuccess(demoUser);
    }
    if (onShowToast) {
      onShowToast(`Welcome, ${firstName}`, 'Signed in successfully. Redirecting to your dashboard...', 'success');
    }
    setIsLoginModalOpen(false);

    // Redirect user to dashboard
    onNavigate('dashboard');
  };

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Shalvi');
  const displayFirstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'Shalvi');

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.4)] py-3'
            : 'bg-[#0F172A]/75 backdrop-blur-md border-b border-slate-800/60 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Name: InsightAI (Left Side, Bold) */}
          <motion.div
            onClick={() => onNavigate('hero')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ED64]/20 to-[#00684A]/30 border border-[#00ED64]/50 flex items-center justify-center text-[#00ED64] shadow-[0_0_20px_rgba(0,237,100,0.3)] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(0,237,100,0.5)] group-hover:border-[#00ED64]">
              <Sparkles className="w-4.5 h-4.5 text-[#00ED64] group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white font-heading leading-tight">
                Insight<span className="text-[#00ED64]">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-400/80 tracking-wider uppercase -mt-0.5">
                Resume Analyzer with RAG
              </span>
            </div>
          </motion.div>

          {/* Right Side: Dashboard, Features / Chat, User Name (Shalvi), Sign Out */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Minimal Desktop Navigation Links: Dashboard, Features */}
            <nav className="flex items-center gap-1.5 p-1 bg-[#1E293B]/70 border border-slate-700/60 rounded-full backdrop-blur-md shadow-inner">
              {navLinks.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 bg-[#00ED64] rounded-full shadow-[0_0_15px_rgba(0,237,100,0.5)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="h-4 w-px bg-slate-700/60 mx-0.5" />

            {/* User Profile (Shalvi) + Sign Out button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div 
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-100 bg-[#1E293B] hover:bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-soft-sm transition-all select-none"
                  title={`Logged in as ${displayName}`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#00ED64]/20 border border-[#00ED64]/50 flex items-center justify-center text-[#00ED64]">
                    <UserCheck className="w-3 h-3 text-[#00ED64]" />
                  </div>
                  <span className="max-w-[130px] truncate">{displayFirstName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ED64] animate-pulse"></span>
                </div>
                {onLogout && (
                  <motion.button
                    id="navbar-logout-btn"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/80 hover:border-rose-500/30 rounded-full transition-all cursor-pointer shadow-soft-sm"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </motion.button>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setAuthError(null);
                  setIsLoginModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 rounded-full transition-all cursor-pointer"
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-800 bg-[#0F172A] px-4 py-4 space-y-3"
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                      currentSection === item.id
                        ? 'bg-[#00ED64]/10 text-[#00ED64]'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                {user ? (
                  <div className="flex items-center justify-between py-2 px-3 bg-slate-800/60 rounded-xl border border-slate-700/70">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#00ED64]/20 border border-[#00ED64]/50 flex items-center justify-center text-[#00ED64]">
                        <UserCheck className="w-3.5 h-3.5 text-[#00ED64]" />
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">{displayFirstName}</span>
                    </div>
                    <button
                      id="mobile-logout-btn"
                      onClick={() => {
                        if (onLogout) onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setIsLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold text-slate-300 py-2 px-3"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Login & Register Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-[#1E293B] rounded-2xl p-6 shadow-2xl border border-slate-700 z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00ED64]/15 border border-[#00ED64]/40 flex items-center justify-center text-[#00ED64]">
                    <Sparkles className="w-3.5 h-3.5 text-[#00ED64]" />
                  </div>
                  <span className="font-bold text-white font-heading">Insight<span className="text-[#00ED64]">AI</span></span>
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-[#0F172A] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-[#00ED64] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-[#00ED64] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {authMode === 'register' ? 'Join InsightAI' : 'Welcome to InsightAI'}
                </h3>
                <p className="text-xs text-slate-400">
                  {authMode === 'register'
                    ? 'Create your account to store resumes and RAG chunks.'
                    : 'Access your saved resumes, RAG chat, and ATS diagnostics.'}
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {authMode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Your Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]/30 transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 25px -2px rgba(0, 237, 100, 0.45)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] text-slate-950 text-xs font-black rounded-xl transition-all shadow-mongo-glow cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Processing...' : authMode === 'register' ? 'Register Account' : 'Sign In'}
                </motion.button>
              </form>

              <div className="pt-2 text-center">
                <button
                  onClick={handleDemoLogin}
                  className="text-xs font-semibold text-[#00ED64] hover:underline cursor-pointer transition-colors"
                >
                  Quick Sign In (Test Account) →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
