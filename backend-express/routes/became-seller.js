const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const becameSellerRequests = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    message: 'I would like to become a seller on your platform',
    status: 'pending',
    shop_name: 'John\'s Electronics',
    shop_description: 'Quality electronics and gadgets',
    address: '123 Main St, City, State',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    message: 'Interested in selling handmade crafts',
    status: 'approved',
    shop_name: 'Jane\'s Crafts',
    shop_description: 'Handmade crafts and artisanal products',
    address: '456 Oak Ave, City, State',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1234567892',
    message: 'Want to sell vintage items',
    status: 'rejected',
    shop_name: 'Mike\'s Vintage',
    shop_description: 'Vintage and antique items',
    address: '789 Pine St, City, State',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /became-seller
// @desc    Get all became seller requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      status,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredRequests = [...becameSellerRequests];
    
    // Status filter
    if (status) {
      filteredRequests = filteredRequests.filter(request => 
        request.status === status
      );
    }
    
    // Sort requests
    filteredRequests.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (orderBy === 'created_at' || orderBy === 'updated_at') {
        return sortedBy === 'ASC' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
      }
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredRequests.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedRequests = filteredRequests.slice(offset, offset + perPage);

    res.json({
      data: paginatedRequests,
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
        path: '/became-seller',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get became seller requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /became-seller/:id
// @desc    Get single became seller request
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = becameSellerRequests.find(r => r.id === parseInt(id));
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.json(request);
    
  } catch (error) {
    console.error('Get became seller request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /became-seller
// @desc    Create new became seller request
// @access  Public
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('message').optional().isString(),
  body('shop_name').optional().isString(),
  body('shop_description').optional().isString(),
  body('address').optional().isString()
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

    const { name, email, phone, message, shop_name, shop_description, address } = req.body;
    
    const newRequest = {
      id: becameSellerRequests.length + 1,
      name,
      email,
      phone: phone || '',
      message: message || '',
      status: 'pending',
      shop_name: shop_name || '',
      shop_description: shop_description || '',
      address: address || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    becameSellerRequests.push(newRequest);
    
    res.status(201).json(newRequest);
    
  } catch (error) {
    console.error('Create became seller request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /became-seller/:id
// @desc    Update became seller request
// @access  Private (Super Admin)
router.put('/:id', [
  body('status').optional().isIn(['pending', 'approved', 'rejected']),
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('message').optional().isString(),
  body('shop_name').optional().isString(),
  body('shop_description').optional().isString(),
  body('address').optional().isString()
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
    const { status, name, email, phone, message, shop_name, shop_description, address } = req.body;
    
    const requestIndex = becameSellerRequests.findIndex(r => r.id === parseInt(id));
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    const updatedRequest = {
      ...becameSellerRequests[requestIndex],
      ...(status && { status }),
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(message !== undefined && { message }),
      ...(shop_name !== undefined && { shop_name }),
      ...(shop_description !== undefined && { shop_description }),
      ...(address !== undefined && { address }),
      updated_at: new Date().toISOString()
    };
    
    becameSellerRequests[requestIndex] = updatedRequest;
    
    res.json(updatedRequest);
    
  } catch (error) {
    console.error('Update became seller request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /became-seller/:id
// @desc    Delete became seller request
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const requestIndex = becameSellerRequests.findIndex(r => r.id === parseInt(id));
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    const deletedRequest = becameSellerRequests.splice(requestIndex, 1)[0];
    
    res.json(deletedRequest);
    
  } catch (error) {
    console.error('Delete became seller request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
