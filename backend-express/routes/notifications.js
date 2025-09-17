const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const notifications = [
  {
    id: 1,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed and is being processed.',
    data: {
      order_id: 1,
      tracking_number: 'TRK123456789'
    },
    read_at: null,
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #12345 has been shipped and is on its way.',
    data: {
      order_id: 1,
      tracking_number: 'TRK123456789',
      tracking_url: 'https://tracking.example.com/TRK123456789'
    },
    read_at: new Date().toISOString(),
    is_read: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 3,
    user: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 20% off on all electronics this week!',
    data: {
      coupon_code: 'ELECTRONICS20',
      discount_percentage: 20
    },
    read_at: null,
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    user_id: 2,
    user: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    type: 'refund',
    title: 'Refund Approved',
    message: 'Your refund request has been approved and will be processed within 3-5 business days.',
    data: {
      refund_id: 1,
      amount: 99.99
    },
    read_at: null,
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /notify-logs
// @desc    Get user's notifications
// @access  Private (Customer)
router.get('/', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const { 
      type,
      is_read,
      limit = 50, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let userNotifications = notifications.filter(n => n.user_id === user_id);
    
    // Type filter
    if (type) {
      userNotifications = userNotifications.filter(notification => notification.type === type);
    }
    
    // Read status filter
    if (is_read !== undefined) {
      userNotifications = userNotifications.filter(notification => 
        notification.is_read === (is_read === 'true')
      );
    }
    
    // Sort notifications
    userNotifications.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(aValue);
    });

    // Pagination
    const total = userNotifications.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedNotifications = userNotifications.slice(offset, offset + perPage);

    res.json({
      data: paginatedNotifications,
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
        path: '/notify-logs',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /notify-logs/:id
// @desc    Get single notification
// @access  Private (Customer)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    const notification = notifications.find(n => n.id === parseInt(id) && n.user_id === user_id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json(notification);
    
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /notify-log-seen
// @desc    Mark notification as seen
// @access  Private (Customer)
router.post('/notify-log-seen', [
  body('notification_ids').isArray().withMessage('Notification IDs array is required')
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

    const { notification_ids } = req.body;
    
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    let markedCount = 0;
    
    notification_ids.forEach(notificationId => {
      const notificationIndex = notifications.findIndex(n => 
        n.id === parseInt(notificationId) && n.user_id === user_id
      );
      
      if (notificationIndex !== -1) {
        notifications[notificationIndex].is_read = true;
        notifications[notificationIndex].read_at = new Date().toISOString();
        notifications[notificationIndex].updated_at = new Date().toISOString();
        markedCount++;
      }
    });
    
    res.json({
      success: true,
      message: `${markedCount} notification(s) marked as seen`,
      count: markedCount
    });
    
  } catch (error) {
    console.error('Mark notifications as seen error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /notify-log-read-all
// @desc    Mark all notifications as read
// @access  Private (Customer)
router.post('/notify-log-read-all', async (req, res) => {
  try {
    // Mock user ID (in real app, get from auth token)
    const user_id = 2;
    
    let markedCount = 0;
    
    notifications.forEach(notification => {
      if (notification.user_id === user_id && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        notification.updated_at = new Date().toISOString();
        markedCount++;
      }
    });
    
    res.json({
      success: true,
      message: `${markedCount} notification(s) marked as read`,
      count: markedCount
    });
    
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /notify-logs/:id
// @desc    Delete notification (Super Admin)
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificationIndex = notifications.findIndex(n => n.id === parseInt(id));
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    
    res.json(deletedNotification);
    
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
