const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock database - Fashion brands with proper image URLs
const types = [
  {
    id: 1,
    name: "Nike",
    slug: "nike",
    description: "Nike Inc. - Athletic footwear and apparel",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Adidas",
    slug: "adidas",
    description: "Adidas AG - Sports apparel and footwear",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Zara",
    slug: "zara",
    description: "Zara - Fast fashion clothing retailer",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Zara-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "H&M",
    slug: "hm",
    description: "H&M - Swedish multinational clothing company",
    image: "https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Gucci",
    slug: "gucci",
    description: "Gucci - Italian luxury fashion brand",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Gucci-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "Louis Vuitton",
    slug: "louis-vuitton",
    description: "Louis Vuitton - French luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Louis-Vuitton-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    name: "Prada",
    slug: "prada",
    description: "Prada - Italian luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Prada-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    name: "Chanel",
    slug: "chanel",
    description: "Chanel - French luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Chanel-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9,
    name: "Versace",
    slug: "versace",
    description: "Versace - Italian luxury fashion company",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Versace-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10,
    name: "Armani",
    slug: "armani",
    description: "Giorgio Armani - Italian luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Armani-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 11,
    name: "Calvin Klein",
    slug: "calvin-klein",
    description: "Calvin Klein - American fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Calvin-Klein-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 12,
    name: "Tommy Hilfiger",
    slug: "tommy-hilfiger",
    description: "Tommy Hilfiger - American fashion brand",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Tommy-Hilfiger-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 13,
    name: "Ralph Lauren",
    slug: "ralph-lauren",
    description: "Ralph Lauren - American fashion company",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Ralph-Lauren-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 14,
    name: "Burberry",
    slug: "burberry",
    description: "Burberry - British luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Burberry-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 15,
    name: "Hermès",
    slug: "hermes",
    description: "Hermès - French luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Hermes-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 16,
    name: "Dior",
    slug: "dior",
    description: "Christian Dior - French luxury fashion house",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Christian-Dior-Logo.png",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Validation middleware
const validateType = [
  body('name').trim().isLength({ min: 1 }).withMessage('Type name is required'),
  body('slug').optional().trim().isLength({ min: 1 }).withMessage('Slug must not be empty')
];

// @route   GET /types
// @desc    Get all product types
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      limit = 16, 
      orderBy = 'created_at', 
      sortedBy = 'DESC',
      language = 'en',
      searchJoin = 'and',
      with: withParam,
      page = 1
    } = req.query;
    
    let filteredTypes = [...types];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTypes = filteredTypes.filter(type => 
        type.name.toLowerCase().includes(searchTerm) ||
        type.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort types
    filteredTypes.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredTypes.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedTypes = filteredTypes.slice(offset, offset + perPage);

    // Format response to match Laravel's formatAPIResourcePaginate
    res.json({
      data: paginatedTypes,
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
    console.error('Get types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/types/:id
// @desc    Get single product type
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const type = types.find(t => t.id === parseInt(id));

    if (!type) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }

    res.json({
      success: true,
      data: type
    });

  } catch (error) {
    console.error('Get type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/types
// @desc    Create new product type
// @access  Private (Admin)
router.post('/', validateType, async (req, res) => {
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

    const { name, description } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists
    if (types.some(t => t.slug === slug)) {
      return res.status(400).json({
        success: false,
        message: 'Type with this slug already exists'
      });
    }

    // Create new type
    const newType = {
      id: types.length + 1,
      name,
      slug,
      description: description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    types.push(newType);

    res.status(201).json({
      success: true,
      message: 'Product type created successfully',
      data: newType
    });

  } catch (error) {
    console.error('Create type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/types/:id
// @desc    Update product type
// @access  Private (Admin)
router.put('/:id', validateType, async (req, res) => {
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

    const { id } = req.params;
    const typeIndex = types.findIndex(t => t.id === parseInt(id));

    if (typeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }

    const { name, description } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists (excluding current type)
    if (types.some(t => t.slug === slug && t.id !== parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Type with this slug already exists'
      });
    }

    // Update type
    const updatedType = {
      ...types[typeIndex],
      name,
      slug,
      description: description || '',
      updated_at: new Date().toISOString()
    };

    types[typeIndex] = updatedType;

    res.json({
      success: true,
      message: 'Product type updated successfully',
      data: updatedType
    });

  } catch (error) {
    console.error('Update type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/types/:id
// @desc    Delete product type
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const typeIndex = types.findIndex(t => t.id === parseInt(id));

    if (typeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }

    const deletedType = types.splice(typeIndex, 1)[0];

    res.json({
      success: true,
      message: 'Product type deleted successfully',
      data: deletedType
    });

  } catch (error) {
    console.error('Delete type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
