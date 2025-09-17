const express = require('express');
const router = express.Router();

// Mock database - replace with actual database queries
const attributes = [
  {
    id: 1,
    name: "Color",
    slug: "color",
    values: [
      { id: 1, value: "Red", slug: "red" },
      { id: 2, value: "Blue", slug: "blue" },
      { id: 3, value: "Green", slug: "green" },
      { id: 4, value: "Black", slug: "black" },
      { id: 5, value: "White", slug: "white" }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Size",
    slug: "size",
    values: [
      { id: 6, value: "XS", slug: "xs" },
      { id: 7, value: "S", slug: "s" },
      { id: 8, value: "M", slug: "m" },
      { id: 9, value: "L", slug: "l" },
      { id: 10, value: "XL", slug: "xl" },
      { id: 11, value: "XXL", slug: "xxl" }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Material",
    slug: "material",
    values: [
      { id: 12, value: "Cotton", slug: "cotton" },
      { id: 13, value: "Polyester", slug: "polyester" },
      { id: 14, value: "Leather", slug: "leather" },
      { id: 15, value: "Denim", slug: "denim" }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /attributes
// @desc    Get all attributes
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
    
    let filteredAttributes = [...attributes];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredAttributes = filteredAttributes.filter(attr => 
        attr.name.toLowerCase().includes(searchTerm)
      );
    }

    // Sort attributes
    filteredAttributes.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredAttributes.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedAttributes = filteredAttributes.slice(offset, offset + perPage);

    // Format response to match Laravel's formatAPIResourcePaginate
    res.json({
      data: paginatedAttributes,
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
    console.error('Get attributes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /attributes/:id
// @desc    Get single attribute
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attribute = attributes.find(a => a.id === parseInt(id));

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    res.json({
      success: true,
      data: attribute
    });

  } catch (error) {
    console.error('Get attribute error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
