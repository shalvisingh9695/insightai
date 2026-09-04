import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Github, Mail, Info, CheckCircle2, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterSectionProps {
  onStartUpload: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'orange') => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onStartUpload, onShowToast }) => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      onShowToast('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }
    onShowToast('Subscribed!', 'You are subscribed to weekly career & ATS optimization briefings.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#020617] text-slate-200 pt-20 pb-16 border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle emerald and slate background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-radial from-[#00ED64]/10 via-[#00ED64]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[250px] bg-radial from-[#00684A]/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* High-Impact CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-b from-[#0F172A] to-[#0B1120] border border-slate-700/80 rounded-3xl p-10 sm:p-14 mb-20 shadow-2xl text-center relative overflow-hidden backdrop-blur-sm"
        >
          {/* Internal Glow Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00684A]/20 rounded-full blur-3xl pointer-events-none" />
          {/* Top indicator line */}
          <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-[#00ED64]/70 to-transparent"></div>

          <div className="max-w-3xl mx-auto space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ED64]/15 text-[#00ED64] border border-[#00ED64]/30 text-xs font-bold shadow-[0_0_20px_rgba(0,237,100,0.2)]">
              <Sparkles className="w-4 h-4" />
              <span>Free ATS Resume Audit</span>
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight leading-tight">
              Ready to upgrade your resume?
            </h3>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
              Scan your resume against top ATS parser algorithms, apply quantifiable XYZ bullet rewrites, and boost your recruiter interview callbacks today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 0 35px -2px rgba(0, 237, 100, 0.6)'
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={onStartUpload}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] text-slate-950 text-sm font-black rounded-2xl shadow-mongo-glow transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <Sparkles className="w-4.5 h-4.5 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ED64]" />
                <span>Instant score • 100% Free & Private</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Navigation Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-slate-800/80"
        >
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                className="w-9 h-9 rounded-xl bg-[#00ED64]/15 border border-[#00ED64]/40 flex items-center justify-center text-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.25)] cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5 text-[#00ED64]" />
              </motion.div>
              <span className="font-black text-xl text-white font-heading tracking-tight">
                Insight<span className="text-[#00ED64]">AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Smart AI Resume Analyzer and ATS Optimization engine designed to turn cold tech job applications into interviews.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#00ED64]" />
              <span>Workday, Greenhouse & Lever Calibrated</span>
            </div>
          </div>

          {/* Quick Links: About, Contact, GitHub */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              Quick Links
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li>
                <a 
                  href="#features" 
                  className="flex items-center gap-2 hover:text-[#00ED64] transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-[#00ED64]" />
                  <span>About InsightAI</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@insightai.app" 
                  onClick={(e) => {
                    e.preventDefault();
                    onShowToast('Contact Support', 'Reach us anytime at support@insightai.app', 'info');
                  }}
                  className="flex items-center gap-2 hover:text-[#00ED64] transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00ED64]" />
                  <span>Contact Support</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-[#00ED64] transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-[#00ED64]" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a 
                  href="#resume-dashboard" 
                  className="flex items-center gap-2 hover:text-[#00ED64] transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ED64]" />
                  <span>Live ATS Demo Dashboard</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              Career & ATS Insights
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Get weekly recruiter algorithms breakdowns and high-converting resume templates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ED64] transition-colors"
              />
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 0 20px -2px rgba(0, 237, 100, 0.4)'
                }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] text-slate-950 text-xs font-black rounded-xl shadow-mongo-glow cursor-pointer transition-all shrink-0"
              >
                Join
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} InsightAI. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
