const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const refundPolicies = [
  {
    id: 1,
    title: 'Standard Refund Policy',
    slug: 'standard-refund-policy',
    target: 'customer',
    status: 'approved',
    description: 'Standard 30-day return policy for all products',
    body: `
      <h2>Standard Refund Policy</h2>
      <p>We offer a 30-day return policy for most items purchased from our store.</p>
      
      <h3>Eligibility</h3>
      <ul>
        <li>Items must be returned within 30 days of purchase</li>
        <li>Items must be in original condition with tags attached</li>
        <li>Items must not be used or damaged</li>
        <li>Digital products are not eligible for returns</li>
      </ul>
      
      <h3>Return Process</h3>
      <ol>
        <li>Contact our customer service to initiate a return</li>
        <li>Receive return authorization and shipping label</li>
        <li>Package item securely and ship back</li>
        <li>Refund will be processed within 5-7 business days</li>
      </ol>
      
      <h3>Refund Methods</h3>
      <p>Refunds will be issued to the original payment method used for purchase.</p>
    `,
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Electronics Return Policy',
    slug: 'electronics-return-policy',
    target: 'customer',
    status: 'approved',
    description: 'Special return policy for electronics and digital devices',
    body: `
      <h2>Electronics Return Policy</h2>
      <p>Special return policy for electronics and digital devices.</p>
      
      <h3>Eligibility</h3>
      <ul>
        <li>Electronics must be returned within 14 days of purchase</li>
        <li>Items must be in original packaging with all accessories</li>
        <li>No physical damage or signs of use</li>
        <li>Software licenses are non-refundable once activated</li>
      </ul>
      
      <h3>Restocking Fee</h3>
      <p>A 15% restocking fee may apply to opened electronics.</p>
    `,
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Digital Products Policy',
    slug: 'digital-products-policy',
    target: 'customer',
    status: 'pending',
    description: 'Policy for digital products and software licenses',
    body: `
      <h2>Digital Products Policy</h2>
      <p>Special policy for digital products and software licenses.</p>
      
      <h3>No Returns</h3>
      <p>Digital products including software, e-books, and digital licenses are non-refundable once delivered.</p>
      
      <h3>Technical Issues</h3>
      <p>If you experience technical issues, please contact our support team for assistance.</p>
    `,
    language: 'en',
    is_approved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /refund-policies
// @desc    Get all refund policies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      target,
      status,
      is_approved,
      language = 'en',
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredPolicies = [...refundPolicies];
    
    // Language filter
    filteredPolicies = filteredPolicies.filter(policy => policy.language === language);
    
    // Target filter
    if (target) {
      filteredPolicies = filteredPolicies.filter(policy => policy.target === target);
    }
    
    // Status filter
    if (status) {
      filteredPolicies = filteredPolicies.filter(policy => policy.status === status);
    }
    
    // Approval filter
    if (is_approved !== undefined) {
      filteredPolicies = filteredPolicies.filter(policy => 
        policy.is_approved === (is_approved === 'true')
      );
    }
    
    // Sort policies
    filteredPolicies.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredPolicies.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedPolicies = filteredPolicies.slice(offset, offset + perPage);

    res.json({
      data: paginatedPolicies,
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
        path: '/refund-policies',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get refund policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /refund-policies/:id
// @desc    Get single refund policy
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = refundPolicies.find(p => p.id === parseInt(id));
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Refund policy not found'
      });
    }
    
    res.json(policy);
    
  } catch (error) {
    console.error('Get refund policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /refund-policies
// @desc    Create new refund policy
// @access  Private (Store Owner)
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('target').isIn(['customer', 'shop']).withMessage('Invalid target'),
  body('description').notEmpty().withMessage('Description is required'),
  body('body').notEmpty().withMessage('Body content is required'),
  body('language').optional().isString()
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

    const { title, target, description, body, language = 'en' } = req.body;
    
    const newPolicy = {
      id: refundPolicies.length + 1,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      target,
      status: 'pending',
      description,
      body,
      language,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    refundPolicies.push(newPolicy);
    
    res.status(201).json(newPolicy);
    
  } catch (error) {
    console.error('Create refund policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /refund-policies/:id
// @desc    Update refund policy
// @access  Private (Store Owner)
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('target').optional().isIn(['customer', 'shop']),
  body('description').optional().notEmpty(),
  body('body').optional().notEmpty(),
  body('language').optional().isString()
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
    const { title, target, description, body, language } = req.body;
    
    const policyIndex = refundPolicies.findIndex(p => p.id === parseInt(id));
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Refund policy not found'
      });
    }
    
    const updatedPolicy = {
      ...refundPolicies[policyIndex],
      ...(title && { title, slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(target && { target }),
      ...(description && { description }),
      ...(body && { body }),
      ...(language && { language }),
      status: 'pending', // Reset to pending when updated
      is_approved: false,
      updated_at: new Date().toISOString()
    };
    
    refundPolicies[policyIndex] = updatedPolicy;
    
    res.json(updatedPolicy);
    
  } catch (error) {
    console.error('Update refund policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /refund-policies/:id
// @desc    Delete refund policy
// @access  Private (Store Owner)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const policyIndex = refundPolicies.findIndex(p => p.id === parseInt(id));
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Refund policy not found'
      });
    }
    
    const deletedPolicy = refundPolicies.splice(policyIndex, 1)[0];
    
    res.json(deletedPolicy);
    
  } catch (error) {
    console.error('Delete refund policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
