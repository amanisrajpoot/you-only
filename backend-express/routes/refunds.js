const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const refunds = [
  {
    id: 1,
    order_id: 1,
    order: {
      id: 1,
      tracking_number: 'TRK123456789',
      total: 99.99,
      status: 'delivered'
    },
    customer_id: 2,
    customer: {
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
    refund_policy_id: 1,
    refund_policy: {
      id: 1,
      title: 'Standard Refund Policy',
      description: '30-day return policy'
    },
    refund_reason_id: 1,
    refund_reason: {
      id: 1,
      name: 'Product Defective',
      slug: 'product-defective'
    },
    amount: 99.99,
    status: 'pending',
    title: 'Refund Request for Order #1',
    description: 'The product arrived damaged and does not work as expected.',
    images: [
      {
        id: 1,
        original: 'http://localhost:8000/uploads/refunds/damage1.jpg',
        thumbnail: 'http://localhost:8000/uploads/refunds/damage1.jpg'
      }
    ],
    note: 'Customer provided photos of damaged product',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    order_id: 2,
    order: {
      id: 2,
      tracking_number: 'TRK987654321',
      total: 149.99,
      status: 'delivered'
    },
    customer_id: 3,
    customer: {
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
    refund_policy_id: 1,
    refund_policy: {
      id: 1,
      title: 'Standard Refund Policy',
      description: '30-day return policy'
    },
    refund_reason_id: 2,
    refund_reason: {
      id: 2,
      name: 'Wrong Size',
      slug: 'wrong-size'
    },
    amount: 149.99,
    status: 'approved',
    title: 'Refund Request for Order #2',
    description: 'Received wrong size, need to return for correct size.',
    images: [],
    note: 'Approved by shop owner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /refunds
// @desc    Get user's refunds
// @access  Private (Customer)
router.get('/', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const { 
      status,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let userRefunds = refunds.filter(r => r.customer_id === user_id);
    
    // Status filter
    if (status) {
      userRefunds = userRefunds.filter(refund => refund.status === status);
    }
    
    // Sort refunds
    userRefunds.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userRefunds.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedRefunds = userRefunds.slice(offset, offset + perPage);

    res.json({
      data: paginatedRefunds,
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
        path: '/refunds',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /refunds
// @desc    Create new refund request
// @access  Private (Customer)
router.post('/', [
  body('order_id').isInt().withMessage('Order ID is required'),
  body('refund_policy_id').isInt().withMessage('Refund policy ID is required'),
  body('refund_reason_id').isInt().withMessage('Refund reason ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('images').optional().isArray()
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

    const { order_id, refund_policy_id, refund_reason_id, title, description, images } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const newRefund = {
      id: refunds.length + 1,
      order_id: parseInt(order_id),
      order: {
        id: parseInt(order_id),
        tracking_number: `TRK${order_id}${Date.now()}`,
        total: 99.99,
        status: 'delivered'
      },
      customer_id: user_id,
      customer: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      shop_id: 1,
      shop: {
        id: 1,
        name: 'Tech Store',
        slug: 'tech-store'
      },
      refund_policy_id: parseInt(refund_policy_id),
      refund_policy: {
        id: parseInt(refund_policy_id),
        title: 'Standard Refund Policy',
        description: '30-day return policy'
      },
      refund_reason_id: parseInt(refund_reason_id),
      refund_reason: {
        id: parseInt(refund_reason_id),
        name: 'Product Defective',
        slug: 'product-defective'
      },
      amount: 99.99,
      status: 'pending',
      title,
      description,
      images: images || [],
      note: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    refunds.push(newRefund);
    
    res.status(201).json(newRefund);
    
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /refunds/:id
// @desc    Get single refund
// @access  Private (Customer)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const refund = refunds.find(r => r.id === parseInt(id) && r.customer_id === user_id);
    
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }
    
    res.json(refund);
    
  } catch (error) {
    console.error('Get refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /refunds/:id
// @desc    Update refund (Super Admin)
// @access  Private (Super Admin)
router.put('/:id', [
  body('status').optional().isIn(['pending', 'approved', 'rejected']),
  body('note').optional().isString()
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
    const { status, note } = req.body;
    
    const refundIndex = refunds.findIndex(r => r.id === parseInt(id));
    
    if (refundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }
    
    const updatedRefund = {
      ...refunds[refundIndex],
      ...(status && { status }),
      ...(note && { note }),
      updated_at: new Date().toISOString()
    };
    
    refunds[refundIndex] = updatedRefund;
    
    res.json(updatedRefund);
    
  } catch (error) {
    console.error('Update refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /refunds/:id
// @desc    Delete refund (Super Admin)
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const refundIndex = refunds.findIndex(r => r.id === parseInt(id));
    
    if (refundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }
    
    const deletedRefund = refunds.splice(refundIndex, 1)[0];
    
    res.json(deletedRefund);
    
  } catch (error) {
    console.error('Delete refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
