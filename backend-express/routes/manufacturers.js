const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const manufacturers = [
  {
    id: 1,
    name: 'Apple Inc.',
    slug: 'apple-inc',
    description: 'Leading technology company known for innovative products and design.',
    website: 'https://apple.com',
    socials: [
      { type: 'twitter', url: 'https://twitter.com/apple' },
      { type: 'facebook', url: 'https://facebook.com/apple' },
      { type: 'instagram', url: 'https://instagram.com/apple' }
    ],
    image: {
      id: 1,
      original: 'http://localhost:8000/uploads/manufacturers/apple.jpg',
      thumbnail: 'http://localhost:8000/uploads/manufacturers/apple.jpg'
    },
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Samsung Electronics',
    slug: 'samsung-electronics',
    description: 'Global technology leader in electronics, semiconductors, and digital media.',
    website: 'https://samsung.com',
    socials: [
      { type: 'twitter', url: 'https://twitter.com/samsung' },
      { type: 'youtube', url: 'https://youtube.com/samsung' }
    ],
    image: {
      id: 2,
      original: 'http://localhost:8000/uploads/manufacturers/samsung.jpg',
      thumbnail: 'http://localhost:8000/uploads/manufacturers/samsung.jpg'
    },
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Sony Corporation',
    slug: 'sony-corporation',
    description: 'Japanese multinational conglomerate corporation.',
    website: 'https://sony.com',
    socials: [
      { type: 'twitter', url: 'https://twitter.com/sony' },
      { type: 'facebook', url: 'https://facebook.com/sony' }
    ],
    image: {
      id: 3,
      original: 'http://localhost:8000/uploads/manufacturers/sony.jpg',
      thumbnail: 'http://localhost:8000/uploads/manufacturers/sony.jpg'
    },
    is_approved: false,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /manufacturers
// @desc    Get all manufacturers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      is_approved,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredManufacturers = [...manufacturers];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredManufacturers = filteredManufacturers.filter(manufacturer => 
        manufacturer.name.toLowerCase().includes(searchTerm) ||
        manufacturer.description.toLowerCase().includes(searchTerm)
      );
    }

    // Approval filter
    if (is_approved !== undefined) {
      filteredManufacturers = filteredManufacturers.filter(manufacturer => 
        manufacturer.is_approved === (is_approved === 'true')
      );
    }

    // Sort manufacturers
    filteredManufacturers.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredManufacturers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedManufacturers = filteredManufacturers.slice(offset, offset + perPage);

    res.json({
      data: paginatedManufacturers,
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
        path: '/manufacturers',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get manufacturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /manufacturers/:id
// @desc    Get single manufacturer
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const manufacturer = manufacturers.find(m => m.id === parseInt(id));
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }
    
    res.json(manufacturer);
    
  } catch (error) {
    console.error('Get manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /manufacturers
// @desc    Create new manufacturer
// @access  Private (Staff/Store Owner)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('website').optional().isURL(),
  body('socials').optional().isArray()
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

    const { name, description, website, socials } = req.body;
    
    const newManufacturer = {
      id: manufacturers.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description || '',
      website: website || '',
      socials: socials || [],
      image: {
        id: manufacturers.length + 1,
        original: 'http://localhost:8000/uploads/manufacturers/default.jpg',
        thumbnail: 'http://localhost:8000/uploads/manufacturers/default.jpg'
      },
      is_approved: false,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    manufacturers.push(newManufacturer);
    
    res.status(201).json(newManufacturer);
    
  } catch (error) {
    console.error('Create manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /manufacturers/:id
// @desc    Update manufacturer
// @access  Private (Super Admin)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('website').optional().isURL(),
  body('socials').optional().isArray()
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

    const { id } = req.params;
    const { name, description, website, socials } = req.body;
    
    const manufacturerIndex = manufacturers.findIndex(m => m.id === parseInt(id));
    
    if (manufacturerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }
    
    const updatedManufacturer = {
      ...manufacturers[manufacturerIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(description && { description }),
      ...(website && { website }),
      ...(socials && { socials }),
      updated_at: new Date().toISOString()
    };
    
    manufacturers[manufacturerIndex] = updatedManufacturer;
    
    res.json(updatedManufacturer);
    
  } catch (error) {
    console.error('Update manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /manufacturers/:id
// @desc    Delete manufacturer
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const manufacturerIndex = manufacturers.findIndex(m => m.id === parseInt(id));
    
    if (manufacturerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }
    
    const deletedManufacturer = manufacturers.splice(manufacturerIndex, 1)[0];
    
    res.json(deletedManufacturer);
    
  } catch (error) {
    console.error('Delete manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /top-manufacturers
// @desc    Get top manufacturers
// @access  Public
router.get('/top-manufacturers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Mock top manufacturers data (in real app, this would be based on product count, sales, etc.)
    const topManufacturers = manufacturers
      .filter(manufacturer => manufacturer.is_approved)
      .sort((a, b) => b.id - a.id) // Simple sorting for mock
      .slice(0, parseInt(limit));
    
    res.json(topManufacturers);
    
  } catch (error) {
    console.error('Get top manufacturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
