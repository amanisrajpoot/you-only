const express = require('express');
const router = express.Router();

// Mock database - replace with actual database queries
const settings = [
  {
    id: 1,
    key: 'site_title',
    value: 'Chawkbazar',
    type: 'string',
    description: 'The title of the website',
    group: 'general',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    key: 'site_description',
    value: 'A complete e-commerce platform',
    type: 'string',
    description: 'The description of the website',
    group: 'general',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    key: 'site_logo',
    value: 'http://localhost:8000/uploads/logo.png',
    type: 'string',
    description: 'The logo of the website',
    group: 'general',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    key: 'currency',
    value: 'USD',
    type: 'string',
    description: 'Default currency',
    group: 'payment',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    key: 'currency_position',
    value: 'before',
    type: 'string',
    description: 'Position of currency symbol',
    group: 'payment',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    key: 'tax_rate',
    value: '10',
    type: 'number',
    description: 'Default tax rate percentage',
    group: 'payment',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    key: 'shipping_cost',
    value: '14.99',
    type: 'number',
    description: 'Default shipping cost',
    group: 'shipping',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    key: 'free_shipping_threshold',
    value: '100',
    type: 'number',
    description: 'Minimum order amount for free shipping',
    group: 'shipping',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9,
    key: 'email_notifications',
    value: 'true',
    type: 'boolean',
    description: 'Enable email notifications',
    group: 'notifications',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10,
    key: 'maintenance_mode',
    value: 'false',
    type: 'boolean',
    description: 'Enable maintenance mode',
    group: 'general',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /settings
// @desc    Get all settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    // Return settings in Laravel format - direct object, not paginated
    const settingsData = {
      options: {
        siteTitle: "Chawkbazar",
        siteSubtitle: "A complete e-commerce platform",
        currency: "USD",
        currencyOptions: {
          formation: "en-US",
          fractions: 2
        },
        defaultPaymentGateway: "stripe",
        paymentGateway: ["stripe"],
        stripe: {
          publishableKey: "pk_test_your_stripe_publishable_key",
          secretKey: "sk_test_your_stripe_secret_key"
        },
        paypal: {
          clientId: "your_paypal_client_id",
          clientSecret: "your_paypal_client_secret"
        },
        razorpay: {
          keyId: "your_razorpay_key_id",
          keySecret: "your_razorpay_key_secret"
        },
        useOtp: false,
        useGoogleMap: false,
        useEnableGateway: false,
        useCashOnDelivery: true,
        defaultAi: "openai",
        openai: {
          apiKey: "your_openai_api_key"
        },
        maintenance: {
          start: "2024-01-01 00:00:00",
          until: "2024-12-31 23:59:59"
        },
        logo: {
          id: 1,
          original: "http://localhost:8000/uploads/logo.png",
          thumbnail: "http://localhost:8000/uploads/logo.png"
        },
        taxRate: 10,
        shippingClass: 1,
        seo: {
          metaTitle: "Chawkbazar - E-commerce Platform",
          metaDescription: "A complete e-commerce platform built with modern technologies",
          ogTitle: "Chawkbazar",
          ogDescription: "A complete e-commerce platform",
          ogImage: "/uploads/og-image.jpg",
          twitterHandle: "@chawkbazar",
          twitterCardType: "summary_large_image"
        },
        google: {
          isEnable: false,
          tagManagerId: ""
        },
        facebook: {
          isEnable: false,
          appId: ""
        },
        product: {
          placeholderImage: {
            list: `/assets/placeholder/products/product-list.svg`,
            grid: `/assets/placeholder/products/product-grid.svg`,
            featured: `/assets/placeholder/products/product-featured.svg`,
            thumbnail: `/assets/placeholder/products/product-thumbnail.svg`,
            default: `/assets/placeholder/products/product-list.svg`
          }
        },
        avatar: {
          placeholder: '/avatar-placeholder.svg'
        },
        homePageBlocks: {
          flashSale: {
            slug: 'flash-sale'
          },
          featuredProducts: {
            slug: 'featured-products'
          },
          onSaleSettings: {
            slug: 'on-sale'
          }
        }
      },
      language: language,
      maintenance: {
        start: "January 1, 2024 12:00 AM",
        until: "December 31, 2024 11:59 PM"
      }
    };

    res.json(settingsData);

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/settings/public
// @desc    Get public settings
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const publicSettings = settings
      .filter(setting => setting.is_public)
      .reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

    res.json({
      success: true,
      data: publicSettings
    });

  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/settings/:key
// @desc    Get single setting
// @access  Private (Admin)
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = settings.find(s => s.key === key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: setting
    });

  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/settings
// @desc    Create new setting
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const {
      key,
      value,
      type = 'string',
      description = '',
      group = 'general',
      is_public = false
    } = req.body;

    // Validate required fields
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }

    // Check if key already exists
    if (settings.some(s => s.key === key)) {
      return res.status(400).json({
        success: false,
        message: 'Setting with this key already exists'
      });
    }

    // Validate type
    const validTypes = ['string', 'number', 'boolean', 'json'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: string, number, boolean, json'
      });
    }

    // Create new setting
    const newSetting = {
      id: settings.length + 1,
      key,
      value: String(value),
      type,
      description,
      group,
      is_public,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    settings.push(newSetting);

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: newSetting
    });

  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/settings/:key
// @desc    Update setting
// @access  Private (Admin)
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const settingIndex = settings.findIndex(s => s.key === key);

    if (settingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    const { value, description, group, is_public } = req.body;

    // Update setting
    const updatedSetting = {
      ...settings[settingIndex],
      ...(value !== undefined && { value: String(value) }),
      ...(description !== undefined && { description }),
      ...(group !== undefined && { group }),
      ...(is_public !== undefined && { is_public }),
      updated_at: new Date().toISOString()
    };

    settings[settingIndex] = updatedSetting;

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: updatedSetting
    });

  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/settings/:key
// @desc    Delete setting
// @access  Private (Admin)
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const settingIndex = settings.findIndex(s => s.key === key);

    if (settingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    const deletedSetting = settings.splice(settingIndex, 1)[0];

    res.json({
      success: true,
      message: 'Setting deleted successfully',
      data: deletedSetting
    });

  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/settings/bulk-update
// @desc    Bulk update settings
// @access  Private (Admin)
router.post('/bulk-update', async (req, res) => {
  try {
    const { settings: settingsToUpdate } = req.body;

    if (!settingsToUpdate || !Array.isArray(settingsToUpdate)) {
      return res.status(400).json({
        success: false,
        message: 'Settings array is required'
      });
    }

    const updatedSettings = [];

    for (const settingUpdate of settingsToUpdate) {
      const { key, value } = settingUpdate;
      
      if (!key || value === undefined) {
        continue; // Skip invalid updates
      }

      const settingIndex = settings.findIndex(s => s.key === key);
      
      if (settingIndex !== -1) {
        settings[settingIndex].value = String(value);
        settings[settingIndex].updated_at = new Date().toISOString();
        updatedSettings.push(settings[settingIndex]);
      }
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
