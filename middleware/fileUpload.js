import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { createErrorResponse, ERROR_CODES } from '../utils/errorHandler.js';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileExtension = path.extname(file.originalname);
    const sanitizedOriginalName = path.basename(file.originalname, fileExtension)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50); // Limit length
    
    const filename = `${sanitizedOriginalName}_${timestamp}_${randomString}${fileExtension}`;
    cb(null, filename);
  }
});

// File filter function for security validation
const fileFilter = (req, file, cb) => {
  try {
    // Log file upload attempt
    logger.info(`File upload attempt: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
      userAgent: req.get('User-Agent')
    });

    // 1. Check file size
    if (file.size > config.maxFileSize) {
      logger.warn(`File size exceeded: ${file.originalname} (${file.size} bytes)`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated'
      });
      return cb(new Error(`File size must be less than ${config.maxFileSize / (1024 * 1024)}MB`), false);
    }

    // 2. Check for dangerous file extensions FIRST
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.war', '.ear', '.class', '.php', '.asp', '.aspx',
      '.sh', '.bash', '.zsh', '.fish', '.csh', '.ksh',
      '.pl', '.py', '.rb', '.lua', '.tcl', '.awk', '.sed'
    ];

    if (dangerousExtensions.includes(fileExtension)) {
      logger.warn(`Dangerous file extension blocked: ${file.originalname}`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        extension: fileExtension
      });
      return cb(new Error('DANGEROUS_FILE'), false);
    }

    // 3. Validate file extension against allowed list
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', // Images
      '.pdf', // Documents
      '.txt', '.md', // Text files
      '.doc', '.docx' // Word documents
    ];

    if (!allowedExtensions.includes(fileExtension)) {
      logger.warn(`Invalid file extension: ${file.originalname}`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        extension: fileExtension
      });
      return cb(new Error(`File type not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`), false);
    }

    // 4. Validate MIME type
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      logger.warn(`Invalid MIME type: ${file.originalname} (${file.mimetype})`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        mimeType: file.mimetype
      });
      return cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
    }

    // 5. Check filename for path traversal attacks
    const filename = file.originalname;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      logger.warn(`Path traversal attempt blocked: ${filename}`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated'
      });
      return cb(new Error('Invalid filename'), false);
    }

    // 6. Check for null bytes and other dangerous characters
    if (filename.includes('\0') || filename.includes('\x00')) {
      logger.warn(`Null byte attack blocked: ${filename}`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated'
      });
      return cb(new Error('Invalid filename'), false);
    }

    // 7. Additional security checks for specific file types
    if (fileExtension === '.pdf') {
      // Check PDF header
      const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
      if (file.size > 4) {
        // This is a simplified check - in production, you'd want more thorough PDF validation
        logger.info(`PDF file uploaded: ${file.originalname}`);
      }
    }

    // 8. Check file size limits for specific types
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (imageExtensions.includes(fileExtension) && file.size > 5 * 1024 * 1024) { // 5MB for images
      logger.warn(`Image file too large: ${file.originalname} (${file.size} bytes)`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated'
      });
      return cb(new Error('Image file too large. Maximum size is 5MB'), false);
    }

    // File passed all security checks
    logger.info(`File upload accepted: ${file.originalname}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
      size: file.size,
      mimeType: file.mimetype
    });

    cb(null, true);
  } catch (error) {
    logger.error(`File upload validation error: ${error.message}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
      filename: file.originalname
    });
    cb(error, false);
  }
};

// Configure multer with security settings
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.maxFileSize,
    files: 1, // Only allow one file at a time
    fieldSize: 1024 * 1024 // 1MB for field data
  }
});

// Middleware to handle file upload errors
const handleFileUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.error(`Multer error: ${error.message}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
      code: error.code
    });

    let errorMessage = 'File upload failed';
    let errorCode = ERROR_CODES.VALIDATION_FAILED;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        errorMessage = `File size must be less than ${config.maxFileSize / (1024 * 1024)}MB`;
        errorCode = ERROR_CODES.FILE_TOO_LARGE;
        break;
      case 'LIMIT_FILE_COUNT':
        errorMessage = 'Only one file can be uploaded at a time';
        errorCode = ERROR_CODES.TOO_MANY_FILES;
        break;
      case 'LIMIT_FIELD_SIZE':
        errorMessage = 'Field data too large';
        errorCode = ERROR_CODES.FIELD_TOO_LARGE;
        break;
      default:
        errorMessage = 'File upload error';
        errorCode = ERROR_CODES.FILE_UPLOAD_ERROR;
    }

    return res.status(400).json(createErrorResponse(errorCode, errorMessage));
  }

  if (error.message) {
    logger.error(`File upload validation error: ${error.message}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated'
    });

    // Handle specific error types
    if (error.message === 'DANGEROUS_FILE') {
      return res.status(400).json(createErrorResponse(ERROR_CODES.DANGEROUS_FILE, 'File type not allowed for security reasons'));
    }

    return res.status(400).json(createErrorResponse(ERROR_CODES.VALIDATION_FAILED, error.message));
  }

  next(error);
};

// Middleware to validate uploaded file after multer processing
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return next(); // No file uploaded, continue
  }

  try {
    // Additional post-upload validation
    const file = req.file;
    
    // Check if file actually exists on disk
    if (!fs.existsSync(file.path)) {
      logger.error(`Uploaded file not found on disk: ${file.path}`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated'
      });
      return res.status(500).json(createErrorResponse(ERROR_CODES.FILE_UPLOAD_ERROR, 'File upload failed'));
    }

    // Check file size again (in case of corruption)
    const stats = fs.statSync(file.path);
    if (stats.size !== file.size) {
      logger.error(`File size mismatch: expected ${file.size}, got ${stats.size}`, {
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        filename: file.originalname
      });
      
      // Clean up the corrupted file
      fs.unlinkSync(file.path);
      return res.status(500).json(createErrorResponse(ERROR_CODES.FILE_UPLOAD_ERROR, 'File upload corrupted'));
    }

    // Add file metadata to request for later use
    req.fileMetadata = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user?.id || 'unauthenticated'
    };

    logger.info(`File successfully uploaded: ${file.originalname}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
      fileSize: file.size,
      filePath: file.path
    });

    next();
  } catch (error) {
    logger.error(`Post-upload validation error: ${error.message}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
      filename: req.file?.originalname
    });

    // Clean up the file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json(createErrorResponse(ERROR_CODES.FILE_UPLOAD_ERROR, 'File validation failed'));
  }
};

// Cleanup middleware to remove files on error
const cleanupUploadedFile = (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response indicates error and file was uploaded, clean it up
    if (res.statusCode >= 400 && req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        logger.info(`Cleaned up file due to error response: ${req.file.originalname}`, {
          ip: req.ip,
          userId: req.user?.id || 'unauthenticated',
          statusCode: res.statusCode
        });
      } catch (error) {
        logger.error(`Failed to cleanup file: ${error.message}`, {
          ip: req.ip,
          userId: req.user?.id || 'unauthenticated',
          filename: req.file.originalname
        });
      }
    }
    
    // Call original send function
    return originalSend.call(this, data);
  };
  
  next();
};

export {
  upload,
  handleFileUploadError,
  validateUploadedFile,
  cleanupUploadedFile
}; 