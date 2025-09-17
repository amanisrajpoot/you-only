const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - Fashion products with proper image URLs
const products = [
  {
    id: 1,
    name: "Classic Denim Jeans",
    slug: "classic-denim-jeans",
    description: "Premium quality denim jeans with a perfect fit and comfortable stretch. Made from 98% cotton and 2% elastane for ultimate comfort and style.",
    short_description: "Premium denim jeans with perfect fit",
    price: 89.99,
    sale_price: 69.99,
    sku: "CDJ001",
    quantity: 50,
    status: "publish",
    visibility: "visibility_public",
    featured: true,
    is_taxable: true,
    in_stock: true,
    height: "2.0",
    length: "42.0",
    width: "16.0",
    unit: "pieces",
    sold: 1250,
    ratings: 4.5,
    orders_count: 89,
    min_price: 69.99,
    max_price: 89.99,
    type: { 
      id: 1, 
      name: "Simple", 
      slug: "simple",
      created_at: new Date().toISOString()
    },
    product_type: "simple",
    author: { 
      id: 1, 
      name: "Fashion Designer", 
      email: "designer@example.com",
      created_at: new Date().toISOString()
    },
    shop: {
      id: 1,
      name: "Fashion Store",
      slug: "fashion-store",
      is_active: true
    },
    categories: [
      { id: 1, name: "Clothing", slug: "clothing" },
      { id: 2, name: "Jeans", slug: "jeans" }
    ],
    tags: [
      { id: 1, name: "popular", slug: "popular" },
      { id: 2, name: "trending", slug: "trending" },
      { id: 3, name: "denim", slug: "denim" },
      { id: 16, name: "featured-products", slug: "featured-products" },
      { id: 17, name: "flash-sale", slug: "flash-sale" },
      { id: 18, name: "on-sale", slug: "on-sale" }
    ],
    gallery: [
      { id: 1, original: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center" },
      { id: 2, original: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center" },
      { id: 3, original: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&crop=center" }
    ],
    image: {
      id: 1,
      original: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center"
    },
    variations: [],
    variation_options: [],
    attributes: [
      { id: 1, name: "Size", values: ["28", "30", "32", "34", "36", "38"] },
      { id: 2, name: "Color", values: ["Blue", "Black", "Light Blue"] }
    ],
    related_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Elegant Summer Dress",
    slug: "elegant-summer-dress",
    description: "Beautiful flowy summer dress perfect for any occasion. Made from lightweight chiffon fabric with elegant floral patterns and comfortable fit.",
    short_description: "Flowy summer dress with floral patterns",
    price: 129.99,
    sale_price: 99.99,
    sku: "ESD002",
    quantity: 35,
    status: "publish",
    visibility: "visibility_public",
    featured: true,
    is_taxable: true,
    in_stock: true,
    height: "1.5",
    length: "38.0",
    width: "14.0",
    unit: "pieces",
    sold: 890,
    ratings: 4.7,
    orders_count: 67,
    min_price: 99.99,
    max_price: 129.99,
    type: { 
      id: 1, 
      name: "Simple", 
      slug: "simple",
      created_at: new Date().toISOString()
    },
    product_type: "simple",
    author: { 
      id: 2, 
      name: "Style Expert", 
      email: "style@example.com",
      created_at: new Date().toISOString()
    },
    shop: {
      id: 2,
      name: "Elegant Fashion",
      slug: "elegant-fashion",
      is_active: true
    },
    categories: [
      { id: 3, name: "Dresses", slug: "dresses" },
      { id: 4, name: "Women", slug: "women" }
    ],
    tags: [
      { id: 4, name: "dress", slug: "dress" },
      { id: 5, name: "summer", slug: "summer" },
      { id: 6, name: "elegant", slug: "elegant" },
      { id: 16, name: "featured-products", slug: "featured-products" },
      { id: 17, name: "flash-sale", slug: "flash-sale" },
      { id: 18, name: "on-sale", slug: "on-sale" }
    ],
    gallery: [
      { id: 4, original: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center" },
      { id: 5, original: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center" }
    ],
    image: {
      id: 2,
      original: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center"
    },
    variations: [],
    variation_options: [],
    attributes: [
      { id: 1, name: "Size", values: ["XS", "S", "M", "L", "XL"] },
      { id: 2, name: "Color", values: ["Floral", "Solid Blue", "Solid Pink"] }
    ],
    related_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Premium Leather Jacket",
    slug: "premium-leather-jacket",
    description: "High-quality genuine leather jacket with classic biker style. Features premium cowhide leather, metal zippers, and comfortable lining.",
    short_description: "Genuine leather biker jacket",
    price: 299.99,
    sale_price: 249.99,
    sku: "PLJ003",
    quantity: 25,
    status: "publish",
    visibility: "visibility_public",
    featured: true,
    is_taxable: true,
    in_stock: true,
    height: "3.0",
    length: "28.0",
    width: "18.0",
    unit: "pieces",
    sold: 450,
    ratings: 4.8,
    orders_count: 34,
    min_price: 249.99,
    max_price: 299.99,
    type: { 
      id: 1, 
      name: "Simple", 
      slug: "simple",
      created_at: new Date().toISOString()
    },
    product_type: "simple",
    author: { 
      id: 3, 
      name: "Leather Master", 
      email: "leather@example.com",
      created_at: new Date().toISOString()
    },
    shop: {
      id: 3,
      name: "Leather Craft",
      slug: "leather-craft",
      is_active: true
    },
    categories: [
      { id: 5, name: "Jackets", slug: "jackets" },
      { id: 6, name: "Men", slug: "men" }
    ],
    tags: [
      { id: 7, name: "leather", slug: "leather" },
      { id: 8, name: "jacket", slug: "jacket" },
      { id: 9, name: "premium", slug: "premium" },
      { id: 16, name: "featured-products", slug: "featured-products" },
      { id: 17, name: "flash-sale", slug: "flash-sale" },
      { id: 18, name: "on-sale", slug: "on-sale" }
    ],
    gallery: [
      { id: 6, original: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&crop=center" },
      { id: 7, original: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop&crop=center" }
    ],
    image: {
      id: 3,
      original: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&crop=center"
    },
    variations: [],
    variation_options: [],
    attributes: [
      { id: 1, name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
      { id: 2, name: "Color", values: ["Black", "Brown", "Dark Brown"] }
    ],
    related_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Casual Cotton T-Shirt",
    slug: "casual-cotton-t-shirt",
    description: "Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with pre-shrunk fabric for lasting fit.",
    short_description: "Comfortable organic cotton t-shirt",
    price: 29.99,
    sale_price: 24.99,
    sku: "CCT004",
    quantity: 200,
    status: "publish",
    visibility: "visibility_public",
    featured: true,
    is_taxable: true,
    in_stock: true,
    height: "0.5",
    length: "28.0",
    width: "20.0",
    unit: "pieces",
    sold: 2100,
    ratings: 4.6,
    orders_count: 156,
    min_price: 24.99,
    max_price: 29.99,
    type: { 
      id: 2, 
      name: "Variable", 
      slug: "variable",
      created_at: new Date().toISOString()
    },
    product_type: "variable",
    author: { 
      id: 4, 
      name: "Cotton Expert", 
      email: "cotton@example.com",
      created_at: new Date().toISOString()
    },
    shop: {
      id: 4,
      name: "Organic Wear",
      slug: "organic-wear",
      is_active: true
    },
    categories: [
      { id: 7, name: "T-Shirts", slug: "t-shirts" },
      { id: 8, name: "Casual", slug: "casual" }
    ],
    tags: [
      { id: 10, name: "cotton", slug: "cotton" },
      { id: 11, name: "organic", slug: "organic" },
      { id: 12, name: "casual", slug: "casual" },
      { id: 16, name: "featured-products", slug: "featured-products" },
      { id: 17, name: "flash-sale", slug: "flash-sale" },
      { id: 18, name: "on-sale", slug: "on-sale" }
    ],
    gallery: [
      { id: 8, original: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center" },
      { id: 9, original: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop&crop=center" }
    ],
    image: {
      id: 4,
      original: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center"
    },
    variations: [
      {
        id: 1,
        name: "Color",
        options: [
          { id: 1, name: "White", value: "white" },
          { id: 2, name: "Black", value: "black" },
          { id: 3, name: "Navy", value: "navy" }
        ]
      },
      {
        id: 2,
        name: "Size",
        options: [
          { id: 4, name: "Small", value: "s" },
          { id: 5, name: "Medium", value: "m" },
          { id: 6, name: "Large", value: "l" },
          { id: 7, name: "XL", value: "xl" }
        ]
      }
    ],
    variation_options: [
      { id: 1, name: "White - Small", value: "white-s", price: 24.99 },
      { id: 2, name: "White - Medium", value: "white-m", price: 24.99 },
      { id: 3, name: "Black - Large", value: "black-l", price: 24.99 }
    ],
    attributes: [
      { id: 1, name: "Material", values: ["100% Organic Cotton"] },
      { id: 2, name: "Care", values: ["Machine Wash Cold", "Tumble Dry Low"] }
    ],
    related_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Designer Handbag",
    slug: "designer-handbag",
    description: "Elegant designer handbag crafted from premium materials. Features multiple compartments, gold hardware, and adjustable shoulder strap.",
    short_description: "Premium designer handbag with gold hardware",
    price: 199.99,
    sale_price: 159.99,
    sku: "DHB005",
    quantity: 40,
    status: "publish",
    visibility: "visibility_public",
    featured: true,
    is_taxable: true,
    in_stock: true,
    height: "25.0",
    length: "35.0",
    width: "15.0",
    unit: "pieces",
    sold: 680,
    ratings: 4.9,
    orders_count: 45,
    min_price: 159.99,
    max_price: 199.99,
    type: { 
      id: 1, 
      name: "Simple", 
      slug: "simple",
      created_at: new Date().toISOString()
    },
    product_type: "simple",
    author: { 
      id: 5, 
      name: "Bag Designer", 
      email: "bags@example.com",
      created_at: new Date().toISOString()
    },
    shop: {
      id: 5,
      name: "Luxury Bags",
      slug: "luxury-bags",
      is_active: true
    },
    categories: [
      { id: 9, name: "Bags", slug: "bags" },
      { id: 10, name: "Accessories", slug: "accessories" }
    ],
    tags: [
      { id: 13, name: "handbag", slug: "handbag" },
      { id: 14, name: "designer", slug: "designer" },
      { id: 15, name: "luxury", slug: "luxury" },
      { id: 16, name: "featured-products", slug: "featured-products" },
      { id: 17, name: "flash-sale", slug: "flash-sale" },
      { id: 18, name: "on-sale", slug: "on-sale" }
    ],
    gallery: [
      { id: 10, original: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center" },
      { id: 11, original: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center" }
    ],
    image: {
      id: 5,
      original: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center"
    },
    variations: [],
    variation_options: [],
    attributes: [
      { id: 1, name: "Color", values: ["Black", "Brown", "Tan"] },
      { id: 2, name: "Material", values: ["Genuine Leather", "Premium PU"] }
    ],
    related_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "Running Sneakers",
    slug: "running-sneakers",
    description: "High-performance running sneakers with advanced cushioning technology. Perfect for athletes and fitness enthusiasts with superior comfort and support.",
    short_description: "High-performance running sneakers",
    price: 149.99,
    sale_price: 119.99,
    sku: "RSN006",
    quantity: 75,
    status: "publish",
    visibility: "visibility_public",
    featured: true,
    is_taxable: true,
    in_stock: true,
    height: "12.0",
    length: "32.0",
    width: "12.0",
    unit: "pairs",
    sold: 1200,
    ratings: 4.7,
    orders_count: 98,
    min_price: 119.99,
    max_price: 149.99,
    type: { 
      id: 1, 
      name: "Simple", 
      slug: "simple",
      created_at: new Date().toISOString()
    },
    product_type: "simple",
    author: { 
      id: 6, 
      name: "Shoe Expert", 
      email: "shoes@example.com",
      created_at: new Date().toISOString()
    },
    shop: {
      id: 6,
      name: "Sporty Footwear",
      slug: "sporty-footwear",
      is_active: true
    },
    categories: [
      { id: 11, name: "Shoes", slug: "shoes" },
      { id: 12, name: "Sports", slug: "sports" }
    ],
    tags: [
      { id: 16, name: "sneakers", slug: "sneakers" },
      { id: 17, name: "running", slug: "running" },
      { id: 18, name: "sports", slug: "sports" },
      { id: 16, name: "featured-products", slug: "featured-products" },
      { id: 17, name: "flash-sale", slug: "flash-sale" },
      { id: 18, name: "on-sale", slug: "on-sale" }
    ],
    gallery: [
      { id: 12, original: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center" },
      { id: 13, original: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&crop=center", thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center" }
    ],
    image: {
      id: 6,
      original: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center"
    },
    variations: [],
    variation_options: [],
    attributes: [
      { id: 1, name: "Size", values: ["7", "8", "9", "10", "11", "12"] },
      { id: 2, name: "Color", values: ["White", "Black", "Blue", "Red"] }
    ],
    related_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sku').optional().trim().isLength({ min: 1 }).withMessage('SKU must not be empty')
];

// @route   GET /products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      limit = 15, 
      orderBy = 'created_at', 
      sortedBy = 'DESC',
      language = 'en',
      searchJoin = 'and',
      with: withParam,
      page = 1,
      tags,
      category,
      min_price,
      max_price,
      shop_id,
      status,
      is_active,
      featured,
      type,
      author_id
    } = req.query;
    
    let filteredProducts = [...products];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      );
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',');
      filteredProducts = filteredProducts.filter(product => 
        product.tags.some(tag => tagList.includes(tag.slug))
      );
    }

    // Category filter
    if (category) {
      const categoryList = category.split(',');
      filteredProducts = filteredProducts.filter(product => 
        product.categories.some(cat => categoryList.includes(cat.slug))
      );
    }

    // Price range filter
    if (min_price) {
      filteredProducts = filteredProducts.filter(product => 
        product.min_price >= parseFloat(min_price)
      );
    }
    if (max_price) {
      filteredProducts = filteredProducts.filter(product => 
        product.max_price <= parseFloat(max_price)
      );
    }

    // Shop filter
    if (shop_id) {
      filteredProducts = filteredProducts.filter(product => 
        product.shop.id === parseInt(shop_id)
      );
    }

    // Status filter
    if (status) {
      filteredProducts = filteredProducts.filter(product => 
        product.status === status
      );
    }

    // Featured filter
    if (featured !== undefined) {
      const isFeatured = featured === 'true' || featured === '1';
      filteredProducts = filteredProducts.filter(product => 
        product.featured === isFeatured
      );
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortedBy === 'DESC' ? bValue - aValue : aValue - bValue;
      }
      return 0;
    });

    // Pagination
    const total = filteredProducts.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedProducts = filteredProducts.slice(offset, offset + perPage);

    // Format response to match Laravel's formatAPIResourcePaginate
    res.json({
      data: paginatedProducts,
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
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /products/:slug
// @desc    Get single product
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = products.find(p => p.slug === slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json(product);

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', validateProduct, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, sku, quantity, categories, tags } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists
    if (products.some(p => p.slug === slug)) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists'
      });
    }

    // Create new product
    const newProduct = {
      id: products.length + 1,
      name,
      slug,
      description: description || '',
      price: parseFloat(price),
      sku: sku || '',
      quantity: parseInt(quantity) || 0,
      status: 'publish',
      visibility: 'visibility_public',
      featured: false,
      is_taxable: true,
      in_stock: true,
      categories: categories || [],
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /products/:slug
// @desc    Update product
// @access  Private (Admin)
router.put('/:slug', validateProduct, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { slug } = req.params;
    const productIndex = products.findIndex(p => p.slug === slug);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { name, description, price, sku, quantity } = req.body;

    // Generate new slug from name if name changed
    let newSlug = products[productIndex].slug;
    if (name && name !== products[productIndex].name) {
      newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Check if new slug already exists (excluding current product)
      if (products.some(p => p.slug === newSlug && p.id !== products[productIndex].id)) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists'
        });
      }
    }

    // Update product
    const updatedProduct = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      slug: newSlug,
      description: description || products[productIndex].description,
      price: price ? parseFloat(price) : products[productIndex].price,
      sku: sku || products[productIndex].sku,
      quantity: quantity ? parseInt(quantity) : products[productIndex].quantity,
      updated_at: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === parseInt(id));

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;