const express = require('express');
const router = express.Router();

// @route   GET /analytics
// @desc    Get analytics data
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/', async (req, res) => {
  try {
    // Mock analytics data - replace with actual database queries
    const analyticsData = {
      totalRevenue: 125000,
      todaysRevenue: 2500,
      totalOrders: 1250,
      todaysOrders: 25,
      totalVendors: 45,
      totalShops: 12,
      totalCustomers: 850,
      totalProducts: 450,
      todayTotalOrderByStatus: [
        { name: 'Pending', value: 5 },
        { name: 'Processing', value: 8 },
        { name: 'Shipped', value: 12 },
        { name: 'Delivered', value: 15 }
      ],
      topProducts: [
        {
          id: 1,
          name: 'Wireless Headphones',
          totalOrders: 125,
          totalRevenue: 12500,
          growth: 15.2
        },
        {
          id: 2,
          name: 'Smart Watch',
          totalOrders: 98,
          totalRevenue: 9800,
          growth: 12.5
        },
        {
          id: 3,
          name: 'Laptop Stand',
          totalOrders: 87,
          totalRevenue: 4350,
          growth: 8.7
        }
      ],
      recentOrders: [
        {
          id: 1,
          trackingNumber: 'TRK001',
          customerName: 'John Doe',
          total: 299.99,
          status: 'delivered',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          trackingNumber: 'TRK002',
          customerName: 'Jane Smith',
          total: 149.99,
          status: 'shipped',
          createdAt: new Date().toISOString()
        }
      ],
      lowStockProducts: [
        {
          id: 1,
          name: 'Product A',
          currentStock: 5,
          minStock: 10
        },
        {
          id: 2,
          name: 'Product B',
          currentStock: 3,
          minStock: 15
        }
      ]
    };

    res.json(analyticsData);

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /low-stock-products
// @desc    Get low stock products
// @access  Private (Staff/Store Owner/Super Admin)
router.get('/low-stock-products', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // Mock low stock products data
    const lowStockProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        sku: 'WH-001',
        currentStock: 5,
        minStock: 10,
        category: 'Electronics',
        shop: 'Tech Store'
      },
      {
        id: 2,
        name: 'Smart Watch',
        sku: 'SW-002',
        currentStock: 3,
        minStock: 15,
        category: 'Electronics',
        shop: 'Tech Store'
      },
      {
        id: 3,
        name: 'Laptop Stand',
        sku: 'LS-003',
        currentStock: 8,
        minStock: 20,
        category: 'Accessories',
        shop: 'Office Supplies'
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


module.exports = router;
