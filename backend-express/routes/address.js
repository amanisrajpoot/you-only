const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const addresses = [
  {
    id: 1,
    user_id: 2,
    title: 'Home',
    type: 'home',
    address: {
      street_address: '123 Main Street',
      country: 'United States',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      lat: 40.7128,
      lng: -74.0060
    },
    default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 2,
    title: 'Office',
    type: 'office',
    address: {
      street_address: '456 Business Ave',
      country: 'United States',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      lat: 40.7589,
      lng: -73.9851
    },
    default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 3,
    title: 'Home',
    type: 'home',
    address: {
      street_address: '789 Residential Blvd',
      country: 'United States',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      lat: 34.0522,
      lng: -118.2437
    },
    default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /address
// @desc    Get user's addresses
// @access  Private (Customer)
router.get('/', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const { 
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let userAddresses = addresses.filter(a => a.user_id === user_id);
    
    // Sort addresses
    userAddresses.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userAddresses.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedAddresses = userAddresses.slice(offset, offset + perPage);

    res.json({
      data: paginatedAddresses,
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
        path: '/address',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /address
// @desc    Create new address
// @access  Private (Customer)
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['home', 'office', 'other']).withMessage('Invalid address type'),
  body('address.street_address').notEmpty().withMessage('Street address is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zip').notEmpty().withMessage('ZIP code is required'),
  body('address.lat').optional().isFloat(),
  body('address.lng').optional().isFloat()
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

    const { title, type, address, default: isDefault } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      addresses.forEach(addr => {
        if (addr.user_id === user_id) {
          addr.default = false;
        }
      });
    }
    
    const newAddress = {
      id: addresses.length + 1,
      user_id,
      title,
      type,
      address,
      default: isDefault || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addresses.push(newAddress);
    
    res.status(201).json(newAddress);
    
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /address/:id
// @desc    Update address
// @access  Private (Customer)
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('type').optional().isIn(['home', 'office', 'other']),
  body('address.street_address').optional().notEmpty(),
  body('address.country').optional().notEmpty(),
  body('address.city').optional().notEmpty(),
  body('address.state').optional().notEmpty(),
  body('address.zip').optional().notEmpty(),
  body('address.lat').optional().isFloat(),
  body('address.lng').optional().isFloat()
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
    const { title, type, address, default: isDefault } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const addressIndex = addresses.findIndex(a => a.id === parseInt(id) && a.user_id === user_id);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      addresses.forEach(addr => {
        if (addr.user_id === user_id && addr.id !== parseInt(id)) {
          addr.default = false;
        }
      });
    }
    
    const updatedAddress = {
      ...addresses[addressIndex],
      ...(title && { title }),
      ...(type && { type }),
      ...(address && { address }),
      ...(isDefault !== undefined && { default: isDefault }),
      updated_at: new Date().toISOString()
    };
    
    addresses[addressIndex] = updatedAddress;
    
    res.json(updatedAddress);
    
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /address/:id
// @desc    Delete address
// @access  Private (Customer)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const addressIndex = addresses.findIndex(a => a.id === parseInt(id) && a.user_id === user_id);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    const deletedAddress = addresses.splice(addressIndex, 1)[0];
    
    res.json(deletedAddress);
    
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
