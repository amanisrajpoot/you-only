const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');

// Mock database - replace with actual database queries
const languages = [
  {
    id: 1,
    name: 'English',
    slug: 'english',
    code: 'en',
    native_name: 'English',
    description: 'Default language for the platform',
    is_default: true,
    is_rtl: false,
    flag: '🇺🇸',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Spanish',
    slug: 'spanish',
    code: 'es',
    native_name: 'Español',
    description: 'Spanish language support',
    is_default: false,
    is_rtl: false,
    flag: '🇪🇸',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'French',
    slug: 'french',
    code: 'fr',
    native_name: 'Français',
    description: 'French language support',
    is_default: false,
    is_rtl: false,
    flag: '🇫🇷',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Arabic',
    slug: 'arabic',
    code: 'ar',
    native_name: 'العربية',
    description: 'Arabic language support',
    is_default: false,
    is_rtl: true,
    flag: '🇸🇦',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'German',
    slug: 'german',
    code: 'de',
    native_name: 'Deutsch',
    description: 'German language support',
    is_default: false,
    is_rtl: false,
    flag: '🇩🇪',
    active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// @route   GET /languages
// @desc    Get all languages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      active,
      is_default,
      is_rtl,
      limit = 50, 
      page = 1,
      orderBy = 'name',
      sortedBy = 'ASC'
    } = req.query;
    
    let filteredLanguages = [...languages];
    
    // Active filter
    if (active !== undefined) {
      filteredLanguages = filteredLanguages.filter(lang => 
        lang.active === (active === 'true')
      );
    }
    
    // Default filter
    if (is_default !== undefined) {
      filteredLanguages = filteredLanguages.filter(lang => 
        lang.is_default === (is_default === 'true')
      );
    }
    
    // RTL filter
    if (is_rtl !== undefined) {
      filteredLanguages = filteredLanguages.filter(lang => 
        lang.is_rtl === (is_rtl === 'true')
      );
    }
    
    // Sort languages
    filteredLanguages.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      return sortedBy === 'ASC' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Pagination
    const total = filteredLanguages.length;
    const perPage = parseInt(limit);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedLanguages = filteredLanguages.slice(offset, offset + perPage);

    res.json({
      data: paginatedLanguages,
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
        path: '/languages',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total
      }
    });

  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /languages/:id
// @desc    Get single language
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = languages.find(l => l.id === parseInt(id));
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    
    res.json(language);
    
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /languages
// @desc    Create new language
// @access  Private (Super Admin)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').isLength({ min: 2, max: 5 }).withMessage('Language code is required'),
  body('native_name').notEmpty().withMessage('Native name is required'),
  body('description').optional().isString(),
  body('is_rtl').optional().isBoolean(),
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

    const { name, code, native_name, description, is_rtl = false, active = true, flag } = req.body;
    
    // Check if language code already exists
    const existingLanguage = languages.find(l => l.code === code.toLowerCase());
    if (existingLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Language code already exists'
      });
    }
    
    const newLanguage = {
      id: languages.length + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      code: code.toLowerCase(),
      native_name,
      description: description || '',
      is_default: false, // Only one language can be default
      is_rtl,
      flag: flag || '🌐',
      active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    languages.push(newLanguage);
    
    res.status(201).json(newLanguage);
    
  } catch (error) {
    console.error('Create language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /languages/:id
// @desc    Update language
// @access  Private (Super Admin)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('code').optional().isLength({ min: 2, max: 5 }),
  body('native_name').optional().notEmpty(),
  body('description').optional().isString(),
  body('is_rtl').optional().isBoolean(),
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
    const { name, code, native_name, description, is_rtl, active, flag } = req.body;
    
    const languageIndex = languages.findIndex(l => l.id === parseInt(id));
    
    if (languageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    
    // Check if language code already exists (excluding current language)
    if (code) {
      const existingLanguage = languages.find(l => l.code === code.toLowerCase() && l.id !== parseInt(id));
      if (existingLanguage) {
        return res.status(400).json({
          success: false,
          message: 'Language code already exists'
        });
      }
    }
    
    const updatedLanguage = {
      ...languages[languageIndex],
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(code && { code: code.toLowerCase() }),
      ...(native_name && { native_name }),
      ...(description !== undefined && { description }),
      ...(is_rtl !== undefined && { is_rtl }),
      ...(active !== undefined && { active }),
      ...(flag && { flag }),
      updated_at: new Date().toISOString()
    };
    
    languages[languageIndex] = updatedLanguage;
    
    res.json(updatedLanguage);
    
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /languages/:id
// @desc    Delete language
// @access  Private (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const languageIndex = languages.findIndex(l => l.id === parseInt(id));
    
    if (languageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    
    // Prevent deletion of default language
    if (languages[languageIndex].is_default) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default language'
      });
    }
    
    const deletedLanguage = languages.splice(languageIndex, 1)[0];
    
    res.json(deletedLanguage);
    
  } catch (error) {
    console.error('Delete language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /languages/:id/set-default
// @desc    Set language as default
// @access  Private (Super Admin)
router.post('/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;
    
    const languageIndex = languages.findIndex(l => l.id === parseInt(id));
    
    if (languageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    
    // Remove default from all languages
    languages.forEach(lang => {
      lang.is_default = false;
    });
    
    // Set this language as default
    languages[languageIndex].is_default = true;
    languages[languageIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Default language updated successfully',
      data: languages[languageIndex]
    });
    
  } catch (error) {
    console.error('Set default language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
