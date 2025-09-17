const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const resources = [
  {
    id: 1,
    name: 'Sample Resource 1',
    slug: 'sample-resource-1',
    description: 'This is a sample resource description',
    url: '/uploads/resources/sample-1.pdf',
    type: 'pdf',
    size: 1024000,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Sample Resource 2',
    slug: 'sample-resource-2',
    description: 'Another sample resource description',
    url: '/uploads/resources/sample-2.docx',
    type: 'docx',
    size: 2048000,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Sample Resource 3',
    slug: 'sample-resource-3',
    description: 'Third sample resource description',
    url: '/uploads/resources/sample-3.jpg',
    type: 'image',
    size: 512000,
    active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /resources
// @desc    Get all resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      active,
      type,
      limit = 50, 
      page = 1,
      orderBy = 'name',
      sortedBy = 'ASC'
    } = req.query;
    
    let filteredResources = [...resources];
    
    // Active filter
    if (active !== undefined) {
      filteredResources = filteredResources.filter(resource => 
        resource.active === (active === 'true')
      );
    }
    
    // Type filter
    if (type) {
      filteredResources = filteredResources.filter(resource => 
        resource.type === type
      );
    }
    
    // Sort resources
    filteredResources.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredResources.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedResources = filteredResources.slice(offset, offset + perPage);

    res.json({
      data: paginatedResources,
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
        path: '/resources',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /resources/:id
// @desc    Get single resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = resources.find(r => r.id === parseInt(id));
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    res.json(resource);
    
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /resources
// @desc    Create new resource
// @access  Private (Staff/Store Owner)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('url').notEmpty().withMessage('URL is required'),
  body('type').isIn(['pdf', 'docx', 'xlsx', 'image', 'video', 'audio']).withMessage('Invalid resource type'),
  body('size').optional().isNumeric(),
  body('active').optional().isBoolean()
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

    const { name, description, url, type, size, active = true } = req.body;
    
    const newResource = {
      id: resources.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description || '',
      url,
      type,
      size: size ? parseInt(size) : 0,
      active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    resources.push(newResource);
    
    res.status(201).json(newResource);
    
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /resources/:id
// @desc    Update resource
// @access  Private (Staff/Store Owner)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('url').optional().notEmpty(),
  body('type').optional().isIn(['pdf', 'docx', 'xlsx', 'image', 'video', 'audio']),
  body('size').optional().isNumeric(),
  body('active').optional().isBoolean()
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
    const { name, description, url, type, size, active } = req.body;
    
    const resourceIndex = resources.findIndex(r => r.id === parseInt(id));
    
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    const updatedResource = {
      ...resources[resourceIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(description !== undefined && { description }),
      ...(url && { url }),
      ...(type && { type }),
      ...(size && { size: parseInt(size) }),
      ...(active !== undefined && { active }),
      updated_at: new Date().toISOString()
    };
    
    resources[resourceIndex] = updatedResource;
    
    res.json(updatedResource);
    
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /resources/:id
// @desc    Delete resource
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resourceIndex = resources.findIndex(r => r.id === parseInt(id));
    
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    const deletedResource = resources.splice(resourceIndex, 1)[0];
    
    res.json(deletedResource);
    
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
