const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const reviews = [
  {
    id: 1,
    product_id: 1,
    order_id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    rating: 5,
    comment: 'Excellent product! Very satisfied with the quality and delivery.',
    photos: [
      {
        id: 1,
        original: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
      }
    ],
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    product_id: 2,
    order_id: 2,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    rating: 4,
    comment: 'Good product overall, but could be better.',
    photos: [],
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    product_id: 1,
    order_id: 3,
    user_id: 4,
    user: {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    rating: 3,
    comment: 'Average product, nothing special.',
    photos: [],
    is_approved: false,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /reviews
// @desc    Get all reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      product_id,
      user_id,
      rating,
      is_approved,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredReviews = [...reviews];
    
    // Product filter
    if (product_id) {
      filteredReviews = filteredReviews.filter(review => review.product_id === parseInt(product_id));
    }

    // User filter
    if (user_id) {
      filteredReviews = filteredReviews.filter(review => review.user_id === parseInt(user_id));
    }

    // Rating filter
    if (rating) {
      filteredReviews = filteredReviews.filter(review => review.rating === parseInt(rating));
    }

    // Approval filter
    if (is_approved !== undefined) {
      filteredReviews = filteredReviews.filter(review => 
        review.is_approved === (is_approved === 'true')
      );
    }

    // Sort reviews
    filteredReviews.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (orderBy === 'rating') {
        return sortedBy === 'DESC' ? bValue - aValue : aValue - bValue;
      }
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredReviews.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedReviews = filteredReviews.slice(offset, offset + perPage);

    res.json({
      data: paginatedReviews,
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
        path: '/reviews',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /reviews/:id
// @desc    Get single review
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = reviews.find(r => r.id === parseInt(id));
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json(review);
    
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /reviews
// @desc    Create new review
// @access  Private (Customer)
router.post('/', [
  body('product_id').isInt().withMessage('Product ID is required'),
  body('order_id').isInt().withMessage('Order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString(),
  body('photos').optional().isArray()
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

    const { product_id, order_id, rating, comment, photos } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const newReview = {
      id: reviews.length + 1,
      product_id: parseInt(product_id),
      order_id: parseInt(order_id),
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      rating: parseInt(rating),
      comment: comment || '',
      photos: photos || [],
      is_approved: false,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    reviews.push(newReview);
    
    res.status(201).json(newReview);
    
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /reviews/:id
// @desc    Update review
// @access  Private (Customer - own review only)
router.put('/:id', [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString(),
  body('photos').optional().isArray()
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
    const { rating, comment, photos } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (reviews[reviewIndex].user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }
    
    const updatedReview = {
      ...reviews[reviewIndex],
      ...(rating && { rating: parseInt(rating) }),
      ...(comment !== undefined && { comment }),
      ...(photos && { photos }),
      updated_at: new Date().toISOString()
    };
    
    reviews[reviewIndex] = updatedReview;
    
    res.json(updatedReview);
    
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /reviews/:id
// @desc    Delete review
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    const deletedReview = reviews.splice(reviewIndex, 1)[0];
    
    res.json(deletedReview);
    
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
