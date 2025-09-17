const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const faqs = [
  {
    id: 1,
    faq_title: 'How do I place an order?',
    faq_description: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You can pay using various payment methods including credit cards, PayPal, and bank transfers.',
    slug: 'how-do-i-place-an-order',
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    faq_title: 'What is your return policy?',
    faq_description: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items like electronics have specific return conditions.',
    slug: 'what-is-your-return-policy',
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    faq_title: 'How long does shipping take?',
    faq_description: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days. International shipping may take 7-14 business days.',
    slug: 'how-long-does-shipping-take',
    language: 'en',
    is_approved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    faq_title: 'Do you offer international shipping?',
    faq_description: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination. Check our shipping page for detailed information.',
    slug: 'do-you-offer-international-shipping',
    language: 'en',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /faqs
// @desc    Get all FAQs
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
    
    let filteredFaqs = [...faqs];
    
    // Language filter
    filteredFaqs = filteredFaqs.filter(faq => faq.language === language);
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredFaqs = filteredFaqs.filter(faq => 
        faq.faq_title.toLowerCase().includes(searchTerm) ||
        faq.faq_description.toLowerCase().includes(searchTerm)
      );
    }

    // Approval filter
    if (is_approved !== undefined) {
      filteredFaqs = filteredFaqs.filter(faq => 
        faq.is_approved === (is_approved === 'true')
      );
    }

    // Sort FAQs
    filteredFaqs.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredFaqs.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedFaqs = filteredFaqs.slice(offset, offset + perPage);

    res.json({
      data: paginatedFaqs,
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
        path: '/faqs',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /faqs/:id
// @desc    Get single FAQ
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = faqs.find(f => f.id === parseInt(id));
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    res.json(faq);
    
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /faqs
// @desc    Create new FAQ
// @access  Private (Staff/Store Owner)
router.post('/', [
  body('faq_title').notEmpty().withMessage('FAQ title is required'),
  body('faq_description').notEmpty().withMessage('FAQ description is required'),
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

    const { faq_title, faq_description, language = 'en' } = req.body;
    
    const newFaq = {
      id: faqs.length + 1,
      faq_title,
      faq_description,
      slug: faq_title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      language,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    faqs.push(newFaq);
    
    res.status(201).json(newFaq);
    
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /faqs/:id
// @desc    Update FAQ
// @access  Private (Staff/Store Owner)
router.put('/:id', [
  body('faq_title').optional().notEmpty(),
  body('faq_description').optional().notEmpty(),
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
    const { faq_title, faq_description, language } = req.body;
    
    const faqIndex = faqs.findIndex(f => f.id === parseInt(id));
    
    if (faqIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    const updatedFaq = {
      ...faqs[faqIndex],
      ...(faq_title && { faq_title, slug: faq_title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(faq_description && { faq_description }),
      ...(language && { language }),
      updated_at: new Date().toISOString()
    };
    
    faqs[faqIndex] = updatedFaq;
    
    res.json(updatedFaq);
    
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /faqs/:id
// @desc    Delete FAQ
// @access  Private (Staff/Store Owner)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const faqIndex = faqs.findIndex(f => f.id === parseInt(id));
    
    if (faqIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    const deletedFaq = faqs.splice(faqIndex, 1)[0];
    
    res.json(deletedFaq);
    
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
