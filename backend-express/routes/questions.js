const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const questions = [
  {
    id: 1,
    product_id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    shop_id: 1,
    shop: {
      id: 1,
      name: 'Tech Store',
      slug: 'tech-store'
    },
    question: 'Is this product compatible with iPhone 12?',
    answer: 'Yes, this product is fully compatible with iPhone 12 and all recent iPhone models.',
    answered_at: new Date().toISOString(),
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    product_id: 2,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    shop_id: 1,
    shop: {
      id: 1,
      name: 'Tech Store',
      slug: 'tech-store'
    },
    question: 'What is the warranty period for this product?',
    answer: 'This product comes with a 1-year manufacturer warranty.',
    answered_at: new Date().toISOString(),
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    product_id: 1,
    user_id: 4,
    user: {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    shop_id: 2,
    shop: {
      id: 2,
      name: 'Fashion Hub',
      slug: 'fashion-hub'
    },
    question: 'Does this come in different colors?',
    answer: null,
    answered_at: null,
    is_approved: false,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      product_id,
      user_id,
      shop_id,
      is_approved,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredQuestions = [...questions];
    
    // Product filter
    if (product_id) {
      filteredQuestions = filteredQuestions.filter(question => question.product_id === parseInt(product_id));
    }

    // User filter
    if (user_id) {
      filteredQuestions = filteredQuestions.filter(question => question.user_id === parseInt(user_id));
    }

    // Shop filter
    if (shop_id) {
      filteredQuestions = filteredQuestions.filter(question => question.shop_id === parseInt(shop_id));
    }

    // Approval filter
    if (is_approved !== undefined) {
      filteredQuestions = filteredQuestions.filter(question => 
        question.is_approved === (is_approved === 'true')
      );
    }

    // Sort questions
    filteredQuestions.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredQuestions.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedQuestions = filteredQuestions.slice(offset, offset + perPage);

    res.json({
      data: paginatedQuestions,
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
        path: '/questions',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /questions/:id
// @desc    Get single question
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = questions.find(q => q.id === parseInt(id));
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.json(question);
    
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /questions
// @desc    Create new question
// @access  Private (Customer)
router.post('/', [
  body('product_id').isInt().withMessage('Product ID is required'),
  body('question').notEmpty().withMessage('Question is required')
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

    const { product_id, question } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Mock shop ID (in real app, get from product)
    const shop_id = 1;
    
    const newQuestion = {
      id: questions.length + 1,
      product_id: parseInt(product_id),
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      shop_id,
      shop: {
        id: shop_id,
        name: 'Tech Store',
        slug: 'tech-store'
      },
      question,
      answer: null,
      answered_at: null,
      is_approved: false,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    questions.push(newQuestion);
    
    res.status(201).json(newQuestion);
    
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /questions/:id
// @desc    Update question (answer by staff)
// @access  Private (Staff/Store Owner)
router.put('/:id', [
  body('answer').notEmpty().withMessage('Answer is required')
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
    const { answer } = req.body;
    
    const questionIndex = questions.findIndex(q => q.id === parseInt(id));
    
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    const updatedQuestion = {
      ...questions[questionIndex],
      answer,
      answered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    questions[questionIndex] = updatedQuestion;
    
    res.json(updatedQuestion);
    
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /questions/:id
// @desc    Delete question
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionIndex = questions.findIndex(q => q.id === parseInt(id));
    
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    const deletedQuestion = questions.splice(questionIndex, 1)[0];
    
    res.json(deletedQuestion);
    
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /my-questions
// @desc    Get current user's questions
// @access  Private (Customer)
router.get('/my-questions', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const userQuestions = questions.filter(q => q.user_id === user_id);
    
    res.json({
      data: userQuestions,
      meta: {
        total: userQuestions.length
      }
    });
    
  } catch (error) {
    console.error('Get my questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
