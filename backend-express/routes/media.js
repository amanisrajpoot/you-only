const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Mock database - replace with actual database queries
const mediaFiles = [
  {
    id: 1,
    name: 'sample-image-1.jpg',
    original_name: 'sample-image-1.jpg',
    file_path: '/uploads/sample-image-1.jpg',
    url: '/uploads/sample-image-1.jpg',
    mime_type: 'image/jpeg',
    size: 1024000,
    width: 1920,
    height: 1080,
    alt: 'Sample image 1',
    caption: 'This is a sample image',
    uploaded_by: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'sample-image-2.png',
    original_name: 'sample-image-2.png',
    file_path: '/uploads/sample-image-2.png',
    url: '/uploads/sample-image-2.png',
    mime_type: 'image/png',
    size: 2048000,
    width: 1200,
    height: 800,
    alt: 'Sample image 2',
    caption: 'Another sample image',
    uploaded_by: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper function to get image dimensions
const getImageDimensions = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: null, height: null };
  }
};

// @route   GET /api/media
// @desc    Get all media files
// @access  Private (Admin)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      mime_type,
      uploaded_by,
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredMedia = [...mediaFiles];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredMedia = filteredMedia.filter(media => 
        media.name.toLowerCase().includes(searchTerm) ||
        media.alt.toLowerCase().includes(searchTerm) ||
        media.caption.toLowerCase().includes(searchTerm)
      );
    }

    // MIME type filter
    if (mime_type) {
      filteredMedia = filteredMedia.filter(media => 
        media.mime_type.includes(mime_type)
      );
    }

    // Uploaded by filter
    if (uploaded_by) {
      filteredMedia = filteredMedia.filter(media => 
        media.uploaded_by === parseInt(uploaded_by)
      );
    }

    // Sort media
    filteredMedia.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredMedia.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedMedia = filteredMedia.slice(offset, offset + perPage);

    res.json({
      success: true,
      data: paginatedMedia,
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
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/media/:id
// @desc    Get single media file
// @access  Private (Admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const media = mediaFiles.find(m => m.id === parseInt(id));

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    res.json({
      success: true,
      data: media
    });

  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/media/upload
// @desc    Upload media files
// @access  Private (Admin)
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      // Get image dimensions
      const dimensions = await getImageDimensions(file.path);

      // Create media record
      const mediaFile = {
        id: mediaFiles.length + 1,
        name: file.filename,
        original_name: file.originalname,
        file_path: `/uploads/${file.filename}`,
        url: `/uploads/${file.filename}`,
        mime_type: file.mimetype,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        alt: req.body.alt || file.originalname,
        caption: req.body.caption || '',
        uploaded_by: 1, // TODO: Get from authenticated user
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mediaFiles.push(mediaFile);
      uploadedFiles.push(mediaFile);
    }

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/media/:id
// @desc    Update media file
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mediaIndex = mediaFiles.findIndex(m => m.id === parseInt(id));

    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    const { alt, caption } = req.body;

    // Update media file
    const updatedMedia = {
      ...mediaFiles[mediaIndex],
      ...(alt !== undefined && { alt }),
      ...(caption !== undefined && { caption }),
      updated_at: new Date().toISOString()
    };

    mediaFiles[mediaIndex] = updatedMedia;

    res.json({
      success: true,
      message: 'Media file updated successfully',
      data: updatedMedia
    });

  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/media/:id
// @desc    Delete media file
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mediaIndex = mediaFiles.findIndex(m => m.id === parseInt(id));

    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    const mediaFile = mediaFiles[mediaIndex];

    // Delete physical file
    const filePath = path.join(__dirname, '..', mediaFile.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    const deletedMedia = mediaFiles.splice(mediaIndex, 1)[0];

    res.json({
      success: true,
      message: 'Media file deleted successfully',
      data: deletedMedia
    });

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/media/resize
// @desc    Resize media files
// @access  Private (Admin)
router.post('/resize', async (req, res) => {
  try {
    const { file_id, width, height, quality = 90 } = req.body;

    if (!file_id || !width || !height) {
      return res.status(400).json({
        success: false,
        message: 'file_id, width, and height are required'
      });
    }

    const mediaFile = mediaFiles.find(m => m.id === parseInt(file_id));
    if (!mediaFile) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    const originalPath = path.join(__dirname, '..', mediaFile.file_path);
    const resizedPath = path.join(__dirname, '..', mediaFile.file_path.replace('.', `_${width}x${height}.`));

    // Resize image
    await sharp(originalPath)
      .resize(parseInt(width), parseInt(height))
      .jpeg({ quality: parseInt(quality) })
      .toFile(resizedPath);

    // Create new media record for resized image
    const resizedMedia = {
      id: mediaFiles.length + 1,
      name: path.basename(resizedPath),
      original_name: mediaFile.original_name,
      file_path: resizedPath.replace(path.join(__dirname, '..'), ''),
      url: resizedPath.replace(path.join(__dirname, '..'), ''),
      mime_type: 'image/jpeg',
      size: fs.statSync(resizedPath).size,
      width: parseInt(width),
      height: parseInt(height),
      alt: `${mediaFile.alt} (${width}x${height})`,
      caption: mediaFile.caption,
      uploaded_by: mediaFile.uploaded_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mediaFiles.push(resizedMedia);

    res.json({
      success: true,
      message: 'Image resized successfully',
      data: resizedMedia
    });

  } catch (error) {
    console.error('Resize media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
