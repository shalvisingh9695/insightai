export type NavigationSection = 'hero' | 'features' | 'upload' | 'dashboard';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'orange';
  title: string;
  message: string;
}

export interface ResumeBullet {
  id: string;
  original: string;
  optimized: string;
  improvementCategory: 'Quantifiable Metrics' | 'Action Verbs' | 'ATS Keywords' | 'Clarity & Brevity';
  scoreImpact: number;
  isAccepted: boolean;
  explanation: string;
}

export interface ATSKeyword {
  keyword: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Domain';
  foundInResume: boolean;
  matchScore: number;
  importance: 'Critical' | 'Recommended' | 'Bonus';
  frequency: number;
}

export interface SectionHealth {
  name: string;
  score: number;
  status: 'optimal' | 'warning' | 'needs_work';
  feedback: string;
  tips: string[];
}

export interface ParsedResume {
  id: string;
  name: string;
  targetRole: string;
  experienceLevel: string;
  currentCompany: string;
  summary: string;
  atsScore: number;
  matchPercentage: number;
  metricsScore: number;
  brevityScore: number;
  actionVerbScore: number;
  bullets: ResumeBullet[];
  keywords: ATSKeyword[];
  sections: SectionHealth[];
  skills: string[];
  education: string;
  location?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tag: string;
  isOrangeHighlight?: boolean;
  stats?: string;
}

export interface TargetJobPreset {
  id: string;
  title: string;
  company: string;
  level: string;
  requiredSkills: string[];
  salaryRange: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  token?: string;
}
