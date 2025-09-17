const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const messages = [
  {
    id: 1,
    conversation_id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    body: 'Hello, I have a question about your products.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    conversation_id: 1,
    user_id: 1,
    user: {
      id: 1,
      name: 'Shop Owner',
      email: 'shop@example.com'
    },
    body: 'Thank you for your inquiry! How can I help you?',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    conversation_id: 2,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    body: 'Do you have this product in size medium?',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /messages/conversations/:conversation_id
// @desc    Get messages for a conversation
// @access  Private (Customer)
router.get('/conversations/:conversation_id', async (req, res) => {
  try {
    const { conversation_id } = req.params;
    
    const { 
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'ASC'
    } = req.query;
    
    let conversationMessages = messages.filter(m => m.conversation_id === parseInt(conversation_id));
    
    // Sort messages (usually ASC for chronological order)
    conversationMessages.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = conversationMessages.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedMessages = conversationMessages.slice(offset, offset + perPage);

    res.json({
      data: paginatedMessages,
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
        path: `/messages/conversations/${conversation_id}`,
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /messages/conversations/:conversation_id
// @desc    Send message to conversation
// @access  Private (Customer)
router.post('/conversations/:conversation_id', [
  body('body').notEmpty().withMessage('Message body is required')
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

    const { conversation_id } = req.params;
    const { body: messageBody } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const newMessage = {
      id: messages.length + 1,
      conversation_id: parseInt(conversation_id),
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      body: messageBody,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    res.status(201).json(newMessage);
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /messages/seen/:conversation_id
// @desc    Mark messages as seen
// @access  Private (Customer)
router.post('/seen/:conversation_id', async (req, res) => {
  try {
    const { conversation_id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Mark conversation as read (mock implementation)
    res.json({
      success: true,
      message: 'Messages marked as seen',
      conversation_id: parseInt(conversation_id)
    });
    
  } catch (error) {
    console.error('Mark messages as seen error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
