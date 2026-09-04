import { parseResume, analyzeResumeText } from './resumeParser.js';
import { saveResumeRecord, getResumeHistory, getResumeByIdRecord, getLatestResumeRecord } from './db.js';
import { storeResumeChunks, executeRAGQuery } from './ragService.js';
import { calculateATSScoreService, rewriteResumeService, analyzeKeywordGapService } from './aiService.js';

/**
 * Controller to handle PDF resume upload, pdf-parse text extraction,
 * MongoDB persistence, chunking, and returning the extracted text.
 */
export async function uploadResume(req, res) {
  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a resume PDF file.'
      });
    }

    // 2. Debug log: File received
    console.log("File received:", req.file?.originalname);

    const { originalname, mimetype, size, buffer } = req.file;
    const targetRole = req.body.targetRole || 'Senior Full Stack Engineer';

    // 3. Extract text safely using parseResume
    let text = '';
    try {
      if (mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf')) {
        text = await parseResume(buffer);
      } else {
        text = buffer.toString('utf-8').trim();
      }
    } catch (parseErr) {
      console.error('[Resume Parse Error]:', parseErr.message);
      return res.status(422).json({
        success: false,
        error: parseErr.message || 'PDF is scanned or unreadable. Please upload text-based resume'
      });
    }

    if (!text || text.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'PDF is scanned or unreadable. Please upload text-based resume'
      });
    }

    // 4. Debug log: Text length
    console.log("Text length:", text.length);

    // Heuristically analyze and structure extracted resume text
    const structuredResume = analyzeResumeText(text, targetRole);
    if (structuredResume.name === 'Alex Morgan') {
      const sanitizedName = originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      if (sanitizedName.length > 2) {
        structuredResume.name = sanitizedName;
      }
    }

    // Save text and structured data in MongoDB
    const userId = req.userId || req.user?.id || req.user?.userId || req.body?.userId || 'guest_user';

    const saveResult = await saveResumeRecord({
      userId,
      fileName: originalname,
      fileSize: size,
      mimeType: mimetype,
      rawText: text,
      fullText: text,
      parsedData: structuredResume,
      targetRole,
      atsScore: structuredResume.atsScore
    });

    // Split resume text into chunks and store in MongoDB for RAG
    const storedChunks = await storeResumeChunks(saveResult.id, text);

    // 5. Return extracted text in JSON
    return res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      text,
      extractedText: text,
      rawText: text,
      fileName: originalname,
      documentId: saveResult.id,
      chunksCount: storedChunks.length,
      resume: structuredResume
    });
  } catch (error) {
    console.error('[Upload Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'PDF is scanned or unreadable. Please upload text-based resume'
    });
  }
}

/**
 * Controller to get the latest uploaded resume
 * GET /api/resume/latest
 */
export async function getLatestResume(req, res) {
  try {
    const resumeDoc = await getLatestResumeRecord();
    if (!resumeDoc) {
      return res.status(200).json({
        success: true,
        message: 'No resume uploaded yet.',
        resume: null
      });
    }

    const structured = resumeDoc.parsedData || analyzeResumeText(resumeDoc.rawText, resumeDoc.targetRole);
    
    return res.status(200).json({
      success: true,
      resume: structured,
      name: structured.name,
      role: structured.targetRole,
      skills: structured.skills || [],
      experience: structured.experienceLevel,
      rawText: resumeDoc.rawText,
      fullText: resumeDoc.fullText || resumeDoc.rawText,
      fileName: resumeDoc.fileName,
      documentId: resumeDoc._id ? resumeDoc._id.toString() : resumeDoc.id,
      uploadedAt: resumeDoc.uploadedAt || resumeDoc.createdAt
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Controller to get all saved resumes from MongoDB
 */
export async function getResumes(req, res) {
  try {
    const resumes = await getResumeHistory(20);
    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Controller to get a specific resume by ID
 */
export async function getResumeById(req, res) {
  try {
    const { id } = req.params;
    const resume = await getResumeByIdRecord(id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: `Resume with ID "${id}" not found.`
      });
    }
    return res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Parse raw text directly (pasted text)
 */
export async function parseRawTextController(req, res) {
  try {
    const { text, targetRole = 'Senior Full Stack Engineer' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide resume text in the request body.'
      });
    }

    const structuredResume = analyzeResumeText(text, targetRole);
    const saveResult = await saveResumeRecord({
      fileName: 'Pasted Resume.txt',
      fileSize: Buffer.byteLength(text, 'utf8'),
      mimeType: 'text/plain',
      rawText: text,
      parsedData: structuredResume,
      targetRole,
      atsScore: structuredResume.atsScore
    });

    const storedChunks = await storeResumeChunks(saveResult.id, text);

    return res.status(200).json({
      success: true,
      rawText: text,
      text,
      documentId: saveResult.id,
      chunksCount: storedChunks.length,
      resume: structuredResume
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Chat Controller with RAG Keyword matching & Gemini context
 */
export async function handleChatQuery(req, res) {
  try {
    const query = req.body.message || req.body.query;
    let { resumeId, rawText } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Question query is required.'
      });
    }

    if (!rawText && resumeId) {
      const rec = await getResumeByIdRecord(resumeId);
      if (rec) rawText = rec.rawText || rec.fullText;
    }
    if (!rawText) {
      const latest = await getLatestResumeRecord();
      if (latest) {
        rawText = latest.rawText || latest.fullText;
        if (!resumeId) resumeId = latest._id ? latest._id.toString() : latest.id;
      }
    }

    const result = await executeRAGQuery({
      query,
      resumeId,
      rawText,
      topK: 5
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * AI ATS Score Calculation
 */
export async function handleATSScore(req, res) {
  try {
    const { resumeText, text, rawText, targetRole, role, jobDescription, jobDesc } = req.body || {};
    const content = resumeText || text || rawText;
    if (!content || (typeof content === 'string' && content.trim().length === 0)) {
      return res.status(400).json({ success: false, error: 'Resume text is required.' });
    }

    const scoreResult = await calculateATSScoreService({
      text: content,
      targetRole: targetRole || role || 'Senior Full Stack Engineer',
      jobDescription: jobDescription || jobDesc || ''
    });

    return res.status(200).json({
      success: true,
      ...scoreResult,
      data: scoreResult
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * AI Bullet Point Rewriter
 */
export async function handleResumeRewrite(req, res) {
  try {
    const { bulletPoint, bullet, text, role, targetRole, style, mode } = req.body || {};
    const inputBullet = bulletPoint || bullet || text;
    if (!inputBullet || (typeof inputBullet === 'string' && inputBullet.trim().length === 0)) {
      return res.status(400).json({ success: false, error: 'Bullet point text is required.' });
    }

    const rewriteResult = await rewriteResumeService({
      bullet: inputBullet,
      text: inputBullet,
      targetRole: targetRole || role || 'Senior Full Stack Engineer',
      mode: mode || style || 'google_xyz'
    });

    return res.status(200).json({
      success: true,
      ...rewriteResult,
      data: rewriteResult
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * AI Keyword Gap Analysis
 */
export async function handleKeywordGap(req, res) {
  try {
    const { resumeText, text, rawText, jobDescription, jobDesc, targetRole, role } = req.body || {};
    const content = resumeText || text || rawText;
    if (!content || (typeof content === 'string' && content.trim().length === 0)) {
      return res.status(400).json({ success: false, error: 'Resume text is required.' });
    }

    const gapResult = await analyzeKeywordGapService({
      text: content,
      jobDescription: jobDescription || jobDesc || '',
      targetRole: targetRole || role || 'Senior Full Stack Engineer'
    });

    return res.status(200).json({
      success: true,
      ...gapResult,
      data: gapResult
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Auth Login Controller
 */
export async function loginUser(req, res) {
  try {
    const { email, password, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    
    // Format fallback name from email username if name is not explicitly passed
    let userName = name;
    if (!userName || userName.trim().length === 0) {
      const emailPrefix = email.split('@')[0] || 'User';
      // Capitalize email prefix like "alex.morgan" -> "Alex Morgan" or "john" -> "John"
      userName = emailPrefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: `demo_token_${Date.now()}`,
      user: {
        id: 'user_1',
        name: userName,
        email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export default {
  uploadResume,
  getResumes,
  getResumeById,
  parseRawTextController,
  handleChatQuery,
  handleATSScore,
  handleResumeRewrite,
  handleKeywordGap,
  loginUser
};
