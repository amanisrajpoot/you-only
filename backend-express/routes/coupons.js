const express = require('express');
const router = express.Router();

// Mock database - replace with actual database queries
const coupons = [
  {
    id: 1,
    code: "WELCOME10",
    description: "Welcome discount for new customers",
    type: "percentage",
    amount: 10,
    minimum_cart_amount: 50,
    maximum_discount_amount: 100,
    is_active: true,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    usage_limit: 100,
    used_count: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    code: "FLASH20",
    description: "Flash sale discount",
    type: "percentage",
    amount: 20,
    minimum_cart_amount: 100,
    maximum_discount_amount: 200,
    is_active: true,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    usage_limit: 50,
    used_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    code: "SAVE50",
    description: "Fixed amount discount",
    type: "fixed",
    amount: 50,
    minimum_cart_amount: 200,
    maximum_discount_amount: 50,
    is_active: true,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    usage_limit: 200,
    used_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /coupons
// @desc    Get all coupons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      limit = 50, 
      orderBy = 'created_at', 
      sortedBy = 'DESC',
      language = 'en',
      searchJoin = 'and',
      page = 1
    } = req.query;
    
    let filteredCoupons = [...coupons];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCoupons = filteredCoupons.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm) ||
        coupon.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter only active coupons for public access
    filteredCoupons = filteredCoupons.filter(coupon => 
      coupon.is_active && new Date(coupon.valid_until) > new Date()
    );

    // Sort coupons
    filteredCoupons.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredCoupons.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedCoupons = filteredCoupons.slice(offset, offset + perPage);

    // Format response to match Laravel's formatAPIResourcePaginate
    res.json({
      data: paginatedCoupons,
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
        path: req.originalUrl.split('?')[0],
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /coupons/:id
// @desc    Get single coupon
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = coupons.find(c => c.id === parseInt(id));

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /coupons/verify
// @desc    Verify coupon code
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = coupons.find(c => 
      c.code.toLowerCase() === code.toLowerCase() && 
      c.is_active && 
      new Date(c.valid_until) > new Date()
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    // Check if minimum cart amount is met
    if (amount && coupon.minimum_cart_amount > amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart amount of ${coupon.minimum_cart_amount} required`
      });
    }

    // Check if usage limit is reached
    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.type === 'percentage') {
      discount_amount = (amount * coupon.amount) / 100;
      if (coupon.maximum_discount_amount && discount_amount > coupon.maximum_discount_amount) {
        discount_amount = coupon.maximum_discount_amount;
      }
    } else if (coupon.type === 'fixed') {
      discount_amount = coupon.amount;
    }

    res.json({
      success: true,
      data: {
        coupon,
        discount_amount,
        final_amount: amount - discount_amount
      }
    });

  } catch (error) {
    console.error('Verify coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
