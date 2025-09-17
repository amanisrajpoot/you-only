const express = require('express');
const router = express.Router();

// Mock database - replace with actual database queries
const orders = [
  {
    id: 1,
    order_number: 'ORD-001',
    status: 'pending',
    payment_status: 'pending',
    total: 179.98,
    subtotal: 149.99,
    tax: 15.00,
    shipping: 14.99,
    customer_id: 2,
    customer: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com'
    },
    shipping_address: {
      name: 'John Doe',
      address: '456 User Avenue, User City',
      city: 'User City',
      state: 'User State',
      zip: '12345',
      country: 'United States',
      phone: '+1234567891'
    },
    billing_address: {
      name: 'John Doe',
      address: '456 User Avenue, User City',
      city: 'User City',
      state: 'User State',
      zip: '12345',
      country: 'United States',
      phone: '+1234567891'
    },
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: 'Sample Product 1',
        quantity: 2,
        price: 79.99,
        total: 159.98
      }
    ],
    products: [
      {
        id: 1,
        product_id: 1,
        product_name: 'Sample Product 1',
        quantity: 2,
        price: 79.99,
        total: 159.98
      }
    ],
    payment_method: 'stripe',
    payment_id: 'pi_1234567890',
    notes: 'Please handle with care',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    order_number: 'ORD-002',
    status: 'completed',
    payment_status: 'paid',
    total: 149.99,
    subtotal: 149.99,
    tax: 0,
    shipping: 0,
    customer_id: 3,
    customer: {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    shipping_address: {
      name: 'Jane Smith',
      address: '789 User Road, User Town',
      city: 'User Town',
      state: 'User State',
      zip: '54321',
      country: 'United States',
      phone: '+1234567892'
    },
    billing_address: {
      name: 'Jane Smith',
      address: '789 User Road, User Town',
      city: 'User Town',
      state: 'User State',
      zip: '54321',
      country: 'United States',
      phone: '+1234567892'
    },
    items: [
      {
        id: 2,
        product_id: 2,
        product_name: 'Sample Product 2',
        quantity: 1,
        price: 149.99,
        total: 149.99
      }
    ],
    products: [
      {
        id: 2,
        product_id: 2,
        product_name: 'Sample Product 2',
        quantity: 1,
        price: 149.99,
        total: 149.99
      }
    ],
    payment_method: 'paypal',
    payment_id: 'PAYID-1234567890',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (Admin)
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      customer_id,
      limit = 10, 
      page = 1,
      orderBy = 'created_at',
      sortedBy = 'DESC'
    } = req.query;
    
    let filteredOrders = [...orders];
    
    // Status filter
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Payment status filter
    if (payment_status) {
      filteredOrders = filteredOrders.filter(order => order.payment_status === payment_status);
    }

    // Customer filter
    if (customer_id) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === parseInt(customer_id));
    }

    // Sort orders
    filteredOrders.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'DESC' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Pagination
    const total = filteredOrders.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedOrders = filteredOrders.slice(offset, offset + perPage);

    res.json({
      data: paginatedOrders,
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Admin/Customer)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = orders.find(o => o.id === parseInt(id));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      items,
      shipping_address,
      billing_address,
      payment_method,
      notes
    } = req.body;

    // Validate required fields
    if (!customer_id || !items || !shipping_address || !billing_address) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return {
        id: Date.now() + Math.random(),
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal
      };
    });

    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 14.99; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `ORD-${String(orders.length + 1).padStart(3, '0')}`;

    // Create new order
    const newOrder = {
      id: orders.length + 1,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      total,
      subtotal,
      tax,
      shipping,
      customer_id: parseInt(customer_id),
      customer: {
        id: parseInt(customer_id),
        name: shipping_address.name,
        email: 'customer@example.com' // TODO: Get from customer data
      },
      shipping_address,
      billing_address,
      items: orderItems,
      payment_method,
      payment_id: null,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json(newOrder);

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = orders.findIndex(o => o.id === parseInt(id));

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const {
      status,
      payment_status,
      payment_id,
      notes
    } = req.body;

    // Update order
    const updatedOrder = {
      ...orders[orderIndex],
      ...(status && { status }),
      ...(payment_status && { payment_status }),
      ...(payment_id && { payment_id }),
      ...(notes !== undefined && { notes }),
      updated_at: new Date().toISOString()
    };

    orders[orderIndex] = updatedOrder;

    res.json(updatedOrder);

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const orderIndex = orders.findIndex(o => o.id === parseInt(id));

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();

    res.json(orders[orderIndex]);

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
