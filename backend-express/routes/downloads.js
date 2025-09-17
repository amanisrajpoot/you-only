const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const downloads = [
  {
    id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    order_id: 1,
    order: {
      id: 1,
      tracking_number: 'TRK123456789',
      total: 99.99,
      status: 'delivered'
    },
    product_id: 1,
    product: {
      id: 1,
      name: 'Digital Software License',
      slug: 'digital-software-license',
      price: 99.99
    },
    variation_id: 1,
    variation: {
      id: 1,
      title: 'Windows License',
      price: 99.99
    },
    digital_file_id: 1,
    digital_file: {
      id: 1,
      file_name: 'software_license_key.txt',
      file_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      file_size: 1024
    },
    download_count: 2,
    download_limit: 5,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    is_expired: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    order_id: 2,
    order: {
      id: 2,
      tracking_number: 'TRK987654321',
      total: 49.99,
      status: 'delivered'
    },
    product_id: 2,
    product: {
      id: 2,
      name: 'E-book Collection',
      slug: 'ebook-collection',
      price: 49.99
    },
    variation_id: 2,
    variation: {
      id: 2,
      title: 'PDF Format',
      price: 49.99
    },
    digital_file_id: 2,
    digital_file: {
      id: 2,
      file_name: 'ebook_collection.pdf',
      file_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      file_size: 5120
    },
    download_count: 1,
    download_limit: 3,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    is_expired: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /downloads
// @desc    Get user's downloadable files
// @access  Private (Customer)
router.get('/', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const { 
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let userDownloads = downloads.filter(d => d.user_id === user_id);
    
    // Sort downloads
    userDownloads.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userDownloads.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedDownloads = userDownloads.slice(offset, offset + perPage);

    res.json({
      data: paginatedDownloads,
      links: {
        first: `?page=1`,
        last: `?page=${totalPages}`,
        prev: currentPage > 1 ? `?page=${currentPage - 1}` : null,
        next: currentPage < totalPages ? `?page=${currentPage + 1}` : null
      },
      meta: {
        current_page: currentPage,
        from: offset + 1,
        last_page: totalPages,
        path: '/downloads',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get downloads error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /downloads/digital_file
// @desc    Generate downloadable URL
// @access  Private (Customer)
router.post('/digital_file', [
  body('digital_file_id').isInt().withMessage('Digital file ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { digital_file_id } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Find the download record
    const download = downloads.find(d => d.digital_file_id === parseInt(digital_file_id) && d.user_id === user_id);
    
    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download not found or not accessible'
      });
    }
    
    // Check if download limit exceeded
    if (download.download_count >= download.download_limit) {
      return res.status(400).json({
        success: false,
        message: 'Download limit exceeded'
      });
    }
    
    // Check if expired
    if (new Date() > new Date(download.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Download link has expired'
      });
    }
    
    // Increment download count
    download.download_count += 1;
    download.updated_at = new Date().toISOString();
    
    // Generate temporary download URL (mock implementation)
    const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      download_url: `http://localhost:8000/download_url/token/${downloadToken}`,
      expires_in: 3600, // 1 hour
      download_count: download.download_count,
      download_limit: download.download_limit
    });
    
  } catch (error) {
    console.error('Generate download URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
