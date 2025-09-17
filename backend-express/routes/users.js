const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock database - replace with actual database queries
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    email_verified_at: new Date().toISOString(),
    role: 'admin',
    is_active: true,
    profile: {
      avatar: '/uploads/avatars/admin.jpg',
      phone: '+1234567890',
      address: '123 Admin Street, Admin City',
      bio: 'Administrator of the system'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    email_verified_at: new Date().toISOString(),
    role: 'user',
    is_active: true,
    profile: {
      avatar: '/uploads/avatars/john.jpg',
      phone: '+1234567891',
      address: '456 User Avenue, User City',
      bio: 'Regular user of the platform'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Jane Smith',
    email: 'jane@example.com',
    email_verified_at: null,
    role: 'user',
    is_active: false,
    profile: {
      avatar: null,
      phone: '+1234567892',
      address: '789 User Road, User Town',
      bio: 'Another user account'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Validation middleware
const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'user', 'seller']).withMessage('Invalid role')
];

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      role, 
      is_active, 
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredUsers = [...users];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Role filter
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Active filter
    if (is_active !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        user.is_active === (is_active === 'true')
      );
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredUsers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedUsers = filteredUsers.slice(offset, offset + perPage);

    res.json({
      data: paginatedUsers,
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin/Owner)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin)
router.post('/', validateUser, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      role = 'user',
      profile = {}
    } = req.body;

    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      email_verified_at: null,
      role,
      is_active: true,
      profile: {
        avatar: profile.avatar || null,
        phone: profile.phone || null,
        address: profile.address || null,
        bio: profile.bio || null
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(newUser);

    res.status(201).json(newUser);

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin/Owner)
router.put('/:id', validateUser, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { 
      name, 
      email, 
      role,
      is_active,
      profile 
    } = req.body;

    // Check if email already exists (excluding current user)
    if (email && users.some(u => u.email === email && u.id !== parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(is_active !== undefined && { is_active }),
      ...(profile && { 
        profile: {
          ...users[userIndex].profile,
          ...profile
        }
      }),
      updated_at: new Date().toISOString()
    };

    users[userIndex] = updatedUser;

    res.json(updatedUser);

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (users[userIndex].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    res.json(deletedUser);

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/users/:id/activate
// @desc    Activate user
// @access  Private (Admin)
router.patch('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex].is_active = true;
    users[userIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'User activated successfully',
      data: users[userIndex]
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/users/:id/deactivate
// @desc    Deactivate user
// @access  Private (Admin)
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating admin users
    if (users[userIndex].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate admin users'
      });
    }

    users[userIndex].is_active = false;
    users[userIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: users[userIndex]
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /admin/list
// @desc    Get admin users list
// @access  Private (Super Admin)
router.get('/admin/list', async (req, res) => {
  try {
    const { 
      search, 
      is_active, 
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    // Filter admin users
    let adminUsers = users.filter(user => 
      user.role === 'admin' || user.role === 'super_admin'
    );
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      adminUsers = adminUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Active filter
    if (is_active !== undefined) {
      adminUsers = adminUsers.filter(user => 
        user.is_active === (is_active === 'true')
      );
    }

    // Sort users
    adminUsers.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = adminUsers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedUsers = adminUsers.slice(offset, offset + perPage);

    res.json({
      success: true,
      data: paginatedUsers,
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
    console.error('Get admin list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /users/block-user
// @desc    Block a user
// @access  Private (Admin)
router.post('/block-user', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userIndex = users.findIndex(u => u.id === parseInt(user_id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent blocking admin users
    if (users[userIndex].role === 'admin' || users[userIndex].role === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }

    users[userIndex].is_active = false;
    users[userIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'User blocked successfully',
      data: users[userIndex]
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /users/unblock-user
// @desc    Unblock a user
// @access  Private (Admin)
router.post('/unblock-user', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userIndex = users.findIndex(u => u.id === parseInt(user_id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex].is_active = true;
    users[userIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'User unblocked successfully',
      data: users[userIndex]
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /users/make-admin
// @desc    Make a user admin
// @access  Private (Super Admin)
router.post('/make-admin', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userIndex = users.findIndex(u => u.id === parseInt(user_id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex].role = 'admin';
    users[userIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      data: users[userIndex]
    });

  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /customers/list
// @desc    Get customers list
// @access  Private (Admin)
router.get('/customers/list', async (req, res) => {
  try {
    const { 
      search, 
      is_active, 
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    // Filter customer users
    let customerUsers = users.filter(user => user.role === 'customer' || user.role === 'user');
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      customerUsers = customerUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Active filter
    if (is_active !== undefined) {
      customerUsers = customerUsers.filter(user => 
        user.is_active === (is_active === 'true')
      );
    }

    // Sort users
    customerUsers.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = customerUsers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedUsers = customerUsers.slice(offset, offset + perPage);

    res.json({
      success: true,
      data: paginatedUsers,
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
    console.error('Get customers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
