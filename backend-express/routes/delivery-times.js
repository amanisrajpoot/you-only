const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const deliveryTimes = [
  {
    id: 1,
    title: 'Same Day Delivery',
    slug: 'same-day-delivery',
    description: 'Get your order delivered on the same day',
    minimum_duration: 1,
    maximum_duration: 1,
    duration_unit: 'day',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Next Day Delivery',
    slug: 'next-day-delivery',
    description: 'Standard next day delivery service',
    minimum_duration: 1,
    maximum_duration: 2,
    duration_unit: 'day',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Standard Delivery',
    slug: 'standard-delivery',
    description: 'Standard delivery within 3-5 business days',
    minimum_duration: 3,
    maximum_duration: 5,
    duration_unit: 'day',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Express Delivery',
    slug: 'express-delivery',
    description: 'Express delivery within 2-3 business days',
    minimum_duration: 2,
    maximum_duration: 3,
    duration_unit: 'day',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'International Shipping',
    slug: 'international-shipping',
    description: 'International delivery within 7-14 business days',
    minimum_duration: 7,
    maximum_duration: 14,
    duration_unit: 'day',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /delivery-times
// @desc    Get all delivery times
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      active,
      duration_unit,
      limit = 50, 
      page = 1,
      orderBy = 'minimum_duration',
      sortedBy = 'ASC'
    } = req.query;
    
    let filteredDeliveryTimes = [...deliveryTimes];
    
    // Active filter
    if (active !== undefined) {
      filteredDeliveryTimes = filteredDeliveryTimes.filter(dt => 
        dt.active === (active === 'true')
      );
    }
    
    // Duration unit filter
    if (duration_unit) {
      filteredDeliveryTimes = filteredDeliveryTimes.filter(dt => 
        dt.duration_unit === duration_unit
      );
    }
    
    // Sort delivery times
    filteredDeliveryTimes.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (orderBy === 'minimum_duration' || orderBy === 'maximum_duration') {
        return sortedBy === 'ASC' ? aValue - bValue : bValue - aValue;
      }
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredDeliveryTimes.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedDeliveryTimes = filteredDeliveryTimes.slice(offset, offset + perPage);

    res.json({
      data: paginatedDeliveryTimes,
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
        path: '/delivery-times',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get delivery times error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /delivery-times/:id
// @desc    Get single delivery time
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryTime = deliveryTimes.find(dt => dt.id === parseInt(id));
    
    if (!deliveryTime) {
      return res.status(404).json({
        success: false,
        message: 'Delivery time not found'
      });
    }
    
    res.json(deliveryTime);
    
  } catch (error) {
    console.error('Get delivery time error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /delivery-times
// @desc    Create new delivery time
// @access  Private (Super Admin)
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('minimum_duration').isInt({ min: 1 }).withMessage('Minimum duration is required'),
  body('maximum_duration').isInt({ min: 1 }).withMessage('Maximum duration is required'),
  body('duration_unit').isIn(['hour', 'day', 'week']).withMessage('Invalid duration unit'),
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

    const { title, description, minimum_duration, maximum_duration, duration_unit, active = true } = req.body;
    
    // Validate duration logic
    if (parseInt(minimum_duration) > parseInt(maximum_duration)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum duration cannot be greater than maximum duration'
      });
    }
    
    const newDeliveryTime = {
      id: deliveryTimes.length + 1,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description,
      minimum_duration: parseInt(minimum_duration),
      maximum_duration: parseInt(maximum_duration),
      duration_unit,
      active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    deliveryTimes.push(newDeliveryTime);
    
    res.status(201).json(newDeliveryTime);
    
  } catch (error) {
    console.error('Create delivery time error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /delivery-times/:id
// @desc    Update delivery time
// @access  Private (Super Admin)
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('minimum_duration').optional().isInt({ min: 1 }),
  body('maximum_duration').optional().isInt({ min: 1 }),
  body('duration_unit').optional().isIn(['hour', 'day', 'week']),
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
    const { title, description, minimum_duration, maximum_duration, duration_unit, active } = req.body;
    
    const deliveryTimeIndex = deliveryTimes.findIndex(dt => dt.id === parseInt(id));
    
    if (deliveryTimeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Delivery time not found'
      });
    }
    
    // Validate duration logic if both provided
    if (minimum_duration && maximum_duration) {
      if (parseInt(minimum_duration) > parseInt(maximum_duration)) {
        return res.status(400).json({
          success: false,
          message: 'Minimum duration cannot be greater than maximum duration'
        });
      }
    }
    
    const updatedDeliveryTime = {
      ...deliveryTimes[deliveryTimeIndex],
      ...(title && { title, slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(description && { description }),
      ...(minimum_duration && { minimum_duration: parseInt(minimum_duration) }),
      ...(maximum_duration && { maximum_duration: parseInt(maximum_duration) }),
      ...(duration_unit && { duration_unit }),
      ...(active !== undefined && { active }),
      updated_at: new Date().toISOString()
    };
    
    deliveryTimes[deliveryTimeIndex] = updatedDeliveryTime;
    
    res.json(updatedDeliveryTime);
    
  } catch (error) {
    console.error('Update delivery time error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /delivery-times/:id
// @desc    Delete delivery time
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryTimeIndex = deliveryTimes.findIndex(dt => dt.id === parseInt(id));
    
    if (deliveryTimeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Delivery time not found'
      });
    }
    
    const deletedDeliveryTime = deliveryTimes.splice(deliveryTimeIndex, 1)[0];
    
    res.json(deletedDeliveryTime);
    
  } catch (error) {
    console.error('Delete delivery time error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
