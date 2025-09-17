const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const ownershipTransfers = [
  {
    id: 1,
    shop_id: 1,
    current_owner_id: 1,
    new_owner_id: 2,
    status: 'pending',
    reason: 'Business transfer',
    message: 'Transferring shop ownership to new partner',
    current_owner: {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    new_owner: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    shop: {
      id: 1,
      name: 'Electronics Store',
      slug: 'electronics-store'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    shop_id: 2,
    current_owner_id: 2,
    new_owner_id: 3,
    status: 'approved',
    reason: 'Partnership dissolution',
    message: 'Transferring ownership due to partnership changes',
    current_owner: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    new_owner: {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com'
    },
    shop: {
      id: 2,
      name: 'Fashion Boutique',
      slug: 'fashion-boutique'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    shop_id: 3,
    current_owner_id: 3,
    new_owner_id: 1,
    status: 'rejected',
    reason: 'Family business transfer',
    message: 'Transferring to family member',
    current_owner: {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com'
    },
    new_owner: {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    shop: {
      id: 3,
      name: 'Home Decor',
      slug: 'home-decor'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /ownership-transfer
// @desc    Get all ownership transfer requests
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/', async (req, res) => {
  try {
    const { 
      status,
      shop_id,
      current_owner_id,
      new_owner_id,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredTransfers = [...ownershipTransfers];
    
    // Status filter
    if (status) {
      filteredTransfers = filteredTransfers.filter(transfer => 
        transfer.status === status
      );
    }
    
    // Shop ID filter
    if (shop_id) {
      filteredTransfers = filteredTransfers.filter(transfer => 
        transfer.shop_id === parseInt(shop_id)
      );
    }
    
    // Current owner filter
    if (current_owner_id) {
      filteredTransfers = filteredTransfers.filter(transfer => 
        transfer.current_owner_id === parseInt(current_owner_id)
      );
    }
    
    // New owner filter
    if (new_owner_id) {
      filteredTransfers = filteredTransfers.filter(transfer => 
        transfer.new_owner_id === parseInt(new_owner_id)
      );
    }
    
    // Sort transfers
    filteredTransfers.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (orderBy === 'created_at' || orderBy === 'updated_at') {
        return sortedBy === 'ASC' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
      }
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredTransfers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedTransfers = filteredTransfers.slice(offset, offset + perPage);

    res.json({
      data: paginatedTransfers,
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
        path: '/ownership-transfer',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get ownership transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /ownership-transfer/:id
// @desc    Get single ownership transfer request
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transfer = ownershipTransfers.find(t => t.id === parseInt(id));
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Ownership transfer request not found'
      });
    }
    
    res.json(transfer);
    
  } catch (error) {
    console.error('Get ownership transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /ownership-transfer
// @desc    Create new ownership transfer request
// @access  Private (Store Owner)
router.post('/', [
  body('shop_id').isInt().withMessage('Shop ID is required'),
  body('new_owner_id').isInt().withMessage('New owner ID is required'),
  body('reason').optional().isString(),
  body('message').optional().isString()
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

    const { shop_id, new_owner_id, reason, message } = req.body;
    
    // Mock current owner (in real app, get from auth)
    const current_owner_id = 1;
    
    const newTransfer = {
      id: ownershipTransfers.length + 1,
      shop_id: parseInt(shop_id),
      current_owner_id,
      new_owner_id: parseInt(new_owner_id),
      status: 'pending',
      reason: reason || '',
      message: message || '',
      current_owner: {
        id: current_owner_id,
        name: 'Current Owner',
        email: 'current@example.com'
      },
      new_owner: {
        id: parseInt(new_owner_id),
        name: 'New Owner',
        email: 'new@example.com'
      },
      shop: {
        id: parseInt(shop_id),
        name: 'Sample Shop',
        slug: 'sample-shop'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    ownershipTransfers.push(newTransfer);
    
    res.status(201).json(newTransfer);
    
  } catch (error) {
    console.error('Create ownership transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /ownership-transfer/:id
// @desc    Update ownership transfer request
// @access  Private (Super Admin)
router.put('/:id', [
  body('status').optional().isIn(['pending', 'approved', 'rejected']),
  body('reason').optional().isString(),
  body('message').optional().isString()
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
    const { status, reason, message } = req.body;
    
    const transferIndex = ownershipTransfers.findIndex(t => t.id === parseInt(id));
    
    if (transferIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ownership transfer request not found'
      });
    }
    
    const updatedTransfer = {
      ...ownershipTransfers[transferIndex],
      ...(status && { status }),
      ...(reason !== undefined && { reason }),
      ...(message !== undefined && { message }),
      updated_at: new Date().toISOString()
    };
    
    ownershipTransfers[transferIndex] = updatedTransfer;
    
    res.json(updatedTransfer);
    
  } catch (error) {
    console.error('Update ownership transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /ownership-transfer/:id
// @desc    Delete ownership transfer request
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transferIndex = ownershipTransfers.findIndex(t => t.id === parseInt(id));
    
    if (transferIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ownership transfer request not found'
      });
    }
    
    const deletedTransfer = ownershipTransfers.splice(transferIndex, 1)[0];
    
    res.json(deletedTransfer);
    
  } catch (error) {
    console.error('Delete ownership transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
