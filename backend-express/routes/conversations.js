const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const conversations = [
  {
    id: 1,
    shop_id: 1,
    shop: {
      id: 1,
      name: 'Tech Store',
      slug: 'tech-store'
    },
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    last_message: {
      id: 1,
      body: 'Thank you for your inquiry!',
      conversation_id: 1,
      user_id: 1,
      created_at: new Date().toISOString()
    },
    unread_count: 0,
    is_read: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    shop_id: 2,
    shop: {
      id: 2,
      name: 'Fashion Hub',
      slug: 'fashion-hub'
    },
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    last_message: {
      id: 2,
      body: 'Do you have this in size medium?',
      conversation_id: 2,
      user_id: 3,
      created_at: new Date().toISOString()
    },
    unread_count: 1,
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /conversations
// @desc    Get user's conversations
// @access  Private (Customer)
router.get('/', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const { 
      limit = 50, 
      page = 1,
      orderBy = 'updated_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let userConversations = conversations.filter(c => c.user_id === user_id);
    
    // Sort conversations
    userConversations.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userConversations.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedConversations = userConversations.slice(offset, offset + perPage);

    res.json({
      data: paginatedConversations,
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
        path: '/conversations',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /conversations
// @desc    Create new conversation
// @access  Private (Customer)
router.post('/', [
  body('shop_id').isInt().withMessage('Shop ID is required')
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

    const { shop_id } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(c => c.shop_id === parseInt(shop_id) && c.user_id === user_id);
    
    if (existingConversation) {
      return res.status(400).json({
        success: false,
        message: 'Conversation already exists'
      });
    }
    
    const newConversation = {
      id: conversations.length + 1,
      shop_id: parseInt(shop_id),
      shop: {
        id: parseInt(shop_id),
        name: 'Tech Store',
        slug: 'tech-store'
      },
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      last_message: null,
      unread_count: 0,
      is_read: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    conversations.push(newConversation);
    
    res.status(201).json(newConversation);
    
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /conversations/:conversation_id
// @desc    Get single conversation
// @access  Private (Customer)
router.get('/:conversation_id', async (req, res) => {
  try {
    const { conversation_id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const conversation = conversations.find(c => c.id === parseInt(conversation_id) && c.user_id === user_id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    res.json(conversation);
    
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
