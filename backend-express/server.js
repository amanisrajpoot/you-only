const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const typeRoutes = require('./routes/types');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const shopRoutes = require('./routes/shops');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');
const tagsRoutes = require('./routes/tags');
const attributesRoutes = require('./routes/attributes');
const couponsRoutes = require('./routes/coupons');
const analyticsRoutes = require('./routes/analytics');
const attachmentsRoutes = require('./routes/attachments');
const dashboardRoutes = require('./routes/dashboard');
const withdrawsRoutes = require('./routes/withdraws');
const authorsRoutes = require('./routes/authors');
const manufacturersRoutes = require('./routes/manufacturers');
const reviewsRoutes = require('./routes/reviews');
const questionsRoutes = require('./routes/questions');
const wishlistsRoutes = require('./routes/wishlists');
const faqsRoutes = require('./routes/faqs');
const termsAndConditionsRoutes = require('./routes/terms-and-conditions');
const storeNoticesRoutes = require('./routes/store-notices');
const addressRoutes = require('./routes/address');
const conversationsRoutes = require('./routes/conversations');
const messagesRoutes = require('./routes/messages');
const refundsRoutes = require('./routes/refunds');
const downloadsRoutes = require('./routes/downloads');
const paymentMethodsRoutes = require('./routes/payment-methods');
const notificationsRoutes = require('./routes/notifications');
const abusiveReportsRoutes = require('./routes/abusive-reports');
const feedbacksRoutes = require('./routes/feedbacks');
const refundPoliciesRoutes = require('./routes/refund-policies');
const refundReasonsRoutes = require('./routes/refund-reasons');
const flashSaleRoutes = require('./routes/flash-sale');
const taxesRoutes = require('./routes/taxes');
const shippingRoutes = require('./routes/shipping');
const deliveryTimesRoutes = require('./routes/delivery-times');
const languagesRoutes = require('./routes/languages');
const resourcesRoutes = require('./routes/resources');
const becameSellerRoutes = require('./routes/became-seller');
const ownershipTransferRoutes = require('./routes/ownership-transfer');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 8000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Logging middleware (disabled for debugging)
// app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'Connected', // TODO: Add actual DB health check
    redis: 'Connected' // TODO: Add actual Redis health check
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Chawkbazar API Express Backend',
    version: '1.0.0',
    status: 'running',
    migration_from: 'Laravel',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      products: '/products/*',
      categories: '/categories/*',
      types: '/types/*',
      users: '/users/*',
      orders: '/orders/*',
      shops: '/shops/*',
      media: '/media/*',
      settings: '/settings/*'
    },
    documentation: 'https://github.com/chawkbazar/api-docs'
  });
});

// API Routes - Match Laravel structure exactly (no /api prefix)
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/types', typeRoutes);
app.use('/orders', orderRoutes);
app.use('/shops', shopRoutes);
app.use('/media', mediaRoutes);
app.use('/settings', settingsRoutes);
app.use('/tags', tagsRoutes);
app.use('/attributes', attributesRoutes);
app.use('/coupons', couponsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/attachments', attachmentsRoutes);
app.use('/authors', authorsRoutes);
app.use('/manufacturers', manufacturersRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/questions', questionsRoutes);
app.use('/wishlists', wishlistsRoutes);
app.use('/faqs', faqsRoutes);
app.use('/terms-and-conditions', termsAndConditionsRoutes);
app.use('/store-notices', storeNoticesRoutes);
app.use('/address', addressRoutes);
app.use('/conversations', conversationsRoutes);
app.use('/messages', messagesRoutes);
app.use('/refunds', refundsRoutes);
app.use('/downloads', downloadsRoutes);
app.use('/cards', paymentMethodsRoutes);
app.use('/notify-logs', notificationsRoutes);
app.use('/abusive_reports', abusiveReportsRoutes);
app.use('/feedbacks', feedbacksRoutes);
app.use('/refund-policies', refundPoliciesRoutes);
app.use('/refund-reasons', refundReasonsRoutes);
app.use('/flash-sale', flashSaleRoutes);
app.use('/taxes', taxesRoutes);
app.use('/shippings', shippingRoutes);
app.use('/delivery-times', deliveryTimesRoutes);
app.use('/languages', languagesRoutes);
app.use('/resources', resourcesRoutes);
app.use('/became-seller', becameSellerRoutes);
app.use('/ownership-transfer', ownershipTransferRoutes);

// Dashboard routes (mounted at root level to match Laravel structure)
app.use('/', dashboardRoutes);
app.use('/withdraws', withdrawsRoutes);

// Public endpoints that need to be at root level
app.get('/top-authors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Mock top authors data
    const topAuthors = [
      {
        id: 1,
        name: 'John Smith',
        slug: 'john-smith',
        bio: 'Renowned author with over 20 years of experience.',
        image: {
          original: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
        }
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        slug: 'sarah-johnson',
        bio: 'Expert in digital marketing and e-commerce.',
        image: {
          original: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop'
        }
      }
    ];
    
    res.json(topAuthors.slice(0, parseInt(limit)));
    
  } catch (error) {
    console.error('Get top authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/top-manufacturers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Mock top manufacturers data
    const topManufacturers = [
      {
        id: 1,
        name: 'Apple Inc.',
        slug: 'apple-inc',
        description: 'Leading technology company.',
        image: {
          original: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop'
        }
      },
      {
        id: 2,
        name: 'Samsung Electronics',
        slug: 'samsung-electronics',
        description: 'Global technology leader.',
        image: {
          original: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&h=150&fit=crop'
        }
      }
    ];
    
    res.json(topManufacturers.slice(0, parseInt(limit)));
    
  } catch (error) {
    console.error('Get top manufacturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Super Admin endpoints at root level
app.post('/approve-terms-and-conditions', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    // Mock approval logic
    res.json({
      success: true,
      message: 'Terms and conditions approved successfully'
    });
    
  } catch (error) {
    console.error('Approve terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/disapprove-terms-and-conditions', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    // Mock disapproval logic
    res.json({
      success: true,
      message: 'Terms and conditions disapproved successfully'
    });
    
  } catch (error) {
    console.error('Disapprove terms and conditions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Authentication routes (direct routes, not prefixed)
app.use('/', authRoutes);

// User management routes
app.use('/users', userRoutes);

// Admin-specific direct routes
app.get('/admin/list', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const { 
      search, 
      is_active, 
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    // Mock admin users
    const adminUsers = [
      {
        id: 1,
        name: 'Super Admin',
        email: 'admin@chawkbazar.com',
        email_verified_at: new Date().toISOString(),
        role: 'super_admin',
        is_active: true,
        permissions: ['super_admin', 'store_owner', 'staff'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Search filter
    let filteredUsers = [...adminUsers];
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Active filter
    if (is_active !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        user.is_active === (is_active === 'true')
      );
    }

    // Pagination
    const total = filteredUsers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedUsers = filteredUsers.slice(offset, offset + perPage);

    res.json({
      success: true,
      data: paginatedUsers,
      meta: {
        total,
        per_page: perPage,
        current_page: currentPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + perPage, total)
      }
    });

  } catch (error) {
    console.error('Get admin list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/customers/list', async (req, res) => {
  try {
    const { 
      search, 
      is_active, 
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    // Mock customer users
    const customerUsers = [
      {
        id: 2,
        name: 'Store Owner',
        email: 'owner@example.com',
        email_verified_at: new Date().toISOString(),
        role: 'store_owner',
        is_active: true,
        permissions: ['store_owner', 'staff'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Staff User',
        email: 'staff@example.com',
        email_verified_at: new Date().toISOString(),
        role: 'staff',
        is_active: true,
        permissions: ['staff'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Customer User',
        email: 'customer@example.com',
        email_verified_at: new Date().toISOString(),
        role: 'customer',
        is_active: true,
        permissions: ['customer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Search filter
    let filteredUsers = [...customerUsers];
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Active filter
    if (is_active !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        user.is_active === (is_active === 'true')
      );
    }

    // Pagination
    const total = filteredUsers.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedUsers = filteredUsers.slice(offset, offset + perPage);

    res.json({
      success: true,
      data: paginatedUsers,
      meta: {
        total,
        per_page: perPage,
        current_page: currentPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + perPage, total)
      }
    });

  } catch (error) {
    console.error('Get customers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Additional Laravel-style routes for compatibility
app.get('/popular-products', async (req, res) => {
  try {
    const { limit = 10, language = 'en', searchJoin = 'and', with: withParam, search } = req.query;
    
    // Mock popular products data
    const popularProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 299.99,
        sale_price: 249.99,
        min_price: 249.99,
        max_price: 299.99,
        sku: 'WH-001',
        status: 'publish',
        visibility: 'visibility_public',
        featured: true,
        product_type: 'simple',
        image: {
          id: 1,
          original: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
        },
        gallery: [
          {
            id: 1,
            original: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
          }
        ],
        type: {
          id: 1,
          name: 'Electronics',
          slug: 'electronics'
        },
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        },
        categories: [
          {
            id: 1,
            name: 'Electronics',
            slug: 'electronics'
          }
        ],
        tags: [
          {
            id: 1,
            name: 'Electronics',
            slug: 'electronics'
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Advanced smartwatch with health monitoring features',
        price: 399.99,
        sale_price: 349.99,
        min_price: 349.99,
        max_price: 399.99,
        sku: 'SW-002',
        status: 'publish',
        visibility: 'visibility_public',
        featured: true,
        product_type: 'simple',
        image: {
          id: 2,
          original: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
        },
        gallery: [
          {
            id: 2,
            original: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
          }
        ],
        type: {
          id: 1,
          name: 'Electronics',
          slug: 'electronics'
        },
        shop: {
          id: 1,
          name: 'Tech Store',
          slug: 'tech-store'
        },
        categories: [
          {
            id: 1,
            name: 'Electronics',
            slug: 'electronics'
          }
        ],
        tags: [
          {
            id: 1,
            name: 'Electronics',
            slug: 'electronics'
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Laptop Stand',
        slug: 'laptop-stand',
        description: 'Adjustable laptop stand for better ergonomics',
        price: 89.99,
        sale_price: 79.99,
        min_price: 79.99,
        max_price: 89.99,
        sku: 'LS-003',
        status: 'publish',
        visibility: 'visibility_public',
        featured: true,
        product_type: 'simple',
        image: {
          id: 3,
          original: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
        },
        gallery: [
          {
            id: 3,
            original: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
          }
        ],
        type: {
          id: 2,
          name: 'Accessories',
          slug: 'accessories'
        },
        shop: {
          id: 2,
          name: 'Office Supplies',
          slug: 'office-supplies'
        },
        categories: [
          {
            id: 2,
            name: 'Accessories',
            slug: 'accessories'
          }
        ],
        tags: [
          {
            id: 2,
            name: 'Accessories',
            slug: 'accessories'
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Premium T-Shirt',
        slug: 'premium-t-shirt',
        description: 'High-quality cotton t-shirt with premium fit',
        price: 49.99,
        sale_price: 39.99,
        min_price: 39.99,
        max_price: 49.99,
        sku: 'TS-004',
        status: 'publish',
        visibility: 'visibility_public',
        featured: true,
        product_type: 'simple',
        image: {
          id: 4,
          original: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
        },
        gallery: [
          {
            id: 4,
            original: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
          }
        ],
        type: {
          id: 3,
          name: 'Fashion',
          slug: 'fashion'
        },
        shop: {
          id: 3,
          name: 'Fashion Store',
          slug: 'fashion-store'
        },
        categories: [
          {
            id: 3,
            name: 'Fashion',
            slug: 'fashion'
          }
        ],
        tags: [
          {
            id: 3,
            name: 'Fashion',
            slug: 'fashion'
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    res.json(popularProducts.slice(0, parseInt(limit)));

  } catch (error) {
    console.error('Get popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/best-selling-products', (req, res) => {
  res.redirect('/products?orderBy=sales_count&sortedBy=DESC&limit=10');
});

// Remove duplicate - using the one below

// Additional missing endpoints
app.get('/featured-categories', async (req, res) => {
  try {
    const featuredCategories = [
      {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
        image: '/uploads/categories/electronics.jpg',
        featured: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Fashion',
        slug: 'fashion',
        image: '/uploads/categories/fashion.jpg',
        featured: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Home & Garden',
        slug: 'home-garden',
        image: '/uploads/categories/home-garden.jpg',
        featured: true,
        created_at: new Date().toISOString()
      }
    ];
    
    res.json(featuredCategories);
  } catch (error) {
    console.error('Featured categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/check-availability', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.query;
    
    // Mock availability check
    res.json({
      success: true,
      available: true,
      quantity_available: 100,
      product_id: parseInt(product_id),
      requested_quantity: parseInt(quantity)
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/best-selling-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Mock best selling products data
    const bestSellingProducts = [
      {
        id: 1,
        name: 'Best Seller Product 1',
        slug: 'best-seller-product-1',
        price: 99.99,
        sale_price: 79.99,
        image: '/uploads/products/best-seller-1.jpg',
        sales_count: 150,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Best Seller Product 2',
        slug: 'best-seller-product-2',
        price: 149.99,
        sale_price: null,
        image: '/uploads/products/best-seller-2.jpg',
        sales_count: 120,
        created_at: new Date().toISOString()
      }
    ];
    
    res.json(bestSellingProducts.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Best selling products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/near-by-shop/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 10 } = req.query;
    
    // Mock nearby shops data
    const nearbyShops = [
      {
        id: 1,
        name: 'Nearby Electronics Store',
        slug: 'nearby-electronics-store',
        address: '123 Main St, City',
        lat: parseFloat(lat) + 0.01,
        lng: parseFloat(lng) + 0.01,
        distance: 0.5,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Local Fashion Boutique',
        slug: 'local-fashion-boutique',
        address: '456 Oak Ave, City',
        lat: parseFloat(lat) - 0.01,
        lng: parseFloat(lng) + 0.02,
        distance: 1.2,
        created_at: new Date().toISOString()
      }
    ];
    
    res.json(nearbyShops);
  } catch (error) {
    console.error('Nearby shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 404 handler for API routes
app.use('/api/*', notFound);

// 404 handler for all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Chawkbazar API Express Backend');
  console.log('=====================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Products: http://localhost:${PORT}/products`);
  console.log(`📋 Types: http://localhost:${PORT}/types`);
  console.log(`📂 Categories: http://localhost:${PORT}/categories`);
  console.log(`👤 Auth: http://localhost:${PORT}/auth`);
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`);
  console.log('=====================================');
  console.log('✅ Ready to accept requests!');
});

module.exports = { app, server };
