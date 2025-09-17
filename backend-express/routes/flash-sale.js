const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const flashSales = [
  {
    id: 1,
    title: 'Black Friday Sale',
    slug: 'black-friday-sale',
    description: 'Huge discounts on all electronics and gadgets',
    type: 'percentage',
    rate: 30,
    sale_status: 'active',
    start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Summer Electronics Sale',
    slug: 'summer-electronics-sale',
    description: 'Summer special on electronics and accessories',
    type: 'fixed',
    rate: 50,
    sale_status: 'upcoming',
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Holiday Special',
    slug: 'holiday-special',
    description: 'Special holiday discounts on selected items',
    type: 'percentage',
    rate: 25,
    sale_status: 'finished',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /flash-sale
// @desc    Get all flash sales
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      sale_status,
      type,
      language = 'en',
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredFlashSales = [...flashSales];
    
    // Language filter
    filteredFlashSales = filteredFlashSales.filter(sale => sale.language === language);
    
    // Status filter
    if (sale_status) {
      filteredFlashSales = filteredFlashSales.filter(sale => sale.sale_status === sale_status);
    }
    
    // Type filter
    if (type) {
      filteredFlashSales = filteredFlashSales.filter(sale => sale.type === type);
    }
    
    // Sort flash sales
    filteredFlashSales.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredFlashSales.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedFlashSales = filteredFlashSales.slice(offset, offset + perPage);

    res.json({
      data: paginatedFlashSales,
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
        path: '/flash-sale',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get flash sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /flash-sale/:id
// @desc    Get single flash sale
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const flashSale = flashSales.find(fs => fs.id === parseInt(id));
    
    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }
    
    res.json(flashSale);
    
  } catch (error) {
    console.error('Get flash sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /flash-sale
// @desc    Create new flash sale
// @access  Private (Store Owner)
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Invalid sale type'),
  body('rate').isNumeric().withMessage('Rate is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
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

    const { title, description, type, rate, start_date, end_date, language = 'en' } = req.body;
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    const newFlashSale = {
      id: flashSales.length + 1,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description,
      type,
      rate: parseFloat(rate),
      sale_status: startDate > new Date() ? 'upcoming' : 'active',
      start_date,
      end_date,
      language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    flashSales.push(newFlashSale);
    
    res.status(201).json(newFlashSale);
    
  } catch (error) {
    console.error('Create flash sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /flash-sale/:id
// @desc    Update flash sale
// @access  Private (Store Owner)
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('type').optional().isIn(['percentage', 'fixed']),
  body('rate').optional().isNumeric(),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
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
    const { title, description, type, rate, start_date, end_date, language } = req.body;
    
    const flashSaleIndex = flashSales.findIndex(fs => fs.id === parseInt(id));
    
    if (flashSaleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }
    
    // Validate dates if both provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }
    
    const updatedFlashSale = {
      ...flashSales[flashSaleIndex],
      ...(title && { title, slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(description && { description }),
      ...(type && { type }),
      ...(rate && { rate: parseFloat(rate) }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(language && { language }),
      updated_at: new Date().toISOString()
    };
    
    // Update sale status based on dates
    const now = new Date();
    const startDate = new Date(updatedFlashSale.start_date);
    const endDate = new Date(updatedFlashSale.end_date);
    
    if (now < startDate) {
      updatedFlashSale.sale_status = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      updatedFlashSale.sale_status = 'active';
    } else {
      updatedFlashSale.sale_status = 'finished';
    }
    
    flashSales[flashSaleIndex] = updatedFlashSale;
    
    res.json(updatedFlashSale);
    
  } catch (error) {
    console.error('Update flash sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /flash-sale/:id
// @desc    Delete flash sale
// @access  Private (Store Owner)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const flashSaleIndex = flashSales.findIndex(fs => fs.id === parseInt(id));
    
    if (flashSaleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }
    
    const deletedFlashSale = flashSales.splice(flashSaleIndex, 1)[0];
    
    res.json(deletedFlashSale);
    
  } catch (error) {
    console.error('Delete flash sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /products-by-flash-sale
// @desc    Get products by flash sale
// @access  Private (Staff/Store Owner)
router.get('/products-by-flash-sale', async (req, res) => {
  try {
    const { flash_sale_id } = req.query;
    
    if (!flash_sale_id) {
      return res.status(400).json({
        success: false,
        message: 'Flash sale ID is required'
      });
    }
    
    // Mock products for flash sale
    const flashSaleProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        price: 999.99,
        sale_price: 699.99,
        flash_sale_id: parseInt(flash_sale_id),
        flash_sale: flashSales.find(fs => fs.id === parseInt(flash_sale_id))
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        price: 899.99,
        sale_price: 629.99,
        flash_sale_id: parseInt(flash_sale_id),
        flash_sale: flashSales.find(fs => fs.id === parseInt(flash_sale_id))
      }
    ];
    
    res.json({
      data: flashSaleProducts,
      meta: {
        total: flashSaleProducts.length
      }
    });
    
  } catch (error) {
    console.error('Get products by flash sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /product-flash-sale-info
// @desc    Get flash sale info by product ID
// @access  Private (Store Owner)
router.get('/product-flash-sale-info', async (req, res) => {
  try {
    const { product_id } = req.query;
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Mock flash sale info for product
    const flashSaleInfo = {
      product_id: parseInt(product_id),
      flash_sale: flashSales.find(fs => fs.sale_status === 'active'),
      discount_amount: 300.00,
      final_price: 699.99,
      time_remaining: {
        days: 5,
        hours: 12,
        minutes: 30,
        seconds: 45
      }
    };
    
    res.json(flashSaleInfo);
    
  } catch (error) {
    console.error('Get product flash sale info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
