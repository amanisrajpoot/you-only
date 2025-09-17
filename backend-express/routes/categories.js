const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock database - Fashion categories with proper image URLs
const categories = [
  {
    id: 1,
    name: "Clothing",
    slug: "clothing",
    description: "Fashionable clothing for all occasions",
    parent_id: null,
    image: {
      id: 1,
      original: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center"
    },
    icon: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&crop=center",
    is_active: true,
    featured: true,
    products_count: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    children: [
      {
        id: 2,
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Elegant and stylish women's fashion",
        parent_id: 1,
        image: {
          id: 2,
          original: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop&crop=center",
          thumbnail: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop&crop=center"
        },
        icon: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop&crop=center",
        is_active: true,
        featured: false,
        products_count: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
      },
      {
        id: 3,
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Modern and comfortable men's fashion",
        parent_id: 1,
        image: {
          id: 3,
          original: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=600&fit=crop&crop=center",
          thumbnail: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop&crop=center"
        },
        icon: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=100&h=100&fit=crop&crop=center",
        is_active: true,
        featured: false,
        products_count: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
      }
    ]
  },
  {
    id: 4,
    name: "Shoes",
    slug: "shoes",
    description: "Comfortable and stylish footwear",
    parent_id: null,
    image: {
      id: 4,
      original: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center"
    },
    icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center",
    is_active: true,
    featured: true,
    products_count: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    children: [
      {
        id: 5,
        name: "Sneakers",
        slug: "sneakers",
        description: "Casual and athletic sneakers",
        parent_id: 4,
        image: {
          id: 5,
          original: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&crop=center",
          thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop&crop=center"
        },
        icon: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&h=100&fit=crop&crop=center",
        is_active: true,
        featured: false,
        products_count: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
      },
      {
        id: 6,
        name: "Boots",
        slug: "boots",
        description: "Stylish and durable boots",
        parent_id: 4,
        image: {
          id: 6,
          original: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&crop=center",
          thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center"
        },
        icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center",
        is_active: true,
        featured: false,
        products_count: 6,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
      }
    ]
  },
  {
    id: 7,
    name: "Accessories",
    slug: "accessories",
    description: "Fashion accessories and jewelry",
    parent_id: null,
    image: {
      id: 7,
      original: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&crop=center"
    },
    icon: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop&crop=center",
    is_active: true,
    featured: true,
    products_count: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    children: [
      {
        id: 8,
        name: "Bags",
        slug: "bags",
        description: "Handbags, backpacks, and purses",
        parent_id: 7,
        image: {
          id: 8,
          original: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop&crop=center",
          thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop&crop=center"
        },
        icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop&crop=center",
        is_active: true,
        featured: false,
        products_count: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
      },
      {
        id: 9,
        name: "Jewelry",
        slug: "jewelry",
        description: "Necklaces, earrings, and bracelets",
        parent_id: 7,
        image: {
          id: 9,
          original: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&crop=center",
          thumbnail: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&crop=center"
        },
        icon: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&crop=center",
        is_active: true,
        featured: false,
        products_count: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
      }
    ]
  },
  {
    id: 10,
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Athletic wear and fitness clothing",
    parent_id: null,
    image: {
      id: 10,
      original: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"
    },
    icon: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center",
    is_active: true,
    featured: false,
    products_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    children: []
  }
];

// Validation middleware
const validateCategory = [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('slug').optional().trim().isLength({ min: 1 }).withMessage('Slug must not be empty')
];

// @route   GET /categories
// @desc    Get all categories
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
      with: withParam,
      page = 1,
      parent = null,
      is_active
    } = req.query;
    
    console.log('Categories request:', { search, parent, is_active, categoriesCount: categories.length });
    let filteredCategories = [...categories];
    
    // For now, let's just return all categories to test
    console.log('Before any filtering:', { filteredCount: filteredCategories.length, firstCategory: filteredCategories[0]?.name });

    // Sort categories
    filteredCategories.sort((a, b) => {
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
    const total = filteredCategories.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedCategories = filteredCategories.slice(offset, offset + perPage);

    // Format response to match Laravel's formatAPIResourcePaginate
    res.json({
      data: paginatedCategories,
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
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test endpoint to check categories array
router.get('/test', (req, res) => {
  res.json({
    categoriesCount: categories.length,
    firstCategory: categories[0]?.name || 'No categories',
    allCategories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
  });
});

// @route   GET /categories/:slug
// @desc    Get single category
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = categories.find(c => c.slug === slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json(category);

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /categories
// @desc    Create new category
// @access  Private (Admin)
router.post('/', validateCategory, async (req, res) => {
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

    const { name, description, parent_id } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists
    if (categories.some(c => c.slug === slug)) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }

    // Create new category
    const newCategory = {
      id: categories.length + 1,
      name,
      slug,
      description: description || '',
      parent_id: parent_id ? parseInt(parent_id) : null,
      image: null,
      icon: null,
      is_active: true,
      featured: false,
      products_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: []
    };

    categories.push(newCategory);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /categories/:slug
// @desc    Update category
// @access  Private (Admin)
router.put('/:slug', validateCategory, async (req, res) => {
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
    const categoryIndex = categories.findIndex(c => c.slug === slug);

    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description, parent_id } = req.body;

    // Generate new slug from name if name changed
    let newSlug = categories[categoryIndex].slug;
    if (name && name !== categories[categoryIndex].name) {
      newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Check if new slug already exists (excluding current category)
      if (categories.some(c => c.slug === newSlug && c.id !== categories[categoryIndex].id)) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }

    // Update category
    const updatedCategory = {
      ...categories[categoryIndex],
      name: name || categories[categoryIndex].name,
      slug: newSlug,
      description: description || categories[categoryIndex].description,
      parent_id: parent_id !== undefined ? (parent_id ? parseInt(parent_id) : null) : categories[categoryIndex].parent_id,
      updated_at: new Date().toISOString()
    };

    categories[categoryIndex] = updatedCategory;

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /categories/:id
// @desc    Delete category
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categoryIndex = categories.findIndex(c => c.id === parseInt(id));

    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const deletedCategory = categories.splice(categoryIndex, 1)[0];

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: deletedCategory
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;