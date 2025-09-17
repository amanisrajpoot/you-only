const express = require('express');
const router = express.Router();

// Mock database - replace with actual database queries
const tags = [
  {
    id: 1,
    name: "popular",
    slug: "popular",
    description: "Popular products",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "trending",
    slug: "trending",
    description: "Trending products",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "new",
    slug: "new",
    description: "New products",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "flash-sale",
    slug: "flash-sale",
    description: "Flash sale products",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "featured-products",
    slug: "featured-products",
    description: "Featured products",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "on-sale",
    slug: "on-sale",
    description: "Products on sale",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /tags
// @desc    Get all tags
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
    
    let filteredTags = [...tags];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTags = filteredTags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm) ||
        tag.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort tags
    filteredTags.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredTags.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedTags = filteredTags.slice(offset, offset + perPage);

    // Format response to match Laravel's formatAPIResourcePaginate
    res.json({
      data: paginatedTags,
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
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /tags/:id
// @desc    Get single tag
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tag = tags.find(t => t.id === parseInt(id));

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });

  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
