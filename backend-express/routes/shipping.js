const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const shippings = [
  {
    id: 1,
    name: 'Standard Shipping',
    slug: 'standard-shipping',
    amount: 9.99,
    is_global: true,
    type: 'fixed',
    country: null,
    state: null,
    zip: null,
    city: null,
    minimum_order_amount: 0,
    maximum_order_amount: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Express Shipping',
    slug: 'express-shipping',
    amount: 19.99,
    is_global: true,
    type: 'fixed',
    country: null,
    state: null,
    zip: null,
    city: null,
    minimum_order_amount: 50,
    maximum_order_amount: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Free Shipping',
    slug: 'free-shipping',
    amount: 0,
    is_global: true,
    type: 'fixed',
    country: null,
    state: null,
    zip: null,
    city: null,
    minimum_order_amount: 100,
    maximum_order_amount: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Local Delivery - California',
    slug: 'local-delivery-california',
    amount: 5.99,
    is_global: false,
    type: 'fixed',
    country: 'US',
    state: 'CA',
    zip: null,
    city: null,
    minimum_order_amount: 25,
    maximum_order_amount: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /shippings
// @desc    Get all shipping methods
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      country,
      state,
      city,
      zip,
      is_global,
      active,
      limit = 50, 
      page = 1,
      orderBy = 'amount',
      sortedBy = 'ASC'
    } = req.query;
    
    let filteredShippings = [...shippings];
    
    // Active filter
    if (active !== undefined) {
      filteredShippings = filteredShippings.filter(shipping => 
        shipping.active === (active === 'true')
      );
    }
    
    // Location-based filtering
    if (country) {
      filteredShippings = filteredShippings.filter(shipping => 
        shipping.is_global || shipping.country === country
      );
    }
    
    if (state) {
      filteredShippings = filteredShippings.filter(shipping => 
        shipping.is_global || shipping.state === state || !shipping.state
      );
    }
    
    if (city) {
      filteredShippings = filteredShippings.filter(shipping => 
        shipping.is_global || shipping.city === city || !shipping.city
      );
    }
    
    if (zip) {
      filteredShippings = filteredShippings.filter(shipping => 
        shipping.is_global || shipping.zip === zip || !shipping.zip
      );
    }
    
    // Global filter
    if (is_global !== undefined) {
      filteredShippings = filteredShippings.filter(shipping => 
        shipping.is_global === (is_global === 'true')
      );
    }
    
    // Sort shippings
    filteredShippings.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (orderBy === 'amount' || orderBy === 'minimum_order_amount') {
        return sortedBy === 'ASC' ? aValue - bValue : bValue - aValue;
      }
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredShippings.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedShippings = filteredShippings.slice(offset, offset + perPage);

    res.json({
      data: paginatedShippings,
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
        path: '/shippings',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get shippings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /shippings/:id
// @desc    Get single shipping method
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipping = shippings.find(s => s.id === parseInt(id));
    
    if (!shipping) {
      return res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
    }
    
    res.json(shipping);
    
  } catch (error) {
    console.error('Get shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /shippings
// @desc    Create new shipping method
// @access  Private (Super Admin)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('amount').isNumeric().withMessage('Amount is required'),
  body('is_global').isBoolean().withMessage('Global flag is required'),
  body('type').isIn(['fixed', 'percentage']).withMessage('Invalid shipping type'),
  body('minimum_order_amount').optional().isNumeric(),
  body('maximum_order_amount').optional().isNumeric(),
  body('active').optional().isBoolean()
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

    const { 
      name, 
      amount, 
      is_global, 
      type, 
      country, 
      state, 
      zip, 
      city, 
      minimum_order_amount = 0,
      maximum_order_amount = null,
      active = true
    } = req.body;
    
    const newShipping = {
      id: shippings.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      amount: parseFloat(amount),
      is_global,
      type,
      country: is_global ? null : country,
      state: is_global ? null : state,
      zip: is_global ? null : zip,
      city: is_global ? null : city,
      minimum_order_amount: parseFloat(minimum_order_amount),
      maximum_order_amount: maximum_order_amount ? parseFloat(maximum_order_amount) : null,
      active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    shippings.push(newShipping);
    
    res.status(201).json(newShipping);
    
  } catch (error) {
    console.error('Create shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /shippings/:id
// @desc    Update shipping method
// @access  Private (Super Admin)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('amount').optional().isNumeric(),
  body('is_global').optional().isBoolean(),
  body('type').optional().isIn(['fixed', 'percentage']),
  body('minimum_order_amount').optional().isNumeric(),
  body('maximum_order_amount').optional().isNumeric(),
  body('active').optional().isBoolean()
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
    const { 
      name, 
      amount, 
      is_global, 
      type, 
      country, 
      state, 
      zip, 
      city, 
      minimum_order_amount,
      maximum_order_amount,
      active
    } = req.body;
    
    const shippingIndex = shippings.findIndex(s => s.id === parseInt(id));
    
    if (shippingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
    }
    
    const updatedShipping = {
      ...shippings[shippingIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(is_global !== undefined && { 
        is_global,
        country: is_global ? null : country,
        state: is_global ? null : state,
        zip: is_global ? null : zip,
        city: is_global ? null : city
      }),
      ...(type && { type }),
      ...(minimum_order_amount !== undefined && { minimum_order_amount: parseFloat(minimum_order_amount) }),
      ...(maximum_order_amount !== undefined && { maximum_order_amount: maximum_order_amount ? parseFloat(maximum_order_amount) : null }),
      ...(active !== undefined && { active }),
      updated_at: new Date().toISOString()
    };
    
    shippings[shippingIndex] = updatedShipping;
    
    res.json(updatedShipping);
    
  } catch (error) {
    console.error('Update shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /shippings/:id
// @desc    Delete shipping method
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shippingIndex = shippings.findIndex(s => s.id === parseInt(id));
    
    if (shippingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
    }
    
    const deletedShipping = shippings.splice(shippingIndex, 1)[0];
    
    res.json(deletedShipping);
    
  } catch (error) {
    console.error('Delete shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /shippings/calculate
// @desc    Calculate shipping for an order
// @access  Public
router.post('/calculate', [
  body('order_amount').isNumeric().withMessage('Order amount is required'),
  body('country').optional().isString(),
  body('state').optional().isString(),
  body('city').optional().isString(),
  body('zip').optional().isString()
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

    const { order_amount, country, state, city, zip } = req.body;
    
    let applicableShippings = shippings.filter(shipping => {
      if (!shipping.active) return false;
      if (shipping.is_global) return true;
      if (shipping.country && shipping.country !== country) return false;
      if (shipping.state && shipping.state !== state) return false;
      if (shipping.city && shipping.city !== city) return false;
      if (shipping.zip && shipping.zip !== zip) return false;
      return true;
    });
    
    // Filter by order amount
    applicableShippings = applicableShippings.filter(shipping => {
      if (shipping.minimum_order_amount && parseFloat(order_amount) < shipping.minimum_order_amount) return false;
      if (shipping.maximum_order_amount && parseFloat(order_amount) > shipping.maximum_order_amount) return false;
      return true;
    });
    
    // Sort by amount (lowest first)
    applicableShippings.sort((a, b) => a.amount - b.amount);
    
    res.json({
      success: true,
      available_shipping_methods: applicableShippings,
      recommended_shipping: applicableShippings[0] || null
    });
    
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
