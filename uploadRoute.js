import express from 'express';
import multer from 'multer';
import { 
  uploadResume, 
  getResumes, 
  getResumeById, 
  getLatestResume,
  parseRawTextController,
  handleChatQuery,
  handleATSScore,
  handleResumeRewrite,
  handleKeywordGap
} from './resumeController.js';
import { getResumeChunks, getAllResumeChunks } from './db.js';

const router = express.Router();

// Configure Multer with in-memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
    'text/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ];

  const ext = file.originalname ? file.originalname.toLowerCase() : '';
  const isAllowedExt = ext.endsWith('.pdf') || ext.endsWith('.txt') || ext.endsWith('.docx') || ext.endsWith('.doc') || ext.endsWith('.md') || ext.endsWith('.rtf');

  if (allowedMimeTypes.includes(file.mimetype) || isAllowedExt || !file.mimetype) {
    cb(null, true);
  } else {
    // Accept file and allow multi-tier parser to handle
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter
});

// Support 'file', 'resume', 'document', or any field name seamlessly
export const uploadMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.file = req.files.find(f => f.fieldname === 'file' || f.fieldname === 'resume' || f.fieldname === 'document') || req.files[0];
    }
    next();
  });
};

/**
 * Routes
 */
// Upload PDF and parse text route (Accepts 'file', 'resume', or 'document' form fields)
router.post('/upload', uploadMiddleware, uploadResume);
router.post('/parse-text', express.json(), parseRawTextController);

// AI Feature Routes
router.post('/ats-score', express.json(), handleATSScore);
router.post('/rewrite', express.json(), handleResumeRewrite);
router.post('/keyword-gap', express.json(), handleKeywordGap);
router.post('/chat', express.json(), handleChatQuery);

router.get('/history', getResumes);
router.get('/chunks', async (req, res) => {
  try {
    const chunks = await getAllResumeChunks();
    res.json({ success: true, count: chunks.length, chunks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.get('/:id/chunks', async (req, res) => {
  try {
    const chunks = await getResumeChunks(req.params.id);
    res.json({ success: true, count: chunks.length, chunks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.get('/latest', getLatestResume);
router.get('/:id', getResumeById);

export default router;
