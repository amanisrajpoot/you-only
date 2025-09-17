const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const feedbacks = [
  {
    id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    model_type: 'product',
    model_id: 1,
    positive: true,
    negative: false,
    abusive: false,
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
    model_type: 'shop',
    model_id: 1,
    positive: false,
    negative: true,
    abusive: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 4,
    user: {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    model_type: 'review',
    model_id: 5,
    positive: false,
    negative: false,
    abusive: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /feedbacks
// @desc    Get all feedbacks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      model_type,
      model_id,
      positive,
      negative,
      abusive,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredFeedbacks = [...feedbacks];
    
    // Model type filter
    if (model_type) {
      filteredFeedbacks = filteredFeedbacks.filter(feedback => feedback.model_type === model_type);
    }
    
    // Model ID filter
    if (model_id) {
      filteredFeedbacks = filteredFeedbacks.filter(feedback => feedback.model_id === parseInt(model_id));
    }
    
    // Positive filter
    if (positive !== undefined) {
      filteredFeedbacks = filteredFeedbacks.filter(feedback => feedback.positive === (positive === 'true'));
    }
    
    // Negative filter
    if (negative !== undefined) {
      filteredFeedbacks = filteredFeedbacks.filter(feedback => feedback.negative === (negative === 'true'));
    }
    
    // Abusive filter
    if (abusive !== undefined) {
      filteredFeedbacks = filteredFeedbacks.filter(feedback => feedback.abusive === (abusive === 'true'));
    }
    
    // Sort feedbacks
    filteredFeedbacks.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredFeedbacks.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedFeedbacks = filteredFeedbacks.slice(offset, offset + perPage);

    res.json({
      data: paginatedFeedbacks,
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
        path: '/feedbacks',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /feedbacks/:id
// @desc    Get single feedback
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = feedbacks.find(f => f.id === parseInt(id));
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json(feedback);
    
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /feedbacks
// @desc    Create new feedback
// @access  Private (Customer)
router.post('/', [
  body('model_type').isIn(['product', 'review', 'shop', 'user', 'question']).withMessage('Invalid model type'),
  body('model_id').isInt().withMessage('Model ID is required'),
  body('positive').optional().isBoolean(),
  body('negative').optional().isBoolean(),
  body('abusive').optional().isBoolean()
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

    const { model_type, model_id, positive = false, negative = false, abusive = false } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Check if feedback already exists for this user and model
    const existingFeedback = feedbacks.find(f => 
      f.user_id === user_id && f.model_type === model_type && f.model_id === parseInt(model_id)
    );
    
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already exists for this item'
      });
    }
    
    const newFeedback = {
      id: feedbacks.length + 1,
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      model_type,
      model_id: parseInt(model_id),
      positive,
      negative,
      abusive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    feedbacks.push(newFeedback);
    
    res.status(201).json(newFeedback);
    
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /feedbacks/:id
// @desc    Update feedback
// @access  Private (Super Admin)
router.put('/:id', [
  body('positive').optional().isBoolean(),
  body('negative').optional().isBoolean(),
  body('abusive').optional().isBoolean()
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
    const { positive, negative, abusive } = req.body;
    
    const feedbackIndex = feedbacks.findIndex(f => f.id === parseInt(id));
    
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    const updatedFeedback = {
      ...feedbacks[feedbackIndex],
      ...(positive !== undefined && { positive }),
      ...(negative !== undefined && { negative }),
      ...(abusive !== undefined && { abusive }),
      updated_at: new Date().toISOString()
    };
    
    feedbacks[feedbackIndex] = updatedFeedback;
    
    res.json(updatedFeedback);
    
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /feedbacks/:id
// @desc    Delete feedback
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedbackIndex = feedbacks.findIndex(f => f.id === parseInt(id));
    
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    const deletedFeedback = feedbacks.splice(feedbackIndex, 1)[0];
    
    res.json(deletedFeedback);
    
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
