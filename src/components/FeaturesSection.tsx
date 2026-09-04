import React from 'react';
import { FEATURES_LIST } from '../data/mockResumeData';
import { 
  ShieldCheck, 
  Sparkles, 
  Target, 
  Eye, 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  Cpu, 
  Gauge, 
  Zap,
  Bot,
  MessageSquare
} from 'lucide-react';
import { FeatureItem } from '../types';
import { motion } from 'motion/react';

interface FeaturesSectionProps {
  onSelectFeature: (featureId: string) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onSelectFeature }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Sparkles':
        return Sparkles;
      case 'Target':
        return Target;
      case 'Bot':
        return Bot;
      case 'Eye':
        return Eye;
      case 'CheckCircle2':
        return CheckCircle2;
      case 'Download':
        return Download;
      default:
        return Zap;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="features" className="py-20 md:py-32 bg-[#0F172A] border-y border-slate-800/80 relative overflow-hidden">
      {/* Subtle ambient green radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#00ED64]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Fade In on scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#00ED64]/15 border border-[#00ED64]/30 text-xs font-bold text-[#00ED64] mb-4 shadow-[0_0_20px_rgba(0,237,100,0.2)]">
            <Cpu className="w-4 h-4 text-[#00ED64]" />
            <span>Next-Gen Career Optimization</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
            Engineered to Pass Human Recruiters & Algorithmic Filters
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Every feature is calibrated against real parsing logic from Workday, Taleo, Greenhouse, and Lever to turn cold applications into interviews.
          </p>
        </motion.div>

        {/* Feature Cards Grid (Fade In on scroll + Card hover scale + soft shadows) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES_LIST.map((feature: FeatureItem) => {
            const Icon = getIcon(feature.iconName);
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow: '0 0 35px -4px rgba(0, 237, 100, 0.35), 0 16px 32px -6px rgba(0, 0, 0, 0.7)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                onClick={() => onSelectFeature(feature.id)}
                className="bg-gradient-to-b from-[#1E293B] to-[#141D2E] border border-slate-700/80 hover:border-[#00ED64]/80 rounded-2xl p-7 shadow-soft-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#00ED64]/90 via-[#00684A]/50 to-transparent"></div>

                <div>
                  {/* Card Icon & Tag Bar */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.12, rotate: 6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-soft-sm transition-transform bg-[#00ED64]/10 text-[#00ED64] border-[#00ED64]/30 group-hover:border-[#00ED64]/60 group-hover:shadow-[0_0_15px_rgba(0,237,100,0.3)]"
                    >
                      <Icon className="w-5 h-5 text-[#00ED64]" />
                    </motion.div>

                    <span className="text-[10px] font-bold px-3 py-1 rounded-full border bg-[#00ED64]/15 text-[#00ED64] border-[#00ED64]/30">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-heading group-hover:text-[#00ED64] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom stats and action trigger */}
                <div className="mt-8 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-500" />
                    {feature.stats}
                  </span>
                  <span className="font-bold flex items-center gap-1.5 text-xs text-[#00ED64] group-hover:underline transition-all">
                    <span>Try Feature</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Banner: 6-Second Recruiter Rule with Hover Scale & Button Glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.4 }}
          className="mt-16 bg-gradient-to-r from-[#1E293B] via-[#1A2333] to-[#0F172A] border border-slate-700/80 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-[#00ED64]/80 via-emerald-500/40 to-transparent"></div>

          <div className="flex items-start gap-5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="w-14 h-14 rounded-2xl bg-[#00ED64]/15 border border-[#00ED64]/40 flex items-center justify-center text-[#00ED64] shrink-0 shadow-[0_0_20px_rgba(0,237,100,0.25)]"
            >
              <Eye className="w-7 h-7 text-[#00ED64]" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2.5">
                <h4 className="text-lg font-bold text-white font-heading">
                  Did you know? Recruiters spend an average of 6 seconds per resume
                </h4>
                <span className="hidden sm:inline text-[10px] font-bold bg-[#00ED64]/15 text-[#00ED64] px-2.5 py-0.5 rounded-full border border-[#00ED64]/30">
                  Critical Stat
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                InsightAI structures your executive summary, quantifiable bullet points, and top-matching tech skills directly in the primary visual reading quadrant.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px -2px rgba(0, 237, 100, 0.55)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              const el = document.getElementById('resume-upload');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full md:w-auto shrink-0 px-7 py-3.5 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-mongo-glow flex items-center justify-center gap-2 cursor-pointer transition-all group"
          >
            <span>Scan My Resume Now</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
