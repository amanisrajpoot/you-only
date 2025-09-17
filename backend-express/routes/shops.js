const express = require('express');
const router = express.Router();

// Mock database - replace with actual database queries
const shops = [
  {
    id: 1,
    name: 'Tech Store',
    slug: 'tech-store',
    description: 'Latest technology products and gadgets',
    owner_id: 2,
    owner: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    logo: '/uploads/shops/tech-store-logo.jpg',
    banner: '/uploads/shops/tech-store-banner.jpg',
    address: {
      street: '123 Tech Street',
      city: 'Tech City',
      state: 'Tech State',
      zip: '12345',
      country: 'United States'
    },
    contact: {
      phone: '+1234567890',
      email: 'contact@techstore.com',
      website: 'https://techstore.com'
    },
    social_links: {
      facebook: 'https://facebook.com/techstore',
      twitter: 'https://twitter.com/techstore',
      instagram: 'https://instagram.com/techstore'
    },
    is_active: true,
    is_verified: true,
    rating: 4.8,
    total_products: 25,
    total_orders: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Fashion Hub',
    slug: 'fashion-hub',
    description: 'Trendy fashion and clothing for everyone',
    owner_id: 3,
    owner: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    logo: '/uploads/shops/fashion-hub-logo.jpg',
    banner: '/uploads/shops/fashion-hub-banner.jpg',
    address: {
      street: '456 Fashion Avenue',
      city: 'Fashion City',
      state: 'Fashion State',
      zip: '54321',
      country: 'United States'
    },
    contact: {
      phone: '+1234567891',
      email: 'contact@fashionhub.com',
      website: 'https://fashionhub.com'
    },
    social_links: {
      facebook: 'https://facebook.com/fashionhub',
      instagram: 'https://instagram.com/fashionhub'
    },
    is_active: true,
    is_verified: false,
    rating: 4.2,
    total_products: 18,
    total_orders: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /api/shops
// @desc    Get all shops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      is_active, 
      is_verified,
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredShops = [...shops];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredShops = filteredShops.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm) ||
        shop.description.toLowerCase().includes(searchTerm)
      );
    }

    // Active filter
    if (is_active !== undefined) {
      filteredShops = filteredShops.filter(shop => 
        shop.is_active === (is_active === 'true')
      );
    }

    // Verified filter
    if (is_verified !== undefined) {
      filteredShops = filteredShops.filter(shop => 
        shop.is_verified === (is_verified === 'true')
      );
    }

    // Sort shops
    filteredShops.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredShops.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedShops = filteredShops.slice(offset, offset + perPage);

    res.json({
      data: paginatedShops,
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
    console.error('Get shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/shops/:id
// @desc    Get single shop
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shop = shops.find(s => s.id === parseInt(id) || s.slug === id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      data: shop
    });

  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/shops
// @desc    Create new shop
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      owner_id,
      logo,
      banner,
      address,
      contact,
      social_links
    } = req.body;

    // Validate required fields
    if (!name || !owner_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and owner_id are required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists
    if (shops.some(s => s.slug === slug)) {
      return res.status(400).json({
        success: false,
        message: 'Shop with this name already exists'
      });
    }

    // Create new shop
    const newShop = {
      id: shops.length + 1,
      name,
      slug,
      description: description || '',
      owner_id: parseInt(owner_id),
      owner: {
        id: parseInt(owner_id),
        name: 'Shop Owner', // TODO: Get from user data
        email: 'owner@example.com'
      },
      logo: logo || null,
      banner: banner || null,
      address: address || {},
      contact: contact || {},
      social_links: social_links || {},
      is_active: true,
      is_verified: false,
      rating: 0,
      total_products: 0,
      total_orders: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    shops.push(newShop);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: newShop
    });

  } catch (error) {
    console.error('Create shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/shops/:id
// @desc    Update shop
// @access  Private (Owner/Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shopIndex = shops.findIndex(s => s.id === parseInt(id));

    if (shopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const {
      name,
      description,
      logo,
      banner,
      address,
      contact,
      social_links
    } = req.body;

    // Generate slug from name if name is provided
    let slug = shops[shopIndex].slug;
    if (name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Check if slug already exists (excluding current shop)
      if (shops.some(s => s.slug === slug && s.id !== parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Shop with this name already exists'
        });
      }
    }

    // Update shop
    const updatedShop = {
      ...shops[shopIndex],
      ...(name && { name, slug }),
      ...(description !== undefined && { description }),
      ...(logo !== undefined && { logo }),
      ...(banner !== undefined && { banner }),
      ...(address && { address: { ...shops[shopIndex].address, ...address } }),
      ...(contact && { contact: { ...shops[shopIndex].contact, ...contact } }),
      ...(social_links && { social_links: { ...shops[shopIndex].social_links, ...social_links } }),
      updated_at: new Date().toISOString()
    };

    shops[shopIndex] = updatedShop;

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: updatedShop
    });

  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/shops/:id/verify
// @desc    Verify shop
// @access  Private (Admin)
router.patch('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const shopIndex = shops.findIndex(s => s.id === parseInt(id));

    if (shopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    shops[shopIndex].is_verified = true;
    shops[shopIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Shop verified successfully',
      data: shops[shopIndex]
    });

  } catch (error) {
    console.error('Verify shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/shops/:id/activate
// @desc    Activate shop
// @access  Private (Admin)
router.patch('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const shopIndex = shops.findIndex(s => s.id === parseInt(id));

    if (shopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    shops[shopIndex].is_active = true;
    shops[shopIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Shop activated successfully',
      data: shops[shopIndex]
    });

  } catch (error) {
    console.error('Activate shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/shops/:id/deactivate
// @desc    Deactivate shop
// @access  Private (Admin)
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const shopIndex = shops.findIndex(s => s.id === parseInt(id));

    if (shopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    shops[shopIndex].is_active = false;
    shops[shopIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Shop deactivated successfully',
      data: shops[shopIndex]
    });

  } catch (error) {
    console.error('Deactivate shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
