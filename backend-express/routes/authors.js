const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const authors = [
  {
    id: 1,
    name: 'John Smith',
    slug: 'john-smith',
    bio: 'Renowned author with over 20 years of experience in technology and business.',
    socials: [
      { type: 'twitter', url: 'https://twitter.com/johnsmith' },
      { type: 'linkedin', url: 'https://linkedin.com/in/johnsmith' }
    ],
    image: {
      id: 1,
      original: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    },
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    slug: 'sarah-johnson',
    bio: 'Expert in digital marketing and e-commerce strategies.',
    socials: [
      { type: 'twitter', url: 'https://twitter.com/sarahjohnson' },
      { type: 'facebook', url: 'https://facebook.com/sarahjohnson' }
    ],
    image: {
      id: 2,
      original: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop'
    },
    is_approved: true,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Michael Brown',
    slug: 'michael-brown',
    bio: 'Technology consultant and software development expert.',
    socials: [
      { type: 'github', url: 'https://github.com/michaelbrown' },
      { type: 'linkedin', url: 'https://linkedin.com/in/michaelbrown' }
    ],
    image: {
      id: 3,
      original: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    is_approved: false,
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /authors
// @desc    Get all authors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      is_approved,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredAuthors = [...authors];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredAuthors = filteredAuthors.filter(author => 
        author.name.toLowerCase().includes(searchTerm) ||
        author.bio.toLowerCase().includes(searchTerm)
      );
    }

    // Approval filter
    if (is_approved !== undefined) {
      filteredAuthors = filteredAuthors.filter(author => 
        author.is_approved === (is_approved === 'true')
      );
    }

    // Sort authors
    filteredAuthors.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredAuthors.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedAuthors = filteredAuthors.slice(offset, offset + perPage);

    res.json({
      data: paginatedAuthors,
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
        path: '/authors',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /authors/:id
// @desc    Get single author
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const author = authors.find(a => a.id === parseInt(id));
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    res.json(author);
    
  } catch (error) {
    console.error('Get author error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /authors
// @desc    Create new author
// @access  Private (Staff/Store Owner)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('bio').optional().isString(),
  body('socials').optional().isArray()
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

    const { name, bio, socials } = req.body;
    
    const newAuthor = {
      id: authors.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      bio: bio || '',
      socials: socials || [],
      image: {
        id: authors.length + 1,
        original: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'
      },
      is_approved: false,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    authors.push(newAuthor);
    
    res.status(201).json(newAuthor);
    
  } catch (error) {
    console.error('Create author error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /authors/:id
// @desc    Update author
// @access  Private (Super Admin)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('bio').optional().isString(),
  body('socials').optional().isArray()
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

    const { id } = req.params;
    const { name, bio, socials } = req.body;
    
    const authorIndex = authors.findIndex(a => a.id === parseInt(id));
    
    if (authorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const updatedAuthor = {
      ...authors[authorIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(bio && { bio }),
      ...(socials && { socials }),
      updated_at: new Date().toISOString()
    };
    
    authors[authorIndex] = updatedAuthor;
    
    res.json(updatedAuthor);
    
  } catch (error) {
    console.error('Update author error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /authors/:id
// @desc    Delete author
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const authorIndex = authors.findIndex(a => a.id === parseInt(id));
    
    if (authorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const deletedAuthor = authors.splice(authorIndex, 1)[0];
    
    res.json(deletedAuthor);
    
  } catch (error) {
    console.error('Delete author error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /top-authors
// @desc    Get top authors
// @access  Public
router.get('/top-authors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Mock top authors data (in real app, this would be based on product count, sales, etc.)
    const topAuthors = authors
      .filter(author => author.is_approved)
      .sort((a, b) => b.id - a.id) // Simple sorting for mock
      .slice(0, parseInt(limit));
    
    res.json(topAuthors);
    
  } catch (error) {
    console.error('Get top authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
