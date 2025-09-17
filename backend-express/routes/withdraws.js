const express = require('express');
const router = express.Router();

// Mock withdraws data
const withdraws = [
  {
    id: 1,
    shop_id: 1,
    amount: 2500.00,
    status: 'pending',
    details: {
      note: 'Monthly withdrawal request',
      payment_info: {
        account: '1234567890',
        name: 'Tech Store Owner',
        email: 'owner@techstore.com'
      }
    },
    shop: {
      id: 1,
      name: 'Tech Store',
      slug: 'tech-store',
      owner: {
        id: 2,
        name: 'Store Owner',
        email: 'owner@example.com'
      }
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    shop_id: 2,
    amount: 1800.00,
    status: 'approved',
    details: {
      note: 'Weekly withdrawal',
      payment_info: {
        account: '0987654321',
        name: 'Office Supplies Owner',
        email: 'owner@officesupplies.com'
      }
    },
    shop: {
      id: 2,
      name: 'Office Supplies',
      slug: 'office-supplies',
      owner: {
        id: 3,
        name: 'Office Owner',
        email: 'office@example.com'
      }
    },
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T16:45:00Z'
  },
  {
    id: 3,
    shop_id: 3,
    amount: 3200.00,
    status: 'rejected',
    details: {
      note: 'Monthly withdrawal request',
      payment_info: {
        account: '1122334455',
        name: 'Fashion Store Owner',
        email: 'owner@fashionstore.com'
      }
    },
    shop: {
      id: 3,
      name: 'Fashion Store',
      slug: 'fashion-store',
      owner: {
        id: 4,
        name: 'Fashion Owner',
        email: 'fashion@example.com'
      }
    },
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T11:30:00Z'
  }
];

// @route   GET /withdraws
// @desc    Get all withdraws with pagination and filtering
// @access  Private (Admin/Store Owner)
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      searchJoin = 'and', 
      search,
      status,
      shop_id,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredWithdraws = [...withdraws];
    
    // Filter by status
    if (status) {
      filteredWithdraws = filteredWithdraws.filter(withdraw => withdraw.status === status);
    }
    
    // Filter by shop_id
    if (shop_id) {
      filteredWithdraws = filteredWithdraws.filter(withdraw => withdraw.shop_id === parseInt(shop_id));
    }
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredWithdraws = filteredWithdraws.filter(withdraw => 
        withdraw.shop.name.toLowerCase().includes(searchTerm) ||
        withdraw.details.note.toLowerCase().includes(searchTerm) ||
        withdraw.details.payment_info.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filteredWithdraws.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (sortedBy === 'DESC') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });
    
    // Pagination
    const total = filteredWithdraws.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedWithdraws = filteredWithdraws.slice(offset, offset + perPage);
    
    res.json({
      data: paginatedWithdraws,
      meta: {
        total,
        per_page: perPage,
        current_page: currentPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + perPage, total)
      }
    });
    
  } catch (error) {
    console.error('Get withdraws error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /withdraws/:id
// @desc    Get single withdraw
// @access  Private (Admin/Store Owner)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const withdraw = withdraws.find(w => w.id === parseInt(id));
    
    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: 'Withdraw not found'
      });
    }
    
    res.json(withdraw);
    
  } catch (error) {
    console.error('Get withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /withdraws
// @desc    Create new withdraw request
// @access  Private (Store Owner)
router.post('/', async (req, res) => {
  try {
    const { shop_id, amount, details } = req.body;
    
    const newWithdraw = {
      id: withdraws.length + 1,
      shop_id: parseInt(shop_id),
      amount: parseFloat(amount),
      status: 'pending',
      details: details || { note: 'Withdrawal request' },
      shop: {
        id: shop_id,
        name: 'Store Name',
        slug: 'store-name'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    withdraws.push(newWithdraw);
    
    res.status(201).json(newWithdraw);
    
  } catch (error) {
    console.error('Create withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /withdraws/:id
// @desc    Update withdraw status
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const withdrawIndex = withdraws.findIndex(w => w.id === parseInt(id));
    
    if (withdrawIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Withdraw not found'
      });
    }
    
    withdraws[withdrawIndex].status = status;
    withdraws[withdrawIndex].updated_at = new Date().toISOString();
    
    if (note) {
      withdraws[withdrawIndex].details.note = note;
    }
    
    res.json(withdraws[withdrawIndex]);
    
  } catch (error) {
    console.error('Update withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /withdraws/:id
// @desc    Delete withdraw
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawIndex = withdraws.findIndex(w => w.id === parseInt(id));
    
    if (withdrawIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Withdraw not found'
      });
    }
    
    const deletedWithdraw = withdraws.splice(withdrawIndex, 1)[0];
    
    res.json(deletedWithdraw);
    
  } catch (error) {
    console.error('Delete withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
