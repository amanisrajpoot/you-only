const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const refundReasons = [
  {
    id: 1,
    name: 'Product Defective',
    slug: 'product-defective',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Wrong Size',
    slug: 'wrong-size',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Not as Described',
    slug: 'not-as-described',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Changed Mind',
    slug: 'changed-mind',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Damaged in Shipping',
    slug: 'damaged-in-shipping',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Wrong Item Received',
    slug: 'wrong-item-received',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /refund-reasons
// @desc    Get all refund reasons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      language = 'en',
      limit = 50, 
      page = 1,
      orderBy = 'name',
      sortedBy = 'ASC'
    } = req.query;
    
    let filteredReasons = [...refundReasons];
    
    // Language filter
    filteredReasons = filteredReasons.filter(reason => reason.language === language);
    
    // Sort reasons
    filteredReasons.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredReasons.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedReasons = filteredReasons.slice(offset, offset + perPage);

    res.json({
      data: paginatedReasons,
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
        path: '/refund-reasons',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get refund reasons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /refund-reasons/:id
// @desc    Get single refund reason
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reason = refundReasons.find(r => r.id === parseInt(id));
    
    if (!reason) {
      return res.status(404).json({
        success: false,
        message: 'Refund reason not found'
      });
    }
    
    res.json(reason);
    
  } catch (error) {
    console.error('Get refund reason error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /refund-reasons
// @desc    Create new refund reason
// @access  Private (Super Admin)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('language').optional().isString()
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

    const { name, language = 'en' } = req.body;
    
    const newReason = {
      id: refundReasons.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    refundReasons.push(newReason);
    
    res.status(201).json(newReason);
    
  } catch (error) {
    console.error('Create refund reason error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /refund-reasons/:id
// @desc    Update refund reason
// @access  Private (Super Admin)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('language').optional().isString()
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
    const { name, language } = req.body;
    
    const reasonIndex = refundReasons.findIndex(r => r.id === parseInt(id));
    
    if (reasonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Refund reason not found'
      });
    }
    
    const updatedReason = {
      ...refundReasons[reasonIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(language && { language }),
      updated_at: new Date().toISOString()
    };
    
    refundReasons[reasonIndex] = updatedReason;
    
    res.json(updatedReason);
    
  } catch (error) {
    console.error('Update refund reason error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /refund-reasons/:id
// @desc    Delete refund reason
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reasonIndex = refundReasons.findIndex(r => r.id === parseInt(id));
    
    if (reasonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Refund reason not found'
      });
    }
    
    const deletedReason = refundReasons.splice(reasonIndex, 1)[0];
    
    res.json(deletedReason);
    
  } catch (error) {
    console.error('Delete refund reason error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
