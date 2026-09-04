import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Standard frontend API configuration with baseURL = http://localhost:3000/api
 */
export const DEFAULT_BASE_URL = '/api';

const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const API_BASE_URL: string = (() => {
  if (typeof window !== 'undefined') {
    const customUrl = metaEnv.VITE_API_URL || metaEnv.VITE_API_BASE_URL;
    if (customUrl && !customUrl.includes('localhost:') && !customUrl.includes('127.0.0.1:')) {
      return customUrl;
    }
    return '/api';
  }
  return metaEnv.VITE_API_URL || metaEnv.VITE_API_BASE_URL || '/api';
})();

/**
 * Formatted API Error Structure
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
  details?: any;
  originalError?: any;
}

/**
 * Helper to normalize and extract user-friendly error messages from Axios responses
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected issue occurred. Please try again.';

  let rawMessage = '';
  let statusCode: number | undefined;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    statusCode = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    if (responseData) {
      if (typeof responseData === 'string') {
        rawMessage = responseData;
      } else if (responseData.error && typeof responseData.error === 'string') {
        rawMessage = responseData.error;
      } else if (responseData.message && typeof responseData.message === 'string') {
        rawMessage = responseData.message;
      } else if (Array.isArray(responseData.errors)) {
        rawMessage = responseData.errors.join(', ');
      }
    }

    if (!rawMessage) {
      rawMessage = axiosError.message || '';
    }

    if (axiosError.code === 'ECONNABORTED' || rawMessage.toLowerCase().includes('timeout')) {
      return 'The upload request timed out while processing your document. Please verify your connection or try pasting your resume text directly.';
    }
    if (axiosError.code === 'ERR_NETWORK' || rawMessage.toLowerCase().includes('network error')) {
      return 'Unable to reach the server. Please check your internet connection and ensure the service is running.';
    }
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  }

  const lower = (rawMessage || '').toLowerCase();

  // 1. Scanned or unreadable PDF
  if (lower.includes('scanned') || lower.includes('unreadable') || lower.includes('pdf-parse') || lower.includes('extract text') || lower.includes('no text found')) {
    return 'We were unable to extract readable text from this PDF. The document may be scanned, encrypted, or image-only. Please upload a standard text PDF or use the "Paste Resume Text" tab.';
  }

  // 2. File size limit exceeded
  if (statusCode === 413 || lower.includes('file too large') || lower.includes('payload too large') || (lower.includes('limit') && lower.includes('size'))) {
    return 'The selected file exceeds the 20MB size limit. Please choose a smaller PDF or copy and paste your resume text.';
  }

  // 3. No file or unsupported format
  if (statusCode === 400 || lower.includes('no file uploaded') || lower.includes('invalid file')) {
    if (lower.includes('no file')) {
      return 'No resume file was detected. Please choose a PDF (.pdf), Word (.docx), or plain text file to upload.';
    }
    return 'The uploaded document format is not supported. Please select a valid PDF or text-based resume.';
  }

  // 4. Unprocessable entity (422)
  if (statusCode === 422) {
    return 'This resume document could not be processed. Please upload a standard text PDF or paste your resume content directly.';
  }

  // 5. Server errors (500, 502, 503)
  if (statusCode && statusCode >= 500) {
    return 'The resume processing service encountered an unexpected error. Please try again in a moment or use the text paste option.';
  }

  // 6. Generic Axios status code pattern
  if (rawMessage.startsWith('Request failed with status code')) {
    return 'Unable to process the upload request. Please try again or paste your resume text directly.';
  }

  // 7. Strip out raw JavaScript technical dumps if any
  if (
    rawMessage &&
    !rawMessage.includes('AxiosError') &&
    !rawMessage.includes('status code') &&
    !rawMessage.includes('ECONN') &&
    !rawMessage.includes('at ') &&
    !rawMessage.includes('TypeError') &&
    !rawMessage.includes('[object')
  ) {
    return rawMessage;
  }

  return 'An error occurred while analyzing the resume. Please check your document and try again, or paste the text directly.';
}

export function formatApiError(error: unknown): ApiErrorResponse {
  const friendlyMsg = getFriendlyErrorMessage(error);
  let statusCode: number | undefined;
  let details: any = undefined;

  if (axios.isAxiosError(error)) {
    statusCode = error.response?.status;
    details = error.response?.data;
  }

  return {
    success: false,
    message: friendlyMsg,
    statusCode,
    details,
    originalError: error
  };
}

/**
 * Main Axios Client Instance configured with baseURL = http://localhost:5000/api
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Accept': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Forward JWT token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt_token') || localStorage.getItem('insight_ai_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // If uploading FormData, let the browser set the boundary header automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Config Error]:', error);
    return Promise.reject(formatApiError(error));
  }
);

// Response Interceptor with intelligent fallback & normalized error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // If request to remote port fails (e.g. ECONNREFUSED or Network Error on localhost:5000),
    // automatically fallback to relative /api in browser environments so the app continues functioning flawlessly.
    if (
      config &&
      !config._retryCount &&
      (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) &&
      typeof window !== 'undefined' &&
      config.baseURL &&
      config.baseURL.includes(':5000')
    ) {
      config._retryCount = 1;
      config.baseURL = '/api';
      console.warn('[API Fallback]: Retrying request via relative /api gateway...');
      return apiClient.request(config);
    }

    const formattedError = formatApiError(error);
    console.error(`[API Error ${formattedError.statusCode || ''}]:`, formattedError.message);
    return Promise.reject(formattedError);
  }
);

export default apiClient;
