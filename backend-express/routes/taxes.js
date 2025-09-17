const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const taxes = [
  {
    id: 1,
    name: 'VAT (Value Added Tax)',
    slug: 'vat-value-added-tax',
    rate: 20,
    is_global: true,
    country: null,
    state: null,
    zip: null,
    city: null,
    priority: 1,
    on_shipping: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Sales Tax - California',
    slug: 'sales-tax-california',
    rate: 8.25,
    is_global: false,
    country: 'US',
    state: 'CA',
    zip: null,
    city: null,
    priority: 2,
    on_shipping: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'GST (Goods and Services Tax)',
    slug: 'gst-goods-and-services-tax',
    rate: 18,
    is_global: false,
    country: 'IN',
    state: null,
    zip: null,
    city: null,
    priority: 1,
    on_shipping: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'New York City Tax',
    slug: 'new-york-city-tax',
    rate: 4.5,
    is_global: false,
    country: 'US',
    state: 'NY',
    zip: '10001',
    city: 'New York',
    priority: 3,
    on_shipping: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /taxes
// @desc    Get all taxes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      country,
      state,
      city,
      zip,
      is_global,
      limit = 50, 
      page = 1,
      orderBy = 'priority',
      sortedBy = 'ASC'
    } = req.query;
    
    let filteredTaxes = [...taxes];
    
    // Country filter
    if (country) {
      filteredTaxes = filteredTaxes.filter(tax => 
        tax.country === country || tax.is_global
      );
    }
    
    // State filter
    if (state) {
      filteredTaxes = filteredTaxes.filter(tax => 
        tax.state === state || tax.is_global || !tax.state
      );
    }
    
    // City filter
    if (city) {
      filteredTaxes = filteredTaxes.filter(tax => 
        tax.city === city || tax.is_global || !tax.city
      );
    }
    
    // ZIP filter
    if (zip) {
      filteredTaxes = filteredTaxes.filter(tax => 
        tax.zip === zip || tax.is_global || !tax.zip
      );
    }
    
    // Global filter
    if (is_global !== undefined) {
      filteredTaxes = filteredTaxes.filter(tax => 
        tax.is_global === (is_global === 'true')
      );
    }
    
    // Sort taxes by priority (lower priority first)
    filteredTaxes.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (orderBy === 'priority' || orderBy === 'rate') {
        return sortedBy === 'ASC' ? aValue - bValue : bValue - aValue;
      }
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredTaxes.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedTaxes = filteredTaxes.slice(offset, offset + perPage);

    res.json({
      data: paginatedTaxes,
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
        path: '/taxes',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get taxes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /taxes/:id
// @desc    Get single tax
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tax = taxes.find(t => t.id === parseInt(id));
    
    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax not found'
      });
    }
    
    res.json(tax);
    
  } catch (error) {
    console.error('Get tax error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /taxes
// @desc    Create new tax
// @access  Private (Super Admin)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('rate').isNumeric().withMessage('Rate is required'),
  body('is_global').isBoolean().withMessage('Global flag is required'),
  body('priority').optional().isInt({ min: 1 }),
  body('on_shipping').optional().isBoolean()
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
      rate, 
      is_global, 
      country, 
      state, 
      zip, 
      city, 
      priority = 1, 
      on_shipping = false 
    } = req.body;
    
    const newTax = {
      id: taxes.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      rate: parseFloat(rate),
      is_global,
      country: is_global ? null : country,
      state: is_global ? null : state,
      zip: is_global ? null : zip,
      city: is_global ? null : city,
      priority,
      on_shipping,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    taxes.push(newTax);
    
    res.status(201).json(newTax);
    
  } catch (error) {
    console.error('Create tax error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /taxes/:id
// @desc    Update tax
// @access  Private (Super Admin)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('rate').optional().isNumeric(),
  body('is_global').optional().isBoolean(),
  body('priority').optional().isInt({ min: 1 }),
  body('on_shipping').optional().isBoolean()
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
      rate, 
      is_global, 
      country, 
      state, 
      zip, 
      city, 
      priority, 
      on_shipping 
    } = req.body;
    
    const taxIndex = taxes.findIndex(t => t.id === parseInt(id));
    
    if (taxIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tax not found'
      });
    }
    
    const updatedTax = {
      ...taxes[taxIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(rate && { rate: parseFloat(rate) }),
      ...(is_global !== undefined && { 
        is_global,
        country: is_global ? null : country,
        state: is_global ? null : state,
        zip: is_global ? null : zip,
        city: is_global ? null : city
      }),
      ...(priority && { priority }),
      ...(on_shipping !== undefined && { on_shipping }),
      updated_at: new Date().toISOString()
    };
    
    taxes[taxIndex] = updatedTax;
    
    res.json(updatedTax);
    
  } catch (error) {
    console.error('Update tax error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /taxes/:id
// @desc    Delete tax
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const taxIndex = taxes.findIndex(t => t.id === parseInt(id));
    
    if (taxIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tax not found'
      });
    }
    
    const deletedTax = taxes.splice(taxIndex, 1)[0];
    
    res.json(deletedTax);
    
  } catch (error) {
    console.error('Delete tax error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /taxes/calculate
// @desc    Calculate tax for an order
// @access  Public
router.post('/calculate', [
  body('amount').isNumeric().withMessage('Amount is required'),
  body('country').optional().isString(),
  body('state').optional().isString(),
  body('city').optional().isString(),
  body('zip').optional().isString(),
  body('shipping_amount').optional().isNumeric()
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

    const { amount, country, state, city, zip, shipping_amount = 0 } = req.body;
    
    let applicableTaxes = taxes.filter(tax => {
      if (tax.is_global) return true;
      if (tax.country && tax.country !== country) return false;
      if (tax.state && tax.state !== state) return false;
      if (tax.city && tax.city !== city) return false;
      if (tax.zip && tax.zip !== zip) return false;
      return true;
    });
    
    // Sort by priority and apply only the highest priority tax
    applicableTaxes.sort((a, b) => a.priority - b.priority);
    const taxToApply = applicableTaxes[0];
    
    if (!taxToApply) {
      return res.json({
        success: true,
        tax_amount: 0,
        total_amount: parseFloat(amount) + parseFloat(shipping_amount),
        applied_tax: null
      });
    }
    
    let taxableAmount = parseFloat(amount);
    if (taxToApply.on_shipping) {
      taxableAmount += parseFloat(shipping_amount);
    }
    
    const taxAmount = (taxableAmount * taxToApply.rate) / 100;
    const totalAmount = parseFloat(amount) + parseFloat(shipping_amount) + taxAmount;
    
    res.json({
      success: true,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      applied_tax: {
        id: taxToApply.id,
        name: taxToApply.name,
        rate: taxToApply.rate,
        on_shipping: taxToApply.on_shipping
      }
    });
    
  } catch (error) {
    console.error('Calculate tax error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
