const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Mock attachments data
let attachments = [
  {
    id: 1,
    original: '/uploads/logo.png',
    thumbnail: '/uploads/thumbnails/logo.png',
    type: 'image',
    mimeType: 'image/png',
    size: 15420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    original: '/uploads/banner.jpg',
    thumbnail: '/uploads/thumbnails/banner.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 25680,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /attachments
// @desc    Get all attachments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredAttachments = [...attachments];
    
    // Type filter
    if (type) {
      filteredAttachments = filteredAttachments.filter(attachment => attachment.type === type);
    }

    // Sort attachments
    filteredAttachments.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredAttachments.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedAttachments = filteredAttachments.slice(offset, offset + perPage);

    res.json({
      success: true,
      data: paginatedAttachments,
      meta: {
        total,
        per_page: perPage,
        current_page: currentPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + perPage, total)
      }
    });

  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /attachments/:id
// @desc    Get single attachment
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = attachments.find(a => a.id === parseInt(id));

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    res.json({
      success: true,
      data: attachment
    });

  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /attachments
// @desc    Upload new attachment
// @access  Private (Customer/Staff/Store Owner/Super Admin)
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileUrl = `/uploads/${file.filename}`;
    
    // Create thumbnail for images
    let thumbnailUrl = null;
    if (file.mimetype.startsWith('image/')) {
      const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', file.filename);
      await sharp(file.path)
        .resize(300, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      thumbnailUrl = `/uploads/thumbnails/${file.filename}`;
    }

    // Create new attachment record
    const newAttachment = {
      id: attachments.length + 1,
      original: fileUrl,
      thumbnail: thumbnailUrl || fileUrl,
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      mimeType: file.mimetype,
      size: file.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    attachments.push(newAttachment);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: newAttachment
    });

  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /attachments/:id
// @desc    Update attachment
// @access  Private (Customer/Staff/Store Owner/Super Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attachmentIndex = attachments.findIndex(a => a.id === parseInt(id));

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Update attachment (basic info only, file replacement would need new upload)
    const updatedAttachment = {
      ...attachments[attachmentIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };

    attachments[attachmentIndex] = updatedAttachment;

    res.json({
      success: true,
      message: 'Attachment updated successfully',
      data: updatedAttachment
    });

  } catch (error) {
    console.error('Update attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /attachments/:id
// @desc    Delete attachment
// @access  Private (Customer/Staff/Store Owner/Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attachmentIndex = attachments.findIndex(a => a.id === parseInt(id));

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const deletedAttachment = attachments.splice(attachmentIndex, 1)[0];

    // TODO: Delete actual file from filesystem
    // fs.unlinkSync(path.join(__dirname, '../uploads', deletedAttachment.original));

    res.json({
      success: true,
      message: 'Attachment deleted successfully',
      data: deletedAttachment
    });

  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
