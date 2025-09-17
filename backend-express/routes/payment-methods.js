const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const paymentMethods = [
  {
    id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    type: 'card',
    method_key: 'pm_1234567890',
    default: true,
    card_info: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025,
      funding: 'credit',
      country: 'US'
    },
    billing_info: {
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    type: 'card',
    method_key: 'pm_0987654321',
    default: false,
    card_info: {
      brand: 'mastercard',
      last4: '5555',
      exp_month: 8,
      exp_year: 2026,
      funding: 'debit',
      country: 'US'
    },
    billing_info: {
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    type: 'card',
    method_key: 'pm_1122334455',
    default: true,
    card_info: {
      brand: 'amex',
      last4: '0005',
      exp_month: 6,
      exp_year: 2027,
      funding: 'credit',
      country: 'US'
    },
    billing_info: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      address: {
        line1: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90210',
        country: 'US'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /cards
// @desc    Get user's payment methods
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
    
    let userPaymentMethods = paymentMethods.filter(pm => pm.user_id === user_id);
    
    // Sort payment methods
    userPaymentMethods.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userPaymentMethods.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedPaymentMethods = userPaymentMethods.slice(offset, offset + perPage);

    res.json({
      data: paginatedPaymentMethods,
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
        path: '/cards',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /cards
// @desc    Add new payment method
// @access  Private (Customer)
router.post('/', [
  body('type').isIn(['card', 'bank_account']).withMessage('Invalid payment method type'),
  body('method_key').notEmpty().withMessage('Method key is required'),
  body('card_info.brand').optional().isString(),
  body('card_info.last4').optional().isString(),
  body('card_info.exp_month').optional().isInt({ min: 1, max: 12 }),
  body('card_info.exp_year').optional().isInt(),
  body('billing_info.name').notEmpty().withMessage('Billing name is required'),
  body('billing_info.email').isEmail().withMessage('Valid billing email is required')
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

    const { type, method_key, card_info, billing_info, default: isDefault } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      paymentMethods.forEach(pm => {
        if (pm.user_id === user_id) {
          pm.default = false;
        }
      });
    }
    
    const newPaymentMethod = {
      id: paymentMethods.length + 1,
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      type,
      method_key,
      default: isDefault || false,
      card_info: card_info || {},
      billing_info,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    paymentMethods.push(newPaymentMethod);
    
    res.status(201).json(newPaymentMethod);
    
  } catch (error) {
    console.error('Create payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /cards/:id
// @desc    Update payment method
// @access  Private (Customer)
router.put('/:id', [
  body('billing_info.name').optional().notEmpty(),
  body('billing_info.email').optional().isEmail(),
  body('billing_info.address').optional().isObject()
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
    const { billing_info } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const paymentMethodIndex = paymentMethods.findIndex(pm => pm.id === parseInt(id) && pm.user_id === user_id);
    
    if (paymentMethodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    const updatedPaymentMethod = {
      ...paymentMethods[paymentMethodIndex],
      ...(billing_info && { billing_info }),
      updated_at: new Date().toISOString()
    };
    
    paymentMethods[paymentMethodIndex] = updatedPaymentMethod;
    
    res.json(updatedPaymentMethod);
    
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /cards/:id
// @desc    Delete payment method
// @access  Private (Customer)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const paymentMethodIndex = paymentMethods.findIndex(pm => pm.id === parseInt(id) && pm.user_id === user_id);
    
    if (paymentMethodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    const deletedPaymentMethod = paymentMethods.splice(paymentMethodIndex, 1)[0];
    
    res.json(deletedPaymentMethod);
    
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /set-default-card
// @desc    Set default payment method
// @access  Private (Customer)
router.post('/set-default-card', [
  body('payment_method_id').isInt().withMessage('Payment method ID is required')
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

    const { payment_method_id } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Find the payment method
    const paymentMethodIndex = paymentMethods.findIndex(pm => pm.id === parseInt(payment_method_id) && pm.user_id === user_id);
    
    if (paymentMethodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Unset all other defaults for this user
    paymentMethods.forEach(pm => {
      if (pm.user_id === user_id) {
        pm.default = false;
      }
    });
    
    // Set this one as default
    paymentMethods[paymentMethodIndex].default = true;
    paymentMethods[paymentMethodIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Default payment method updated successfully',
      data: paymentMethods[paymentMethodIndex]
    });
    
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /save-payment-method
// @desc    Save payment method from payment intent
// @access  Private (Customer)
router.post('/save-payment-method', [
  body('payment_intent_id').notEmpty().withMessage('Payment intent ID is required'),
  body('save_method').optional().isBoolean()
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

    const { payment_intent_id, save_method = true } = req.body;
    
    if (!save_method) {
      return res.json({
        success: true,
        message: 'Payment method not saved as requested'
      });
    }
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Mock saving payment method (in real app, this would integrate with payment provider)
    const newPaymentMethod = {
      id: paymentMethods.length + 1,
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      type: 'card',
      method_key: `pm_${Date.now()}`,
      default: false,
      card_info: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
        funding: 'credit',
        country: 'US'
      },
      billing_info: {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          line1: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    paymentMethods.push(newPaymentMethod);
    
    res.json({
      success: true,
      message: 'Payment method saved successfully',
      data: newPaymentMethod
    });
    
  } catch (error) {
    console.error('Save payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
