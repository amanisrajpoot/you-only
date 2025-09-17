const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const storeNotices = [
  {
    id: 1,
    notice: 'Welcome to our store! We are excited to have you here.',
    description: 'This is a welcome notice for all customers visiting our store.',
    type: 'notice',
    priority: 'high',
    expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    creator_id: 1,
    creator: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com'
    },
    shop_id: 1,
    shop: {
      id: 1,
      name: 'Tech Store',
      slug: 'tech-store'
    },
    is_read: false,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    notice: 'Maintenance scheduled for tomorrow',
    description: 'Our store will be under maintenance tomorrow from 2 AM to 6 AM.',
    type: 'maintenance',
    priority: 'medium',
    expire_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    creator_id: 1,
    creator: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com'
    },
    shop_id: 1,
    shop: {
      id: 1,
      name: 'Tech Store',
      slug: 'tech-store'
    },
    is_read: false,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    notice: 'New products added to inventory',
    description: 'Check out our latest collection of electronics and gadgets.',
    type: 'promotion',
    priority: 'low',
    expire_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    creator_id: 1,
    creator: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com'
    },
    shop_id: 2,
    shop: {
      id: 2,
      name: 'Fashion Hub',
      slug: 'fashion-hub'
    },
    is_read: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /store-notices
// @desc    Get all store notices
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      shop_id,
      type,
      priority,
      language = 'en',
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredNotices = [...storeNotices];
    
    // Language filter
    filteredNotices = filteredNotices.filter(notice => notice.language === language);
    
    // Shop filter
    if (shop_id) {
      filteredNotices = filteredNotices.filter(notice => notice.shop_id === parseInt(shop_id));
    }

    // Type filter
    if (type) {
      filteredNotices = filteredNotices.filter(notice => notice.type === type);
    }

    // Priority filter
    if (priority) {
      filteredNotices = filteredNotices.filter(notice => notice.priority === priority);
    }

    // Sort notices
    filteredNotices.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredNotices.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedNotices = filteredNotices.slice(offset, offset + perPage);

    res.json({
      data: paginatedNotices,
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
        path: '/store-notices',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get store notices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /store-notices/:id
// @desc    Get single store notice
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = storeNotices.find(n => n.id === parseInt(id));
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Store notice not found'
      });
    }
    
    res.json(notice);
    
  } catch (error) {
    console.error('Get store notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /store-notices
// @desc    Create new store notice
// @access  Private (Staff/Store Owner)
router.post('/', [
  body('notice').notEmpty().withMessage('Notice is required'),
  body('description').optional().isString(),
  body('type').isIn(['notice', 'maintenance', 'promotion']).withMessage('Invalid notice type'),
  body('priority').isIn(['high', 'medium', 'low']).withMessage('Invalid priority'),
  body('shop_id').optional().isInt(),
  body('expire_at').optional().isISO8601().withMessage('Invalid expire date')
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

    const { notice, description, type, priority, shop_id, expire_at } = req.body;
    
    // Mock creator ID (in real app, get from auth token)
    const creator_id = 1;
    
    const newNotice = {
      id: storeNotices.length + 1,
      notice,
      description: description || '',
      type,
      priority,
      expire_at: expire_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      creator_id,
      creator: {
        id: creator_id,
        name: 'Admin User',
        email: 'admin@example.com'
      },
      shop_id: shop_id || 1,
      shop: {
        id: shop_id || 1,
        name: 'Tech Store',
        slug: 'tech-store'
      },
      is_read: false,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    storeNotices.push(newNotice);
    
    res.status(201).json(newNotice);
    
  } catch (error) {
    console.error('Create store notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /store-notices/:id
// @desc    Update store notice
// @access  Private (Staff/Store Owner)
router.put('/:id', [
  body('notice').optional().notEmpty(),
  body('description').optional().isString(),
  body('type').optional().isIn(['notice', 'maintenance', 'promotion']),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('expire_at').optional().isISO8601()
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
    const { notice, description, type, priority, expire_at } = req.body;
    
    const noticeIndex = storeNotices.findIndex(n => n.id === parseInt(id));
    
    if (noticeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Store notice not found'
      });
    }
    
    const updatedNotice = {
      ...storeNotices[noticeIndex],
      ...(notice && { notice }),
      ...(description !== undefined && { description }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(expire_at && { expire_at }),
      updated_at: new Date().toISOString()
    };
    
    storeNotices[noticeIndex] = updatedNotice;
    
    res.json(updatedNotice);
    
  } catch (error) {
    console.error('Update store notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /store-notices/:id
// @desc    Delete store notice
// @access  Private (Staff/Store Owner)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const noticeIndex = storeNotices.findIndex(n => n.id === parseInt(id));
    
    if (noticeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Store notice not found'
      });
    }
    
    const deletedNotice = storeNotices.splice(noticeIndex, 1)[0];
    
    res.json(deletedNotice);
    
  } catch (error) {
    console.error('Delete store notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /store-notices/getStoreNoticeType
// @desc    Get store notice types
// @access  Private (Staff/Store Owner)
router.get('/getStoreNoticeType', async (req, res) => {
  try {
    const noticeTypes = [
      { value: 'notice', label: 'Notice' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'promotion', label: 'Promotion' }
    ];
    
    res.json(noticeTypes);
    
  } catch (error) {
    console.error('Get store notice types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /store-notices/getUsersToNotify
// @desc    Get users to notify
// @access  Private (Staff/Store Owner)
router.get('/getUsersToNotify', async (req, res) => {
  try {
    // Mock users data (in real app, this would fetch from database)
    const users = [
      { id: 1, name: 'Admin User', email: 'admin@example.com', type: 'admin' },
      { id: 2, name: 'John Doe', email: 'john@example.com', type: 'customer' },
      { id: 3, name: 'Jane Smith', email: 'jane@example.com', type: 'customer' },
      { id: 4, name: 'Mike Johnson', email: 'mike@example.com', type: 'customer' }
    ];
    
    res.json(users);
    
  } catch (error) {
    console.error('Get users to notify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /store-notices/read/
// @desc    Mark store notice as read
// @access  Private (Customer)
router.post('/read/', [
  body('notice_id').isInt().withMessage('Notice ID is required')
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

    const { notice_id } = req.body;
    
    const noticeIndex = storeNotices.findIndex(n => n.id === parseInt(notice_id));
    
    if (noticeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Store notice not found'
      });
    }
    
    storeNotices[noticeIndex].is_read = true;
    storeNotices[noticeIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Store notice marked as read',
      data: storeNotices[noticeIndex]
    });
    
  } catch (error) {
    console.error('Mark store notice as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /store-notices/read-all
// @desc    Mark all store notices as read
// @access  Private (Customer)
router.post('/read-all', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Mark all notices as read for the user
    storeNotices.forEach(notice => {
      notice.is_read = true;
      notice.updated_at = new Date().toISOString();
    });
    
    res.json({
      success: true,
      message: 'All store notices marked as read',
      count: storeNotices.length
    });
    
  } catch (error) {
    console.error('Mark all store notices as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
