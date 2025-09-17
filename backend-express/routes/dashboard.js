const express = require('express');
const router = express.Router();

// @route   GET /low-stock-products
// @desc    Get low stock products
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/low-stock-products', async (req, res) => {
  try {
    const { limit = 10, page = 1, searchJoin = 'and', with: withParam, language = 'en', search } = req.query;
    
    // Mock low stock products data
    const lowStockProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        sku: 'WH-001',
        currentStock: 5,
        minStock: 10,
        category: 'Electronics',
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        },
        type: {
          id: 1,
          name: 'Electronics',
          slug: 'electronics'
        }
      },
      {
        id: 2,
        name: 'Smart Watch',
        sku: 'SW-002',
        currentStock: 3,
        minStock: 15,
        category: 'Electronics',
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        },
        type: {
          id: 1,
          name: 'Electronics',
          slug: 'electronics'
        }
      },
      {
        id: 3,
        name: 'Laptop Stand',
        sku: 'LS-003',
        currentStock: 8,
        minStock: 20,
        category: 'Accessories',
        shop: {
          id: 2,
          name: 'Office Supplies',
          slug: 'office-supplies'
        },
        type: {
          id: 2,
          name: 'Accessories',
          slug: 'accessories'
        }
      }
    ];

    // Pagination
    const total = lowStockProducts.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedProducts = lowStockProducts.slice(offset, offset + perPage);

    res.json(paginatedProducts);

  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /category-wise-product
// @desc    Get products grouped by category
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/category-wise-product', async (req, res) => {
  try {
    const { limit = 10, language = 'en' } = req.query;
    
    // Mock category-wise product data
    const categoryWiseProducts = [
      {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
        products_count: 45,
        total_revenue: 125000,
        growth: 12.5,
        products: [
          { id: 1, name: 'Wireless Headphones', revenue: 25000, orders: 125 },
          { id: 2, name: 'Smart Watch', revenue: 20000, orders: 100 },
          { id: 3, name: 'Laptop', revenue: 80000, orders: 40 }
        ]
      },
      {
        id: 2,
        name: 'Fashion',
        slug: 'fashion',
        products_count: 32,
        total_revenue: 85000,
        growth: 8.3,
        products: [
          { id: 4, name: 'T-Shirt', revenue: 15000, orders: 150 },
          { id: 5, name: 'Jeans', revenue: 25000, orders: 125 },
          { id: 6, name: 'Shoes', revenue: 45000, orders: 90 }
        ]
      },
      {
        id: 3,
        name: 'Home & Garden',
        slug: 'home-garden',
        products_count: 28,
        total_revenue: 65000,
        growth: 15.2,
        products: [
          { id: 7, name: 'Plant Pot', revenue: 10000, orders: 200 },
          { id: 8, name: 'Garden Tools', revenue: 20000, orders: 100 },
          { id: 9, name: 'Furniture', revenue: 35000, orders: 35 }
        ]
      }
    ];

    res.json(categoryWiseProducts.slice(0, parseInt(limit)));

  } catch (error) {
    console.error('Get category-wise products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /category-wise-product-sale
// @desc    Get most sold products by category
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/category-wise-product-sale', async (req, res) => {
  try {
    const { limit = 10, language = 'en' } = req.query;
    
    // Mock most sold products by category data
    const mostSoldByCategory = [
      {
        id: 1,
        category: {
          id: 1,
          name: 'Electronics',
          slug: 'electronics'
        },
        product: {
          id: 1,
          name: 'Wireless Headphones',
          sku: 'WH-001',
          total_sales: 125,
          total_revenue: 25000
        }
      },
      {
        id: 2,
        category: {
          id: 1,
          name: 'Electronics',
          slug: 'electronics'
        },
        product: {
          id: 2,
          name: 'Smart Watch',
          sku: 'SW-002',
          total_sales: 100,
          total_revenue: 20000
        }
      },
      {
        id: 3,
        category: {
          id: 2,
          name: 'Fashion',
          slug: 'fashion'
        },
        product: {
          id: 4,
          name: 'T-Shirt',
          sku: 'TS-004',
          total_sales: 150,
          total_revenue: 15000
        }
      },
      {
        id: 4,
        category: {
          id: 2,
          name: 'Fashion',
          slug: 'fashion'
        },
        product: {
          id: 5,
          name: 'Jeans',
          sku: 'JN-005',
          total_sales: 125,
          total_revenue: 25000
        }
      }
    ];

    res.json(mostSoldByCategory.slice(0, parseInt(limit)));

  } catch (error) {
    console.error('Get category-wise product sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /top-rate-product
// @desc    Get top rated products
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/top-rate-product', async (req, res) => {
  try {
    const { limit = 10, language = 'en', searchJoin = 'and', search } = req.query;
    
    // Mock top rated products data
    const topRatedProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        average_rating: 4.8,
        total_reviews: 125,
        total_sales: 250,
        revenue: 50000,
        image: 'http://localhost:8000/uploads/headphones.jpg',
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        }
      },
      {
        id: 2,
        name: 'Smart Watch',
        slug: 'smart-watch',
        average_rating: 4.7,
        total_reviews: 98,
        total_sales: 200,
        revenue: 40000,
        image: 'http://localhost:8000/uploads/smartwatch.jpg',
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        }
      },
      {
        id: 3,
        name: 'Laptop Stand',
        slug: 'laptop-stand',
        average_rating: 4.6,
        total_reviews: 87,
        total_sales: 150,
        revenue: 15000,
        image: 'http://localhost:8000/uploads/laptopstand.jpg',
        shop: {
          id: 2,
          name: 'Office Supplies',
          slug: 'office-supplies'
        }
      },
      {
        id: 4,
        name: 'T-Shirt Premium',
        slug: 't-shirt-premium',
        average_rating: 4.5,
        total_reviews: 156,
        total_sales: 300,
        revenue: 18000,
        image: 'http://localhost:8000/uploads/tshirt.jpg',
        shop: {
          id: 3,
          name: 'Fashion Store',
          slug: 'fashion-store'
        }
      }
    ];

    res.json(topRatedProducts.slice(0, parseInt(limit)));

  } catch (error) {
    console.error('Get top rated products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
