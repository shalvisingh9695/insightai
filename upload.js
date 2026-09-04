import multer from 'multer';

// 1. Configure memoryStorage so file buffer is available at req.file.buffer
const storage = multer.memoryStorage();

// 2. File filter to validate PDF or text files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf') ||
    file.mimetype === 'text/plain' ||
    file.originalname.toLowerCase().endsWith('.txt')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload a PDF or plain text resume.'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB file size limit
  },
  fileFilter
});

export default upload;
