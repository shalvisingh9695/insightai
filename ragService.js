import { GoogleGenAI } from '@google/genai';
import { saveResumeChunks, getResumeChunks, getAllResumeChunks } from './db.js';
import { getGeminiClient, executeGeminiGenerate } from './aiService.js';

/**
 * 1. CHUNKING LOGIC
 * Splits raw resume text into clean chunks of 300-500 characters.
 * 
 * @param {string} text - Raw extracted resume text
 * @returns {Array<{ chunkIndex: number, text: string }>}
 */
export function splitResumeIntoChunks(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const cleaned = text.trim();
  if (!cleaned) return [];

  // Match chunks of 300 to 500 characters across newlines and words
  const rawChunks = cleaned.match(/(?:[\s\S]{300,500})(?=\s|$)|[\s\S]{1,500}/g) || [cleaned];

  const chunks = rawChunks
    .map((chunkText, index) => ({
      chunkIndex: index,
      text: chunkText.trim()
    }))
    .filter(c => c.text.length > 0);

  // Debug log required by specifications
  console.log("Chunks created");

  return chunks;
}

/**
 * 2. STORE RESUME TEXT & CHUNKS IN MONGODB
 * 
 * @param {string} userId - User ID or Resume document ID
 * @param {string} rawText - Extracted text
 * @returns {Promise<Array>} Stored chunks
 */
export async function storeResumeChunks(userId, rawText) {
  const chunks = splitResumeIntoChunks(rawText);
  const savedChunks = await saveResumeChunks(userId, chunks);
  return savedChunks;
}

/**
 * 3. RETRIEVAL LOGIC
 * Fetches chunks from DB, filters using keyword matching, and returns top 3 chunks.
 * Always returns top 3 chunks (never empty).
 * 
 * @param {string} query - User question
 * @param {object} [options]
 * @param {string} [options.userId] - User or Resume ID
 * @param {string} [options.resumeId] - Resume document ID
 * @param {number} [options.topK=3] - Number of top chunks to retrieve (3)
 * @returns {Promise<Array>} Relevant chunks
 */
export async function retrieveRelevantChunks(query, options = {}) {
  const { userId, resumeId, topK = 3 } = options;
  const targetId = userId || resumeId;

  // Fetch chunks from DB for this user/resume
  let chunks = await getResumeChunks(targetId);

  // If none found for targetId, retrieve available chunks
  if (!chunks || chunks.length === 0) {
    chunks = await getAllResumeChunks();
  }

  // Debug log required by specifications
  console.log("Chunks retrieved");

  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Filter stop words from user question
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'this', 'what', 'how', 'does',
    'did', 'can', 'who', 'where', 'when', 'why', 'tell', 'me', 'about'
  ]);

  const questionWords = (query || '')
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));

  // Keyword matching score
  const scoredChunks = chunks.map((chunk) => {
    const chunkText = (chunk.text || '').toLowerCase();
    let score = 0;

    questionWords.forEach((word) => {
      if (chunkText.includes(word)) {
        score += 1;
      }
    });

    return {
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      score
    };
  });

  // Sort by highest score first
  scoredChunks.sort((a, b) => b.score - a.score);

  // Always return top 3 chunks (never say "no data found")
  const relevantChunks = scoredChunks.slice(0, 3);
  return relevantChunks;
}

/**
 * 4. PASS CONTEXT TO GEMINI & GENERATE ANSWER
 * 
 * Rules:
 * - Answer ONLY from resume context
 * - If data missing -> say "Not mentioned in resume"
 * - Highlight key points in bullet format
 * - Keep answers concise and relevant
 * 
 * @param {string} query - User question
 * @param {Array} relevantChunks - Retrieved top chunks
 * @param {string} [fullResumeText] - Full resume raw text
 * @returns {Promise<string>}
 */
export async function generateRAGAnswer(query, relevantChunks, fullResumeText = '') {
  const hasValidChunks = relevantChunks && relevantChunks.length > 0 && relevantChunks.some(c => c.text && c.text.trim().length > 0);

  // Compile context blocks
  let contextBlocks = '';
  if (hasValidChunks) {
    contextBlocks = relevantChunks.map(c => `[Context Chunk]:\n${c.text.trim()}`).join('\n\n');
  }
  if (fullResumeText && fullResumeText.trim().length > 0) {
    if (contextBlocks) {
      contextBlocks += `\n\n[Full Resume Reference]:\n${fullResumeText.trim()}`;
    } else {
      contextBlocks = fullResumeText.trim();
    }
  }

  const prompt = `You are a strict, factual Resume Intelligence Assistant. You are answering a question about a candidate's resume.

MANDATORY RULES:
1. Answer ONLY using facts explicitly found in the Resume Context below. Do NOT use outside knowledge or make assumptions.
2. If any requested information, skill, metric, company, date, or detail is NOT explicitly mentioned or cannot be determined from the resume context, state:
• Not mentioned in resume.
3. Highlight all key points in bullet format. Every single point must start with a bullet "• ". Bold key skills, metrics, titles, or concepts (e.g., • **Skill / Metric**: details).
4. Keep answers concise, factual, and strictly relevant. Do NOT add conversational filler, pleasantries, or intros (no "Based on the resume", no "Sure!", no concluding remarks).

RESUME CONTEXT:
${contextBlocks || 'No resume text available.'}

QUESTION:
${query}

ANSWER (Concise bullets only; state "• Not mentioned in resume." if data is missing):`;

  const ai = getGeminiClient();

  if (ai && (contextBlocks || hasValidChunks)) {
    try {
      const response = await executeGeminiGenerate(
        ai,
        {
          contents: prompt,
          config: {
            temperature: 0.1
          }
        },
        7000
      );

      if (response && response.text) {
        const textAnswer = response.text.trim();
        if (textAnswer) {
          return formatRAGResponse(textAnswer, query, contextBlocks);
        }
      }
    } catch (err) {
      console.warn('[RAG] Gemini API note, using grounded context engine:', err.message);
    }
  }

  // Grounded fallback answer adhering strictly to the same 4 rules
  return generateGroundedFallback(query, contextBlocks, relevantChunks, fullResumeText);
}

/**
 * Format and validate RAG response to guarantee bullet structure
 * and "Not mentioned in resume" consistency.
 */
function formatRAGResponse(rawText, query, context) {
  let cleaned = rawText
    .replace(/^(\s*[-*]\s+|\s*\d+\.\s+)/gm, '• ')
    .trim();

  // If the model indicates missing information in standard phrasing, standardize it
  const missingTriggers = [
    /not (mentioned|provided|found|specified|stated|available|listed) in (the )?resume/i,
    /the resume does not (mention|state|provide|contain|list)/i,
    /no (mention|information|record) (of|found) (in|about)/i,
    /not explicitly (mentioned|stated)/i
  ];

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  const formattedLines = lines.map(line => {
    let formatted = line;
    if (!formatted.startsWith('•')) {
      formatted = `• ${formatted}`;
    }

    // Standardize missing phrases to "Not mentioned in resume"
    for (const trigger of missingTriggers) {
      if (trigger.test(formatted)) {
        // Extract subject if present (e.g. • **GPA**: Not mentioned in resume.)
        const colonMatch = formatted.match(/^•\s*(\*\*[^*]+\*\*|[^:]+):\s*(.*)$/i);
        if (colonMatch && !colonMatch[1].toLowerCase().includes('resume')) {
          return `• ${colonMatch[1].trim()}: Not mentioned in resume.`;
        }
        return '• Not mentioned in resume.';
      }
    }

    return formatted;
  });

  return formattedLines.join('\n');
}

/**
 * Deterministic grounded fallback engine executing:
 * 1. Answer ONLY from resume context
 * 2. If data missing -> "• Not mentioned in resume."
 * 3. Highlight key points in bullet format
 * 4. Keep answers concise and relevant
 */
function generateGroundedFallback(query, context, chunks = [], rawText = '') {
  const fullText = (context || rawText || '').toLowerCase();
  const rawClean = (context || rawText || '');

  if (!rawClean.trim()) {
    return '• Not mentioned in resume.';
  }

  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'how', 'does', 'did',
    'can', 'who', 'where', 'when', 'why', 'tell', 'me', 'about', 'this', 'that',
    'candidate', 'candidates', 'resume', 'person', 'their', 'his', 'her', 'for',
    'with', 'and', 'or', 'in', 'on', 'at', 'to', 'from', 'of', 'have', 'has'
  ]);

  const rawQuery = (query || '').toLowerCase();
  const queryTokens = rawQuery
    .replace(/[^\w\s+#.-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  // 1. Missing data checks: attributes that frequently don't appear in engineering resumes
  const missingAttributes = [
    { keys: ['gpa', 'grade point', 'grades'], label: 'GPA' },
    { keys: ['salary', 'compensation', 'current pay', 'expected salary', 'ctc'], label: 'Salary details' },
    { keys: ['phone', 'contact number', 'mobile', 'telephone'], label: 'Phone number' },
    { keys: ['marital', 'marital status', 'married', 'single'], label: 'Marital status' },
    { keys: ['age', 'date of birth', 'dob', 'birthday'], label: 'Age / Date of birth' },
    { keys: ['nationality', 'citizenship', 'visa status', 'work authorization', 'greencard'], label: 'Citizenship / Visa status' },
    { keys: ['high school', 'secondary school', '10th', '12th'], label: 'High school' },
    { keys: ['driver', 'driving license', 'license'], label: 'Driver license' },
    { keys: ['hobbies', 'interests', 'personal interests'], label: 'Personal hobbies' },
    { keys: ['references', 'referees'], label: 'References' }
  ];

  for (const attr of missingAttributes) {
    if (attr.keys.some(k => rawQuery.includes(k))) {
      const existsInText = attr.keys.some(k => fullText.includes(k));
      if (!existsInText) {
        return `• **${attr.label}**: Not mentioned in resume.`;
      }
    }
  }

  // If query tokens are empty or not in text at all
  if (queryTokens.length === 0) {
    return '• Not mentioned in resume.';
  }

  const matchedTokens = queryTokens.filter(t => fullText.includes(t));
  if (matchedTokens.length === 0) {
    return '• Not mentioned in resume.';
  }

  // 2. Extract specific relevant sentences or bullets from text
  const rawLines = rawClean
    .split(/\r?\n|•|\u2022|\*/)
    .map(l => l.trim())
    .filter(l => l.length > 20 && !l.startsWith('[Context') && !l.startsWith('[Full'));

  const scoredLines = rawLines.map(line => {
    const lLower = line.toLowerCase();
    let score = 0;
    queryTokens.forEach(token => {
      if (lLower.includes(token)) score += 2;
    });
    // Favor lines with numbers, metrics or tech terms
    if (/\d+%|\$\d+|\d+\+|\b(increased|reduced|optimized|built|led|designed|deployed)\b/i.test(line)) {
      score += 1;
    }
    return { line, score };
  });

  scoredLines.sort((a, b) => b.score - a.score);
  const bestMatches = scoredLines.filter(m => m.score > 0).slice(0, 3);

  if (bestMatches.length === 0) {
    return '• Not mentioned in resume.';
  }

  // 3. Highlight key points in bullet format
  const bullets = bestMatches.map(item => {
    let clean = item.line.replace(/^[-*•\d.]+\s*/, '').trim();
    // Highlight metrics or key initial words
    const firstFewWords = clean.split(' ').slice(0, 3).join(' ');
    const rest = clean.split(' ').slice(3).join(' ');
    if (rest.length > 0) {
      return `• **${firstFewWords}**: ${rest}`;
    }
    return `• **${clean}**`;
  });

  return bullets.join('\n');
}

/**
 * 5. EXECUTE FULL RAG WORKFLOW
 * 
 * @param {object} params
 * @param {string} params.query - User question
 * @param {string} [params.userId] - User ID
 * @param {string} [params.resumeId] - Resume document ID
 * @param {string} [params.rawText] - Optional raw resume text
 * @param {number} [params.topK=5] - Number of chunks to retrieve
 */
export async function executeRAGQuery({ query, userId, resumeId, rawText, topK = 5 }) {
  if (!query || typeof query !== 'string') {
    throw new Error('Question query is required.');
  }

  const targetId = userId || resumeId || `resume_${Date.now()}`;

  // If raw text is provided and not yet stored, store it now
  if (rawText) {
    await storeResumeChunks(targetId, rawText);
  }

  // 1. Retrieve relevant chunks with keyword matching
  const relevantChunks = await retrieveRelevantChunks(query, {
    userId: targetId,
    resumeId: targetId,
    topK
  });

  // 2. Generate answer with Gemini prompt adhering strictly to RAG instructions
  const answer = await generateRAGAnswer(query, relevantChunks, rawText);

  return {
    success: true,
    query,
    answer,
    userId: targetId,
    retrievedCount: relevantChunks.length,
    relevantChunks
  };
}

export default {
  splitResumeIntoChunks,
  storeResumeChunks,
  retrieveRelevantChunks,
  generateRAGAnswer,
  executeRAGQuery
};
