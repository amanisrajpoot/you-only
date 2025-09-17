const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const termsAndConditions = [
  {
    id: 1,
    title: 'Terms of Service',
    slug: 'terms-of-service',
    description: 'These terms of service govern your use of our platform and services. By using our platform, you agree to be bound by these terms.',
    body: `
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h2>2. Use License</h2>
      <p>Permission is granted to temporarily download one copy of the materials on our platform for personal, non-commercial transitory viewing only.</p>
      
      <h2>3. Disclaimer</h2>
      <p>The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or implied.</p>
      
      <h2>4. Limitations</h2>
      <p>In no event shall our company or its suppliers be liable for any damages arising out of the use or inability to use the materials on our platform.</p>
      
      <h2>5. Accuracy of Materials</h2>
      <p>The materials appearing on our platform could include technical, typographical, or photographic errors.</p>
      
      <h2>6. Links</h2>
      <p>We have not reviewed all of the sites linked to our platform and are not responsible for the contents of any such linked site.</p>
    `,
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    description: 'This privacy policy describes how we collect, use, and protect your personal information when you use our services.',
    body: `
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
      
      <h2>3. Information Sharing</h2>
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
      
      <h2>4. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      
      <h2>5. Cookies</h2>
      <p>We use cookies and similar tracking technologies to collect and use personal information about you.</p>
      
      <h2>6. Your Rights</h2>
      <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
    `,
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Refund Policy',
    slug: 'refund-policy',
    description: 'Our refund policy outlines the conditions under which refunds will be processed for purchases made on our platform.',
    body: `
      <h2>1. Refund Eligibility</h2>
      <p>Refunds are available for items returned within 30 days of purchase, provided they are in original condition.</p>
      
      <h2>2. Refund Process</h2>
      <p>To request a refund, please contact our customer service team with your order number and reason for return.</p>
      
      <h2>3. Processing Time</h2>
      <p>Refunds will be processed within 5-7 business days after we receive your returned item.</p>
      
      <h2>4. Non-Refundable Items</h2>
      <p>Certain items such as digital products and personalized items are not eligible for refunds.</p>
      
      <h2>5. Return Shipping</h2>
      <p>Customers are responsible for return shipping costs unless the return is due to our error.</p>
    `,
    language: 'en',
    is_approved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /terms-and-conditions
// @desc    Get all terms and conditions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search,
      language = 'en',
      is_approved,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredTerms = [...termsAndConditions];
    
    // Language filter
    filteredTerms = filteredTerms.filter(term => term.language === language);
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTerms = filteredTerms.filter(term => 
        term.title.toLowerCase().includes(searchTerm) ||
        term.description.toLowerCase().includes(searchTerm)
      );
    }

    // Approval filter
    if (is_approved !== undefined) {
      filteredTerms = filteredTerms.filter(term => 
        term.is_approved === (is_approved === 'true')
      );
    }

    // Sort terms
    filteredTerms.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredTerms.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedTerms = filteredTerms.slice(offset, offset + perPage);

    res.json({
      data: paginatedTerms,
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
        path: '/terms-and-conditions',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /terms-and-conditions/:id
// @desc    Get single term and condition
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const term = termsAndConditions.find(t => t.id === parseInt(id));
    
    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
    }
    
    res.json(term);
    
  } catch (error) {
    console.error('Get term and condition error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /terms-and-conditions
// @desc    Create new terms and conditions
// @access  Private (Store Owner)
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
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

    const { title, description, body, language = 'en' } = req.body;
    
    const newTerm = {
      id: termsAndConditions.length + 1,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description,
      body,
      language,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    termsAndConditions.push(newTerm);
    
    res.status(201).json(newTerm);
    
  } catch (error) {
    console.error('Create terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /terms-and-conditions/:id
// @desc    Update terms and conditions
// @access  Private (Store Owner)
router.put('/:id', [
  body('title').optional().notEmpty(),
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
    const { title, description, body, language } = req.body;
    
    const termIndex = termsAndConditions.findIndex(t => t.id === parseInt(id));
    
    if (termIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
    }
    
    const updatedTerm = {
      ...termsAndConditions[termIndex],
      ...(title && { title, slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(description && { description }),
      ...(body && { body }),
      ...(language && { language }),
      updated_at: new Date().toISOString()
    };
    
    termsAndConditions[termIndex] = updatedTerm;
    
    res.json(updatedTerm);
    
  } catch (error) {
    console.error('Update terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /terms-and-conditions/:id
// @desc    Delete terms and conditions
// @access  Private (Store Owner)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const termIndex = termsAndConditions.findIndex(t => t.id === parseInt(id));
    
    if (termIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
    }
    
    const deletedTerm = termsAndConditions.splice(termIndex, 1)[0];
    
    res.json(deletedTerm);
    
  } catch (error) {
    console.error('Delete terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /approve-terms-and-conditions
// @desc    Approve terms and conditions
// @access  Private (Super Admin)
router.post('/approve-terms-and-conditions', [
  body('id').isInt().withMessage('ID is required')
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

    const { id } = req.body;
    
    const termIndex = termsAndConditions.findIndex(t => t.id === parseInt(id));
    
    if (termIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
    }
    
    termsAndConditions[termIndex].is_approved = true;
    termsAndConditions[termIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Terms and conditions approved successfully',
      data: termsAndConditions[termIndex]
    });
    
  } catch (error) {
    console.error('Approve terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /disapprove-terms-and-conditions
// @desc    Disapprove terms and conditions
// @access  Private (Super Admin)
router.post('/disapprove-terms-and-conditions', [
  body('id').isInt().withMessage('ID is required')
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

    const { id } = req.body;
    
    const termIndex = termsAndConditions.findIndex(t => t.id === parseInt(id));
    
    if (termIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
    }
    
    termsAndConditions[termIndex].is_approved = false;
    termsAndConditions[termIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Terms and conditions disapproved successfully',
      data: termsAndConditions[termIndex]
    });
    
  } catch (error) {
    console.error('Disapprove terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
