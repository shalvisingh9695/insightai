import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Sliders,
  Briefcase,
  Database,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { TargetJobPreset, ParsedResume } from '../types';
import { SAMPLE_JOB_PRESETS, SAMPLE_RESUMES } from '../data/mockResumeData';
import { uploadResumeFile, parseResumeText, getFriendlyErrorMessage } from '../api/resumeApi';
import { motion, AnimatePresence } from 'motion/react';

interface ResumeUploadSectionProps {
  onScanComplete?: (scannedResume: ParsedResume) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'orange') => void;
  selectedPreset?: TargetJobPreset;
  onSelectPreset?: (preset: TargetJobPreset) => void;
}

interface UploadSuccessState {
  fileName: string;
  charCount: number;
  targetRole: string;
  docId?: string;
  skillsCount?: number;
}

export const ResumeUploadSection: React.FC<ResumeUploadSectionProps> = ({
  onScanComplete,
  onShowToast,
  selectedPreset: externalPreset,
  onSelectPreset: externalSetPreset
}) => {
  const [internalPreset, setInternalPreset] = useState<TargetJobPreset>(SAMPLE_JOB_PRESETS[0]);
  const activePreset = externalPreset || internalPreset;

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedRawText, setExtractedRawText] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [mongoInfo, setMongoInfo] = useState<{ docId: string; saved: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<UploadSuccessState | null>(null);
  
  // Direct text paste modal/drawer state
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: TargetJobPreset) => {
    if (externalSetPreset) {
      externalSetPreset(preset);
    } else {
      setInternalPreset(preset);
    }
    if (onShowToast) {
      onShowToast('Target Track Updated', `Auditing for ${preset.title} criteria.`, 'info');
    }
  };

  /**
   * Uploads the PDF or text file to the backend API via Axios
   * which uses `pdf-parse` to extract text and saves to MongoDB.
   */
  const handleFileUpload = async (file: File) => {
    // Client-side file size guard (20MB)
    if (file.size > 20 * 1024 * 1024) {
      const sizeMsg = 'The selected file is larger than 20MB. Please choose a smaller resume file or paste text directly.';
      setErrorMessage(sizeMsg);
      if (onShowToast) {
        onShowToast('File Too Large', sizeMsg, 'warning');
      }
      return;
    }

    // Client-side file extension check
    const fileNameLower = file.name.toLowerCase();
    const isValidExt = fileNameLower.endsWith('.pdf') || fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.txt');
    if (!isValidExt) {
      const extMsg = 'Please upload a PDF (.pdf), Word (.docx), or plain text (.txt) document.';
      setErrorMessage(extMsg);
      if (onShowToast) {
        onShowToast('Unsupported Format', extMsg, 'warning');
      }
      return;
    }

    setUploadedFileName(file.name);
    setIsScanning(true);
    setScanProgress(15);
    setErrorMessage(null);
    setUploadSuccess(null);
    setExtractedRawText(null);

    const progressTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) {
          return 85;
        }
        return prev + 12;
      });
    }, 180);

    try {
      const data = await uploadResumeFile(file, activePreset.title, (percent) => {
        setScanProgress(Math.max(15, Math.min(88, percent)));
      });

      clearInterval(progressTimer);
      setScanProgress(100);

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume document.');
      }

      const extractedText = data.rawText || data.message || '';
      setExtractedRawText(extractedText);
      setMongoInfo({
        docId: data.documentId || 'rec_default',
        saved: !!data.savedToMongoDB
      });

      const successState: UploadSuccessState = {
        fileName: file.name,
        charCount: extractedText.length,
        targetRole: activePreset.title,
        docId: data.documentId || 'rec_default',
        skillsCount: data.resume?.skills?.length || 0
      };
      setUploadSuccess(successState);

      setTimeout(() => {
        setIsScanning(false);
        
        if (onScanComplete && data.resume) {
          onScanComplete(data.resume);
        }

        if (onShowToast) {
          onShowToast(
            'Resume Uploaded Successfully!',
            `Extracted ${extractedText.length.toLocaleString()} characters from ${file.name} and saved to your profile. Insights are ready below!`,
            'success'
          );
        }

        // Smooth scroll to dashboard after giving user time to see success confirmation
        setTimeout(() => {
          const el = document.getElementById('resume-dashboard');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      }, 400);

    } catch (err: any) {
      clearInterval(progressTimer);
      setIsScanning(false);
      console.warn('[Upload Handled Error]:', err);
      const friendlyMsg = getFriendlyErrorMessage(err);
      setErrorMessage(friendlyMsg);
      
      if (onShowToast) {
        onShowToast('Upload Notice', friendlyMsg, 'warning');
      }
    }
  };

  /**
   * Handle pasting raw resume text directly to the API via Axios
   */
  const handlePastedTextSubmit = async () => {
    if (!pastedText.trim()) {
      const emptyMsg = 'Please paste your resume content, experience bullets, or summary to analyze.';
      setErrorMessage(emptyMsg);
      if (onShowToast) {
        onShowToast('Empty Text', emptyMsg, 'warning');
      }
      return;
    }

    if (pastedText.trim().length < 40) {
      const shortMsg = 'Please provide more details (at least 40 characters) so our ATS engine can analyze skills and experience accurately.';
      setErrorMessage(shortMsg);
      if (onShowToast) {
        onShowToast('Content Too Short', shortMsg, 'warning');
      }
      return;
    }

    setIsScanning(true);
    setScanProgress(20);
    setErrorMessage(null);
    setUploadSuccess(null);

    const progressTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) return 85;
        return prev + 15;
      });
    }, 150);

    try {
      const data = await parseResumeText(pastedText, activePreset.title);
      clearInterval(progressTimer);
      setScanProgress(100);

      if (!data.success) {
        throw new Error(data.error || 'Failed to process resume text.');
      }

      const extractedText = data.rawText || pastedText;
      setExtractedRawText(extractedText);
      setUploadedFileName('Pasted_Resume_Text.txt');
      setMongoInfo({
        docId: data.documentId || 'rec_pasted',
        saved: !!data.savedToMongoDB
      });

      const successState: UploadSuccessState = {
        fileName: 'Pasted Resume Text',
        charCount: extractedText.length,
        targetRole: activePreset.title,
        docId: data.documentId || 'rec_pasted',
        skillsCount: data.resume?.skills?.length || 0
      };
      setUploadSuccess(successState);

      setTimeout(() => {
        setIsScanning(false);
        setPasteMode(false);
        if (onScanComplete && data.resume) {
          onScanComplete(data.resume);
        }
        if (onShowToast) {
          onShowToast(
            'Resume Text Parsed Successfully!',
            `Extracted ${extractedText.length.toLocaleString()} characters and matched against ${activePreset.title}.`,
            'success'
          );
        }

        setTimeout(() => {
          const el = document.getElementById('resume-dashboard');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      }, 400);

    } catch (err: any) {
      clearInterval(progressTimer);
      setIsScanning(false);
      console.warn('[Parse Text Handled Error]:', err);
      const friendlyMsg = getFriendlyErrorMessage(err);
      setErrorMessage(friendlyMsg);
      if (onShowToast) {
        onShowToast('Processing Notice', friendlyMsg, 'warning');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleLoadSample = () => {
    setUploadedFileName('Senior_Engineer_Resume_2026.pdf');
    setIsScanning(true);
    setScanProgress(20);
    setErrorMessage(null);
    setUploadSuccess(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanProgress(100);
            
            const sample = SAMPLE_RESUMES['sample-candidate'] || Object.values(SAMPLE_RESUMES)[0];
            const parsedCandidate: ParsedResume = {
              ...sample,
              name: 'Candidate Profile',
              targetRole: activePreset.title,
              atsScore: 82,
              matchPercentage: 88
            };

            const sampleText = `CANDIDATE PROFILE
candidate@example.com | (555) 234-5678 | San Francisco, CA | linkedin.com/in/candidate

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years designing scalable cloud backends, microservices, and React frontends. Proficient in Node.js, TypeScript, PostgreSQL, AWS, and Docker.

EXPERIENCE
CloudScale Systems - Senior Full Stack Engineer (2022 - Present)
• Responsible for building backend services and APIs using Node.js and PostgreSQL.
• Worked on migration of frontend from legacy stack to React.
• Helped improve system performance and reduced database query response times.`;

            setExtractedRawText(sampleText);

            setMongoInfo({
              docId: 'mongo_sample_resume',
              saved: true
            });

            setUploadSuccess({
              fileName: 'Senior_Engineer_Resume_2026.pdf (Sample)',
              charCount: sampleText.length,
              targetRole: activePreset.title,
              docId: 'mongo_sample_resume',
              skillsCount: parsedCandidate.skills?.length || 8
            });

            if (onScanComplete) {
              onScanComplete(parsedCandidate);
            }
            if (onShowToast) {
              onShowToast('Sample Profile Loaded Successfully', `Loaded candidate profile and matched against ${activePreset.title}.`, 'success');
            }

            setTimeout(() => {
              const el = document.getElementById('resume-dashboard');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 600);
          }, 350);
          return 95;
        }
        return prev + 25;
      });
    }, 120);
  };

  return (
    <section id="resume-upload" className="py-20 md:py-32 bg-[#0F172A] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[#00ED64]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title with Fade in on scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E293B]/90 border border-slate-700/80 text-xs font-bold text-slate-200 shadow-soft-sm mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#00ED64]" />
            <span>PDF Upload • pdf-parse Text Extraction • MongoDB Persistence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading leading-tight">
            Audit & Optimize Your Resume
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Upload your PDF resume to extract raw text with <strong>pdf-parse</strong>, persist to <strong>MongoDB</strong>, and analyze live keyword ATS scores.
          </p>
        </motion.div>

        {/* Upload Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Target Role Settings Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 bg-gradient-to-b from-[#1E293B] to-[#141D2E] border border-slate-700/80 rounded-3xl p-7 shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Subtle top indicator bar */}
            <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#00ED64]/80 via-emerald-500/40 to-transparent"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center text-[#00ED64]">
                  <Sliders className="w-4 h-4 text-[#00ED64]" />
                </div>
                <h3 className="text-sm font-bold text-white font-heading">Target Role Preset</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00ED64]/15 text-[#00ED64] border border-[#00ED64]/30 shadow-[0_0_10px_rgba(0,237,100,0.2)]">
                Calibrated ATS
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ATS engines score your resume relative to specific job keywords. Choose your target career track:
            </p>

            {/* Presets List */}
            <div className="space-y-2.5">
              {SAMPLE_JOB_PRESETS.map((preset) => {
                const isSelected = activePreset.id === preset.id;
                return (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.015, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'bg-[#00ED64]/15 border-[#00ED64] shadow-[0_0_20px_rgba(0,237,100,0.2)] text-white'
                        : 'bg-[#0F172A] border-slate-700/80 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Briefcase className={`w-4 h-4 ${isSelected ? 'text-[#00ED64]' : 'text-slate-400'}`} />
                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {preset.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{preset.company} • {preset.level}</p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#00ED64] shrink-0 mt-0.5" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Role High-Yield Keywords Tag Cloud */}
            <div className="pt-4 border-t border-slate-700/70">
              <span className="text-xs font-bold text-slate-200">Must-Have Keywords for this Track:</span>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {activePreset.requiredSkills.map((kw, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.08 }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#0F172A] text-slate-300 border border-slate-700 hover:border-[#00ED64]/50 transition-colors"
                  >
                    {kw}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Backend Tech Stack Footprint info */}
            <div className="pt-4 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Database className="w-4 h-4 text-[#00ED64]" />
                MongoDB Persistence
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <FileText className="w-4 h-4 text-[#00ED64]" />
                pdf-parse Engine
              </span>
            </div>
          </motion.div>

          {/* Right Column: Drag & Drop Dropzone + Live Scanner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-5"
          >
            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt,application/pdf,text/plain"
              className="hidden"
            />

            {/* Error banner with friendly, human-readable error messages */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 sm:p-5 bg-rose-950/70 border border-rose-800/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-100 shadow-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-900/60 border border-rose-700 flex items-center justify-center shrink-0 text-rose-300 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-rose-200 text-sm">Upload Notice</h5>
                      <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!pasteMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setPasteMode(true);
                          setErrorMessage(null);
                        }}
                        className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-bold rounded-xl border border-rose-700 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Paste Text Instead</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="p-1.5 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Dismiss notice"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message Card after Upload */}
            <AnimatePresence>
              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 10 }}
                  className="border-2 border-[#00ED64]/70 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/70 via-[#1E293B] to-[#141D2E] relative overflow-hidden shadow-[0_0_35px_rgba(0,237,100,0.25)] space-y-5"
                >
                  <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#00ED64] to-transparent" />

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-[#00ED64]/20 border border-[#00ED64]/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,237,100,0.3)]">
                      <CheckCircle2 className="w-8 h-8 text-[#00ED64]" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00ED64]/15 border border-[#00ED64]/30 text-[#00ED64] text-[11px] font-bold">
                        <Check className="w-3 h-3 text-[#00ED64]" />
                        <span>Upload & Text Extraction Complete</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white font-heading">
                        Resume Uploaded Successfully!
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        Extracted <strong>{uploadSuccess.charCount.toLocaleString()} characters</strong> from{' '}
                        <span className="text-emerald-400 font-semibold">{uploadSuccess.fileName}</span> and calibrated against{' '}
                        <span className="text-white font-semibold">{uploadSuccess.targetRole}</span> benchmarks. Candidate insights and ATS breakdown are ready.
                      </p>

                      {/* Snapshot metadata tags */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-slate-300 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-[#00ED64]" />
                          Saved to MongoDB
                        </span>
                        {uploadSuccess.skillsCount !== undefined && uploadSuccess.skillsCount > 0 && (
                          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-slate-300 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#00ED64]" />
                            {uploadSuccess.skillsCount} Skills Extracted
                          </span>
                        )}
                        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#00ED64]" />
                          pdf-parse Engine Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-700/80">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03, boxShadow: '0 0 30px -2px rgba(0, 237, 100, 0.5)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const el = document.getElementById('resume-dashboard');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#00ED64] to-[#10B981] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-mongo-glow flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>View Full ATS Insights</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadSuccess(null);
                        setUploadedFileName(null);
                        setExtractedRawText(null);
                        setErrorMessage(null);
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Upload Another Resume</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Switcher: PDF File Upload vs Raw Text Paste */}
            <div className="flex items-center justify-between bg-[#1E293B]/80 border border-slate-700/80 rounded-full p-1.5 shadow-soft-sm backdrop-blur-md">
              <button
                type="button"
                onClick={() => setPasteMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  !pasteMode 
                    ? 'bg-gradient-to-r from-[#00ED64] to-[#10B981] text-slate-950 shadow-mongo-glow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload PDF Resume
              </button>
              <button
                type="button"
                onClick={() => setPasteMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  pasteMode 
                    ? 'bg-gradient-to-r from-[#00ED64] to-[#10B981] text-slate-950 shadow-mongo-glow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Resume Text
              </button>
            </div>

            {!pasteMode ? (
              /* Drag & Drop Zone with Animated Pulse, Glow, and In-Dropzone Loader during Upload */
              <motion.div
                onDragOver={isScanning ? undefined : handleDragOver}
                onDragLeave={isScanning ? undefined : handleDragLeave}
                onDrop={isScanning ? undefined : handleDrop}
                onClick={isScanning ? undefined : () => fileInputRef.current?.click()}
                whileHover={isScanning ? {} : { scale: 1.01 }}
                whileTap={isScanning ? {} : { scale: 0.99 }}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 bg-gradient-to-b from-[#1E293B] to-[#141D2E] relative overflow-hidden ${
                  isScanning 
                    ? 'border-[#00ED64] bg-[#00ED64]/5 shadow-[0_0_35px_rgba(0,237,100,0.25)] cursor-wait'
                    : isDragOver
                    ? 'border-[#00ED64] bg-[#00ED64]/10 shadow-[0_0_40px_rgba(0,237,100,0.35)] cursor-pointer'
                    : 'border-slate-700/80 hover:border-[#00ED64]/70 shadow-2xl cursor-pointer'
                }`}
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#00ED64]/60 to-transparent"></div>

                {isScanning ? (
                  /* ========================================================= */
                  /* ACTIVE UPLOAD LOADER DISPLAY IN DROPZONE                 */
                  /* ========================================================= */
                  <div className="flex flex-col items-center justify-center py-4">
                    {/* Dual-ring spinning radar loader */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full border-4 border-slate-700/60 border-t-[#00ED64] border-r-[#00ED64]/70 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="w-7 h-7 text-[#00ED64] animate-pulse" />
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ED64]/10 border border-[#00ED64]/30 text-[#00ED64] text-xs font-bold mb-3 shadow-[0_0_15px_rgba(0,237,100,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-[#00ED64] animate-ping" />
                      <span>
                        {scanProgress < 30 && 'Uploading resume document to server...'}
                        {scanProgress >= 30 && scanProgress < 65 && 'Extracting text streams with pdf-parse...'}
                        {scanProgress >= 65 && scanProgress < 85 && 'Auditing keywords & structuring candidate data...'}
                        {scanProgress >= 85 && 'Persisting to MongoDB & finalizing insights...'}
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-white font-heading">
                      Analyzing {uploadedFileName || 'Resume Document'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">
                      Evaluating against <strong>{activePreset.title}</strong> benchmarks. Please wait a moment...
                    </p>

                    {/* Progress Bar with Percentage */}
                    <div className="w-full max-w-md mt-6 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span className="text-slate-400">Extraction Progress</span>
                        <span className="text-[#00ED64] font-mono text-sm">{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-[#0F172A] h-2.5 rounded-full overflow-hidden border border-slate-700">
                        <motion.div
                          className="bg-gradient-to-r from-[#00684A] via-[#00ED64] to-[#a7f3d0] h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,237,100,0.6)]"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>1. File Upload</span>
                        <span>2. Text Parser</span>
                        <span>3. ATS Calibration</span>
                        <span>4. MongoDB Sync</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* IDLE DROPZONE DISPLAY                                    */
                  /* ========================================================= */
                  <div className="flex flex-col items-center justify-center">
                    <motion.div
                      animate={isDragOver ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.5, repeat: isDragOver ? Infinity : 0 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all shadow-md ${
                        isDragOver
                          ? 'bg-[#00ED64]/25 text-[#00ED64] shadow-[0_0_20px_rgba(0,237,100,0.4)]'
                          : 'bg-[#0F172A] text-[#00ED64] border border-slate-700/80'
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 text-[#00ED64]" />
                    </motion.div>

                    <h4 className="text-lg font-bold text-white font-heading">
                      Drag and drop your PDF resume here
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                      Backend extracts text with <strong>pdf-parse</strong> & saves directly to <strong>MongoDB</strong>. Maximum size: 20MB.
                    </p>

                    {uploadedFileName && !uploadSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/50 border border-[#00ED64]/40 text-xs font-semibold text-[#00ED64]"
                      >
                        <FileText className="w-4 h-4 text-[#00ED64]" />
                        <span>Ready: {uploadedFileName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00ED64]" />
                      </motion.div>
                    )}

                    {/* Primary Upload Button with Glow */}
                    <div className="mt-6">
                      <motion.button
                        type="button"
                        whileHover={{
                          scale: 1.04,
                          boxShadow: '0 0 30px -2px rgba(0, 237, 100, 0.55)'
                        }}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-mongo-glow transition-all flex items-center gap-2 cursor-pointer group"
                      >
                        <UploadCloud className="w-4 h-4 text-slate-950 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Select PDF File</span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Paste Resume Text Field with loader state */
              <div className="bg-gradient-to-b from-[#1E293B] to-[#141D2E] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00ED64]" />
                    Direct Text Input
                  </span>
                  <span className="text-[10px] text-slate-400">Parsed & Stored in MongoDB</span>
                </div>
                
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  disabled={isScanning}
                  placeholder="Paste your resume raw text, work experience bullets, skills, and summary here..."
                  rows={8}
                  className="w-full text-xs font-mono p-4 bg-[#0F172A] border border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#00ED64] focus:outline-none text-slate-200 resize-y leading-relaxed disabled:opacity-60"
                />

                {isScanning && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="text-[#00ED64] flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Analyzing text with NLP heuristics & ATS calibration...
                      </span>
                      <span className="text-[#00ED64] font-mono">{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-[#0F172A] h-2 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-[#00684A] to-[#00ED64] h-full rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => {
                      setPastedText(`Johnathan Doe
j.doe@example.com | (555) 432-8765 | San Francisco, CA

SUMMARY
Senior Software Engineer with 7 years of full stack web development experience specializing in React, Node.js, and Cloud Infrastructure.

EXPERIENCE
TechCorp Solutions - Staff Engineer (2021 - Present)
• Architected scalable microservices using Node.js and PostgreSQL, cutting API latency by 45%.
• Led migration to React and TypeScript across 5 core products.
• Integrated Redis caching layers improving throughput by 3.5x.`);
                    }}
                    className="px-4 py-2 text-xs text-slate-300 hover:text-white border border-slate-700 rounded-xl bg-[#0F172A] hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Insert Example Text
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 25px -2px rgba(0, 237, 100, 0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    disabled={!pastedText.trim() || isScanning}
                    onClick={handlePastedTextSubmit}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#00ED64] to-[#10B981] hover:bg-[#00c954] disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-mongo-glow flex items-center gap-2 cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                        <span>Parsing Resume Text...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>Parse Text & Save</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Scanning Progress Overlay / Banner with Framer Motion AnimatePresence */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-b from-[#1E293B] to-[#141D2E] border border-[#00ED64] rounded-2xl p-6 shadow-2xl space-y-3.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-[#00ED64] animate-spin" />
                      Executing pdf-parse extraction & MongoDB record sync...
                    </span>
                    <span className="font-black text-[#00ED64] text-sm">{scanProgress}%</span>
                  </div>

                  <div className="w-full bg-[#0F172A] h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                      className="bg-gradient-to-r from-[#00684A] via-[#00ED64] to-[#a7f3d0] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,237,100,0.5)]"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Extracting PDF text streams</span>
                    <span>Saving to MongoDB collection</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extracted Raw Text & MongoDB Status Inspector */}
            {extractedRawText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#1E293B] to-[#141D2E] border border-[#00ED64]/50 rounded-2xl p-5 shadow-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#00ED64]/20 text-[#00ED64] flex items-center justify-center font-bold text-xs border border-[#00ED64]/40">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        PDF Text Extracted & Saved
                        {mongoInfo && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#0F172A] text-[#00ED64] border border-slate-700 font-normal">
                            Doc ID: {mongoInfo.docId.slice(0, 16)}...
                          </span>
                        )}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {extractedRawText.length} characters parsed via pdf-parse module.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{showRawText ? 'Hide Raw Text' : 'View Extracted Text'}</span>
                    {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <AnimatePresence>
                  {showRawText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-700 overflow-hidden"
                    >
                      <pre className="p-3.5 bg-[#0F172A] text-[#00ED64] font-mono text-[11px] rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                        {extractedRawText}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Quick Demo Pre-load Box */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gradient-to-r from-[#1E293B] to-[#141D2E] border border-slate-700/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#00ED64]/15 text-[#00ED64] flex items-center justify-center shrink-0 border border-[#00ED64]/30 shadow-[0_0_15px_rgba(0,237,100,0.2)]">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-white">Don't have a PDF resume handy?</h5>
                  <p className="text-[11px] text-slate-400">Load our pre-built engineer candidate profile with live ATS flaws.</p>
                </div>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.04,
                  borderColor: '#00ED64',
                  boxShadow: '0 0 25px -2px rgba(0, 237, 100, 0.4)'
                }}
                whileTap={{ scale: 0.96 }}
                onClick={handleLoadSample}
                className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-[#00ED64] text-xs font-bold rounded-xl shadow-soft-sm flex items-center justify-center gap-2 cursor-pointer transition-all group"
              >
                <span>Load Sample Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00ED64] group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
