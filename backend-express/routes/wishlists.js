const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const wishlists = [
  {
    id: 1,
    user_id: 2,
    product_id: 1,
    product: {
      id: 1,
      name: 'Sample Product 1',
      slug: 'sample-product-1',
      price: 99.99,
      sale_price: 79.99,
      image: {
        id: 1,
        original: 'http://localhost:8000/uploads/products/sample-1.jpg',
        thumbnail: 'http://localhost:8000/uploads/products/sample-1.jpg'
      },
      shop: {
        id: 1,
        name: 'Tech Store',
        slug: 'tech-store'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 2,
    product_id: 2,
    product: {
      id: 2,
      name: 'Sample Product 2',
      slug: 'sample-product-2',
      price: 149.99,
      sale_price: null,
      image: {
        id: 2,
        original: 'http://localhost:8000/uploads/products/sample-2.jpg',
        thumbnail: 'http://localhost:8000/uploads/products/sample-2.jpg'
      },
      shop: {
        id: 1,
        name: 'Tech Store',
        slug: 'tech-store'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 3,
    product_id: 1,
    product: {
      id: 1,
      name: 'Sample Product 1',
      slug: 'sample-product-1',
      price: 99.99,
      sale_price: 79.99,
      image: {
        id: 1,
        original: 'http://localhost:8000/uploads/products/sample-1.jpg',
        thumbnail: 'http://localhost:8000/uploads/products/sample-1.jpg'
      },
      shop: {
        id: 1,
        name: 'Tech Store',
        slug: 'tech-store'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /wishlists
// @desc    Get user's wishlists
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
    
    let userWishlists = wishlists.filter(w => w.user_id === user_id);
    
    // Sort wishlists
    userWishlists.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userWishlists.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedWishlists = userWishlists.slice(offset, offset + perPage);

    res.json({
      data: paginatedWishlists,
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
        path: '/wishlists',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get wishlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /wishlists
// @desc    Add product to wishlist
// @access  Private (Customer)
router.post('/', [
  body('product_id').isInt().withMessage('Product ID is required')
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

    const { product_id } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Check if already in wishlist
    const existingWishlist = wishlists.find(w => w.user_id === user_id && w.product_id === parseInt(product_id));
    
    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    const newWishlist = {
      id: wishlists.length + 1,
      user_id,
      product_id: parseInt(product_id),
      product: {
        id: parseInt(product_id),
        name: `Product ${product_id}`,
        slug: `product-${product_id}`,
        price: 99.99,
        sale_price: 79.99,
        image: {
          id: parseInt(product_id),
          original: `http://localhost:8000/uploads/products/product-${product_id}.jpg`,
          thumbnail: `http://localhost:8000/uploads/products/product-${product_id}.jpg`
        },
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    wishlists.push(newWishlist);
    
    res.status(201).json(newWishlist);
    
  } catch (error) {
    console.error('Create wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /wishlists/:id
// @desc    Remove product from wishlist
// @access  Private (Customer)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const wishlistIndex = wishlists.findIndex(w => w.id === parseInt(id) && w.user_id === user_id);
    
    if (wishlistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }
    
    const deletedWishlist = wishlists.splice(wishlistIndex, 1)[0];
    
    res.json(deletedWishlist);
    
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /wishlists/toggle
// @desc    Toggle product in wishlist (add if not exists, remove if exists)
// @access  Private (Customer)
router.post('/toggle', [
  body('product_id').isInt().withMessage('Product ID is required')
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

    const { product_id } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    // Check if already in wishlist
    const existingWishlistIndex = wishlists.findIndex(w => w.user_id === user_id && w.product_id === parseInt(product_id));
    
    if (existingWishlistIndex !== -1) {
      // Remove from wishlist
      const removedWishlist = wishlists.splice(existingWishlistIndex, 1)[0];
      res.json({
        message: 'Product removed from wishlist',
        action: 'removed',
        data: removedWishlist
      });
    } else {
      // Add to wishlist
      const newWishlist = {
        id: wishlists.length + 1,
        user_id,
        product_id: parseInt(product_id),
        product: {
          id: parseInt(product_id),
          name: `Product ${product_id}`,
          slug: `product-${product_id}`,
          price: 99.99,
          sale_price: 79.99,
          image: {
            id: parseInt(product_id),
            original: `http://localhost:8000/uploads/products/product-${product_id}.jpg`,
            thumbnail: `http://localhost:8000/uploads/products/product-${product_id}.jpg`
          },
          shop: {
            id: 1,
            name: 'Tech Store',
            slug: 'tech-store'
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      wishlists.push(newWishlist);
      
      res.json({
        message: 'Product added to wishlist',
        action: 'added',
        data: newWishlist
      });
    }
    
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /wishlists/in_wishlist/:product_id
// @desc    Check if product is in user's wishlist
// @access  Private (Customer)
router.get('/in_wishlist/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const wishlistItem = wishlists.find(w => w.user_id === user_id && w.product_id === parseInt(product_id));
    
    res.json({
      in_wishlist: !!wishlistItem,
      data: wishlistItem || null
    });
    
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
