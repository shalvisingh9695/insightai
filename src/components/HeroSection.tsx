import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, FileText, CheckCircle2, Award, Zap } from 'lucide-react';
import { SAMPLE_JOB_PRESETS } from '../data/mockResumeData';
import { motion, AnimatePresence } from 'motion/react';
import heroIllustration from '../assets/images/hero_ai_resume_illustration_1788018409607.jpg';

interface HeroSectionProps {
  onStartUpload: () => void;
  onSelectSampleRole: (roleId: string) => void;
  onExploreDashboard: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartUpload,
  onSelectSampleRole,
  onExploreDashboard
}) => {
  const [selectedRole, setSelectedRole] = useState(SAMPLE_JOB_PRESETS[0].id);

  // Stagger container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="hero" className="relative pt-16 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-hero-gradient">
      {/* Decorative ambient elements with subtle floating animation */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-radial from-[#00ED64]/30 via-[#00684A]/20 to-transparent blur-3xl pointer-events-none -z-10"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Top Feature Pill with subtle floating animation */}
        <motion.div 
          variants={itemVariants} 
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1E293B]/80 border border-slate-700/80 shadow-soft-md hover:border-[#00ED64]/60 backdrop-blur-md transition-all group cursor-default"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#00ED64] animate-ping"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00ED64] bg-[#00ED64]/10 px-2.5 py-0.5 rounded-full border border-[#00ED64]/30">
              InsightAI 🚀
            </span>
            <span className="text-xs font-medium text-slate-300">
              AI-Powered Resume Analyzer with RAG
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#00ED64] transition-all" />
          </motion.div>
        </motion.div>

        {/* Center Focus Main Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading leading-[1.14] max-w-4xl mx-auto"
        >
          <span className="bg-gradient-to-r from-[#00ED64] via-emerald-400 to-[#10B981] bg-clip-text text-transparent">
            AI-Powered
          </span>{' '}
          Resume Intelligence Platform
        </motion.h1>

        {/* Centered Subtext */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg sm:text-2xl text-slate-200 font-semibold max-w-2xl mx-auto leading-relaxed"
        >
          Analyze, optimize, and get job-ready with AI
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="mt-2.5 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-normal"
        >
          Audit parser compatibility, generate quantifiable Google XYZ bullet points, and match job description keywords in real time.
        </motion.p>

        {/* Primary CTA Buttons with Modern Rounded Shape & Hover Glow */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 35px -2px rgba(0, 237, 100, 0.6)'
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={onStartUpload}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] text-slate-950 text-sm font-black rounded-2xl shadow-mongo-glow transition-all cursor-pointer group"
          >
            <Sparkles className="w-4.5 h-4.5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>Upload Resume</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.04,
              borderColor: '#00ED64',
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              boxShadow: '0 0 25px -2px rgba(0, 237, 100, 0.25)'
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={onExploreDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-[#1E293B]/90 hover:bg-slate-800 border border-slate-700/80 text-slate-100 text-sm font-bold rounded-2xl shadow-soft-sm transition-all cursor-pointer"
          >
            <FileText className="w-4.5 h-4.5 text-[#00ED64]" />
            <span>Try Demo</span>
          </motion.button>
        </motion.div>

        {/* Quick Social Proof & Trust Badges */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00ED64]" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00ED64]" />
            <span>100% Private & Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#00ED64]" />
            <span>3.4x Higher Interview Rate</span>
          </div>
        </motion.div>

        {/* Hero AI Resume Illustration & Visual Showcase */}
        <motion.div
          variants={itemVariants}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#00ED64]/30 via-slate-800/60 to-slate-800/20 shadow-[0_0_50px_rgba(0,237,100,0.15)] overflow-hidden">
            <div className="bg-[#0F172A] rounded-[22px] overflow-hidden border border-slate-800/80 relative">
              <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden flex items-center justify-center bg-slate-950">
                <img
                  src={heroIllustration}
                  alt="AI Resume Parser & ATS Optimization Engine Illustration"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent pointer-events-none" />

                {/* Floating Micro Highlights on the Illustration */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between flex-wrap gap-3">
                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1E293B]/90 border border-slate-700/80 backdrop-blur-md text-xs font-bold text-white shadow-lg"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-[#00ED64] animate-pulse" />
                    <span>Gemini 2.5 Flash • Real-Time ATS Parser</span>
                  </motion.div>
                  <motion.div
                    animate={{ y: [3, -3, 3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00ED64]/20 border border-[#00ED64]/40 backdrop-blur-md text-xs font-extrabold text-[#00ED64] shadow-lg"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#00ED64]" />
                    <span>99.4% Parsing Accuracy</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center Interactive Teaser Card with Smooth Hover Scale */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="mt-8 max-w-4xl mx-auto bg-[#1E293B] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-left relative overflow-hidden"
        >
          {/* Top card bar with role switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-heading">
                  Interactive Live ATS Audit Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00ED64]/15 text-[#00ED64] border border-[#00ED64]/30">
                  Real-time Simulation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch sample target roles to see instant keyword matching & rewrite diffs:
              </p>
            </div>

            {/* Role preset buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SAMPLE_JOB_PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedRole(preset.id);
                    onSelectSampleRole(preset.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedRole === preset.id
                      ? 'bg-[#00ED64] text-slate-950 font-bold shadow-soft-sm'
                      : 'bg-[#0F172A] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Card Body: Before vs After AI Rewrite Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
            {/* Left: ATS Score & Vital Gauges */}
            <div className="md:col-span-4 bg-[#0F172A] border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Role Fit
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Senior Full Stack & AI
                </h4>

                {/* Score Big Circle Indicator */}
                <div className="mt-4 flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative w-16 h-16 rounded-full bg-[#1E293B] border-4 border-[#00ED64] flex items-center justify-center shadow-[0_0_15px_rgba(0,237,100,0.3)]"
                  >
                    <span className="text-xl font-extrabold text-white font-heading">88</span>
                    <span className="text-[10px] text-slate-400 font-bold absolute -bottom-1 bg-[#1E293B] px-1 rounded">/100</span>
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[#00ED64] bg-[#00ED64]/15 px-2 py-0.5 rounded-md border border-[#00ED64]/30">
                        Top 5% Tier
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">High ATS recruiter pass probability</p>
                  </div>
                </div>

                {/* Micro metrics list */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Keyword Density</span>
                    <span className="font-bold text-[#00ED64]">92% match</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '92%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="bg-[#00ED64] h-full rounded-full"
                    />
                  </div>

                  <div className="flex justify-between text-slate-300 pt-1">
                    <span>Action Verbs</span>
                    <span className="font-bold text-amber-400">Needs 2 fixes</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '78%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      className="bg-amber-400 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onExploreDashboard}
                  className="w-full py-2 bg-[#1E293B] hover:bg-slate-800 border border-slate-700 hover:border-[#00ED64]/40 rounded-lg text-xs font-bold text-slate-200 shadow-soft-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Open Full Candidate Report</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00ED64]" />
                </motion.button>
              </div>
            </div>

            {/* Right: AI Before vs After Diff Preview */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00ED64]" />
                  Live AI Bullet Optimization (XYZ Formula)
                </span>
                <span className="text-[10px] font-bold bg-[#00ED64]/15 text-[#00ED64] px-2 py-0.5 rounded-full border border-[#00ED64]/30">
                  +8 ATS Points Impact
                </span>
              </div>

              {/* Before Box */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-rose-950/20 border border-rose-800/50 rounded-xl space-y-1 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-900/40 px-1.5 py-0.5 rounded border border-rose-700/40">
                    Before (Weak / Passive)
                  </span>
                  <span className="text-[11px] text-slate-400">• Vague scope & zero metrics</span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "Worked on database queries and improved speed for our search API."
                </p>
              </motion.div>

              {/* After Box with MongoDB Green Highlight */}
              <motion.div
                whileHover={{
                  scale: 1.01,
                  boxShadow: '0 0 25px -2px rgba(0, 237, 100, 0.25)'
                }}
                className="p-4 bg-emerald-950/20 border border-[#00ED64]/50 rounded-xl space-y-2 relative shadow-soft-sm transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ED64] bg-[#00ED64]/15 px-2 py-0.5 rounded-md border border-[#00ED64]/30">
                      AI Optimized (High Impact)
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400">
                      ✓ Action Verb + Metric + Scope
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#00ED64] bg-[#00ED64]/10 border border-[#00ED64]/30 px-2 py-0.5 rounded-md">
                    +48% Latency Metric
                  </span>
                </div>

                <p className="text-xs text-slate-100 font-medium leading-relaxed">
                  "Engineered <span className="bg-[#00ED64]/20 text-[#00ED64] font-semibold px-1 rounded">Redis caching layer</span> and indexed MongoDB & Postgres schemas, slashing API query response times by <strong className="text-[#00ED64] font-bold">48%</strong> across 3.2M daily requests."
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700">
                  <span>Keywords Added: Redis, MongoDB, API Latency</span>
                  <span className="text-[#00ED64] font-semibold">1-Click Auto Applied</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
