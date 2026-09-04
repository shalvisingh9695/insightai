import apiClient, { formatApiError, getFriendlyErrorMessage, ApiErrorResponse } from './axiosClient';
import { ParsedResume } from '../types';

export { getFriendlyErrorMessage, formatApiError };

export interface UploadResumeResponse {
  success: boolean;
  message?: string;
  documentId?: string;
  savedToMongoDB?: boolean;
  chunksCount?: number;
  rawText?: string;
  resume?: ParsedResume;
  error?: string;
}

export interface ATSScoreResponse {
  success: boolean;
  score: number;
  grade: string;
  targetRole: string;
  data?: any;
  overallScore?: number;
  breakdown: {
    keywordMatch: {
      score: number;
      weight: string;
      foundCount: number;
      totalRequired: number;
      status: string;
      details: string;
    };
    impactMetrics: {
      score: number;
      weight: string;
      detectedMetricTokens: number;
      status: string;
      details: string;
    };
    actionVerbs: {
      score: number;
      weight: string;
      foundVerbs: string[];
      status: string;
      details: string;
    };
    formattingStructure: {
      score: number;
      weight: string;
      sectionsFound: {
        contactInfo: boolean;
        summary: boolean;
        experience: boolean;
        skills: boolean;
        education: boolean;
      };
      status: string;
      details: string;
    };
  };
  topMatchedKeywords: string[];
  topMissingKeywords: string[];
  recommendations: string[];
  executiveSummary: string;
  error?: string;
}

export interface RewriteResponse {
  success: boolean;
  originalText: string;
  rewrittenText: string;
  mode: string;
  actionVerbUsed?: string;
  improvements: string[];
  metricsAdded: string[];
  atsScoreImpact: string;
  error?: string;
}

export interface KeywordGapResponse {
  success: boolean;
  targetRole: string;
  overallMatchRate: number;
  totalKeywordsTracked: number;
  matchedCount: number;
  missingCount: number;
  categoryBreakdown: Record<string, {
    total: number;
    matched: number;
    missing: number;
    matchPercentage: number;
  }>;
  matchedKeywords: Array<{
    keyword: string;
    category: string;
    importance: string;
    foundInResume: boolean;
    frequency: number;
    matchScore: number;
  }>;
  missingKeywords: Array<{
    keyword: string;
    category: string;
    importance: string;
    foundInResume: boolean;
    frequency: number;
    matchScore: number;
    recommendation: string;
  }>;
  actionableAdvice: string[];
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  query: string;
  resumeId?: string;
  retrievedCount?: number;
  answer: string;
  relevantChunks?: Array<{
    chunkIndex?: number;
    sectionHint: string;
    text: string;
    score: number;
  }>;
  error?: string;
}

/**
 * 1. Upload Resume PDF to API
 */
export async function uploadResumeFile(
  file: File,
  targetRole: string = 'Senior Full Stack Engineer',
  onProgress?: (percent: number) => void
): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetRole', targetRole);

  const response = await apiClient.post<UploadResumeResponse>('/resume/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });

  return response.data;
}

/**
 * 2. Parse Raw Resume Text
 */
export async function parseResumeText(
  text: string,
  targetRole: string = 'Senior Full Stack Engineer'
): Promise<UploadResumeResponse> {
  const response = await apiClient.post<UploadResumeResponse>('/resume/parse-text', {
    text,
    targetRole
  });

  return response.data;
}

/**
 * 3. Calculate ATS Score with full structured breakdown
 */
export async function fetchATSScore(
  text: string,
  targetRole: string = 'Senior Full Stack Engineer',
  jobDescription: string = ''
): Promise<ATSScoreResponse> {
  const response = await apiClient.post<ATSScoreResponse>('/ats/score', {
    resumeText: text,
    text,
    rawText: text,
    targetRole,
    role: targetRole,
    jobDescription,
    jobDesc: jobDescription
  });

  return response.data;
}

/**
 * 4. AI Resume & Bullet Point Rewriter (Google XYZ formula)
 */
export async function rewriteResumeBullet(
  bullet: string,
  mode: string = 'google_xyz',
  targetRole: string = 'Senior Full Stack Engineer'
): Promise<RewriteResponse> {
  const response = await apiClient.post<RewriteResponse>('/resume/rewrite', {
    bullet,
    bulletPoint: bullet,
    text: bullet,
    mode,
    style: mode,
    targetRole,
    role: targetRole
  });

  return response.data;
}

/**
 * 5. Keyword Gap Analysis Matrix
 */
export async function fetchKeywordGapAnalysis(
  text: string,
  targetRole: string = 'Senior Full Stack Engineer',
  jobDescription: string = ''
): Promise<KeywordGapResponse> {
  const response = await apiClient.post<KeywordGapResponse>('/keywords/gap-analysis', {
    resumeText: text,
    text,
    rawText: text,
    targetRole,
    role: targetRole,
    jobDescription,
    jobDesc: jobDescription
  });

  return response.data;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id?: string;
    name: string;
    email: string;
  };
  error?: string;
}

/**
 * 6. RAG-Powered Contextual Chat with Gemini & MongoDB Chunks
 */
export async function sendChatMessage(
  message: string,
  resumeId?: string,
  rawText?: string
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/chat', {
    message,
    resumeId,
    rawText
  });

  return response.data;
}

/**
 * 7. Login User API
 */
export async function loginUserApi(email: string, password?: string, name?: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password: password || 'demo1234',
    name
  });

  return response.data;
}

/**
 * 8. Register User API
 */
export async function registerUserApi(name: string, email: string, password?: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    name,
    email,
    password: password || 'demo1234'
  });

  return response.data;
}

/**
 * 9. Fetch Latest Uploaded Resume
 */
export async function fetchLatestResume(): Promise<{
  success: boolean;
  resume?: ParsedResume | null;
  rawText?: string;
  fileName?: string;
  documentId?: string;
  uploadedAt?: string;
  error?: string;
}> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      resume?: ParsedResume | null;
      rawText?: string;
      fileName?: string;
      documentId?: string;
      uploadedAt?: string;
      error?: string;
    }>('/resume/latest');

    return response.data;
  } catch (err: any) {
    return {
      success: false,
      resume: null,
      error: err?.response?.data?.error || err.message
    };
  }
}

export default {
  uploadResumeFile,
  parseResumeText,
  fetchATSScore,
  rewriteResumeBullet,
  fetchKeywordGapAnalysis,
  sendChatMessage,
  loginUserApi,
  registerUserApi,
  fetchLatestResume
};
