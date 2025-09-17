const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const abusiveReports = [
  {
    id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    model_type: 'product',
    model_id: 1,
    message: 'This product description contains inappropriate content.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    model_type: 'review',
    model_id: 5,
    message: 'This review contains spam and fake information.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 4,
    user: {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    model_type: 'shop',
    model_id: 2,
    message: 'This shop is selling counterfeit products.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /abusive_reports
// @desc    Get all abusive reports (Super Admin)
// @access  Private (Super Admin)
router.get('/', async (req, res) => {
  try {
    const { 
      model_type,
      user_id,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredReports = [...abusiveReports];
    
    // Model type filter
    if (model_type) {
      filteredReports = filteredReports.filter(report => report.model_type === model_type);
    }
    
    // User filter
    if (user_id) {
      filteredReports = filteredReports.filter(report => report.user_id === parseInt(user_id));
    }
    
    // Sort reports
    filteredReports.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredReports.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedReports = filteredReports.slice(offset, offset + perPage);

    res.json({
      data: paginatedReports,
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
        path: '/abusive_reports',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get abusive reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /abusive_reports/:id
// @desc    Get single abusive report
// @access  Private (Super Admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = abusiveReports.find(r => r.id === parseInt(id));
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Abusive report not found'
      });
    }
    
    res.json(report);
    
  } catch (error) {
    console.error('Get abusive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /abusive_reports
// @desc    Create new abusive report
// @access  Private (Customer)
router.post('/', [
  body('model_type').isIn(['product', 'review', 'shop', 'user', 'question']).withMessage('Invalid model type'),
  body('model_id').isInt().withMessage('Model ID is required'),
  body('message').notEmpty().withMessage('Message is required')
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

    const { model_type, model_id, message } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const newReport = {
      id: abusiveReports.length + 1,
      user_id,
      user: {
        id: user_id,
        name: 'John Doe',
        email: 'john@example.com'
      },
      model_type,
      model_id: parseInt(model_id),
      message,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    abusiveReports.push(newReport);
    
    res.status(201).json(newReport);
    
  } catch (error) {
    console.error('Create abusive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /abusive_reports/:id
// @desc    Update abusive report
// @access  Private (Super Admin)
router.put('/:id', [
  body('status').optional().isIn(['pending', 'approved', 'rejected']),
  body('admin_note').optional().isString()
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
    const { status, admin_note } = req.body;
    
    const reportIndex = abusiveReports.findIndex(r => r.id === parseInt(id));
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Abusive report not found'
      });
    }
    
    const updatedReport = {
      ...abusiveReports[reportIndex],
      ...(status && { status }),
      ...(admin_note && { admin_note }),
      updated_at: new Date().toISOString()
    };
    
    abusiveReports[reportIndex] = updatedReport;
    
    res.json(updatedReport);
    
  } catch (error) {
    console.error('Update abusive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /abusive_reports/:id
// @desc    Delete abusive report
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reportIndex = abusiveReports.findIndex(r => r.id === parseInt(id));
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Abusive report not found'
      });
    }
    
    const deletedReport = abusiveReports.splice(reportIndex, 1)[0];
    
    res.json(deletedReport);
    
  } catch (error) {
    console.error('Delete abusive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /abusive_reports/accept
// @desc    Accept abusive report
// @access  Private (Super Admin)
router.post('/accept', [
  body('id').isInt().withMessage('Report ID is required'),
  body('admin_note').optional().isString()
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

    const { id, admin_note } = req.body;
    
    const reportIndex = abusiveReports.findIndex(r => r.id === parseInt(id));
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Abusive report not found'
      });
    }
    
    abusiveReports[reportIndex].status = 'approved';
    abusiveReports[reportIndex].admin_note = admin_note || 'Report approved';
    abusiveReports[reportIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Abusive report accepted',
      data: abusiveReports[reportIndex]
    });
    
  } catch (error) {
    console.error('Accept abusive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /abusive_reports/reject
// @desc    Reject abusive report
// @access  Private (Super Admin)
router.post('/reject', [
  body('id').isInt().withMessage('Report ID is required'),
  body('admin_note').optional().isString()
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

    const { id, admin_note } = req.body;
    
    const reportIndex = abusiveReports.findIndex(r => r.id === parseInt(id));
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Abusive report not found'
      });
    }
    
    abusiveReports[reportIndex].status = 'rejected';
    abusiveReports[reportIndex].admin_note = admin_note || 'Report rejected';
    abusiveReports[reportIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Abusive report rejected',
      data: abusiveReports[reportIndex]
    });
    
  } catch (error) {
    console.error('Reject abusive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /my-reports
// @desc    Get current user's reports
// @access  Private (Customer)
router.get('/my-reports', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const { 
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let userReports = abusiveReports.filter(r => r.user_id === user_id);
    
    // Sort reports
    userReports.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = userReports.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedReports = userReports.slice(offset, offset + perPage);

    res.json({
      data: paginatedReports,
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
        path: '/my-reports',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
