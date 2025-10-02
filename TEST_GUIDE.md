# 🧪 Testing Guide

## Overview

This document describes the testing setup for the Chawkbazar project.

---

## 📊 Current Testing Status

### **Backend Testing**
- ✅ Jest configured in package.json
- ✅ Supertest configured for API testing
- ⚠️ No test files implemented yet

### **Frontend Testing**
- ⚠️ No testing framework configured
- 📝 Recommended: Jest + React Testing Library + Playwright/Cypress

---

## 🔧 Backend Testing Setup

### **Installed Packages**
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### **Running Backend Tests**
```bash
cd backend-express
npm test
```

### **Creating Test Files**

Create test files in `backend-express/__tests__/` or alongside route files:

```javascript
// backend-express/__tests__/auth.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Authentication', () => {
  test('POST /token - should login successfully', async () => {
    const response = await request(app)
      .post('/token')
      .send({
        email: 'admin@chawkbazar.com',
        password: 'password'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  test('POST /token - should fail with wrong password', async () => {
    const response = await request(app)
      .post('/token')
      .send({
        email: 'admin@chawkbazar.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
  });
});

describe('Products', () => {
  test('GET /products - should return products list', async () => {
    const response = await request(app).get('/products');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

---

## 🧪 Manual API Testing

### **Using cURL**

#### Test Health Check
```bash
curl -X GET http://localhost:8000/health
```

#### Test Login
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chawkbazar.com",
    "password": "password"
  }'
```

#### Test Get Products
```bash
curl -X GET http://localhost:8000/products
```

#### Test Protected Endpoint
```bash
TOKEN="your-jwt-token"
curl -X GET http://localhost:8000/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Testing with Postman

### **Import Collection**

Create a Postman collection with these requests:

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:8000/health`

2. **Login**
   - Method: POST
   - URL: `http://localhost:8000/token`
   - Body (JSON):
     ```json
     {
       "email": "admin@chawkbazar.com",
       "password": "password"
     }
     ```

3. **Get Products**
   - Method: GET
   - URL: `http://localhost:8000/products`

4. **Get User Profile**
   - Method: GET
   - URL: `http://localhost:8000/me`
   - Headers: `Authorization: Bearer {{token}}`

---

## 🎭 Frontend Testing (To Implement)

### **Recommended Setup**

#### Install Testing Libraries
```bash
# For Shop
cd shop
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# For Admin
cd admin/rest
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

#### E2E Testing with Playwright
```bash
# Install Playwright
yarn add -D @playwright/test
npx playwright install

# Create test
mkdir -p e2e
cat > e2e/shop.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('should load shop homepage', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Chawkbazar/);
});

test('should login as customer', async ({ page }) => {
  await page.goto('http://localhost:3000/signin');
  await page.fill('input[name="email"]', 'customer@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
EOF
```

---

## 📋 Manual Testing Checklist

### **Backend API**
- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login works (returns JWT token)
- [ ] Protected endpoints require authentication
- [ ] Products API returns data
- [ ] Categories API works
- [ ] Orders API works
- [ ] CORS is properly configured
- [ ] Rate limiting works

### **Shop Frontend**
- [ ] Homepage loads
- [ ] Products display correctly
- [ ] Product search works
- [ ] Product filtering works
- [ ] User can register
- [ ] User can login
- [ ] User can add items to cart
- [ ] Cart updates correctly
- [ ] Checkout process works
- [ ] User profile accessible
- [ ] Responsive on mobile

### **Admin Dashboard**
- [ ] Login page loads
- [ ] Admin can login
- [ ] Dashboard displays
- [ ] Product list loads
- [ ] Can create new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Order management works
- [ ] User management works
- [ ] Settings page works
- [ ] Analytics display

---

## 🚦 Integration Testing

Test the full flow:

### **Customer Purchase Flow**
1. Open shop: http://localhost:3000
2. Browse products
3. Add product to cart
4. Register/Login
5. Proceed to checkout
6. Complete order

### **Admin Product Management Flow**
1. Open admin: http://localhost:3001
2. Login as admin
3. Navigate to Products
4. Create new product
5. Edit product
6. View in shop
7. Delete product

---

## 🔄 CI/CD Testing (To Implement)

### **GitHub Actions Example**

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend-express && npm install
      - name: Run tests
        run: cd backend-express && npm test
      
  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: yarn install
      - name: Build shop
        run: cd shop && yarn build
      - name: Build admin
        run: cd admin/rest && yarn build
```

---

## 📊 Test Coverage (To Implement)

### **Jest Coverage**

Add to `backend-express/package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "routes/**/*.js",
      "middleware/**/*.js"
    ]
  }
}
```

Run coverage:
```bash
cd backend-express
npm run test:coverage
```

---

## 🐛 Debugging Tests

### **Backend**
```bash
# Run specific test file
cd backend-express
npm test -- auth.test.js

# Run with verbose output
npm test -- --verbose

# Run in watch mode
npm test -- --watch
```

### **VS Code Debug Configuration**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Tests",
      "program": "${workspaceFolder}/backend-express/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 📈 Performance Testing

### **Load Testing with Artillery**

```bash
# Install artillery
npm install -g artillery

# Create load test
cat > artillery-test.yml << 'EOF'
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Get products"
    flow:
      - get:
          url: "/products"
EOF

# Run load test
artillery run artillery-test.yml
```

---

## ✅ Current Test Status Summary

| Component | Framework | Status | Coverage |
|-----------|-----------|--------|----------|
| Backend API | Jest + Supertest | ⚠️ Configured, no tests | 0% |
| Shop Frontend | Not configured | ❌ Not implemented | 0% |
| Admin Frontend | Not configured | ❌ Not implemented | 0% |
| E2E Tests | Not configured | ❌ Not implemented | N/A |
| Load Tests | Not configured | ❌ Not implemented | N/A |

---

## 🎯 Next Steps for Testing

1. **Create Backend Tests**
   - Write unit tests for routes
   - Write integration tests for API flows
   - Add test coverage reporting

2. **Setup Frontend Testing**
   - Configure Jest + React Testing Library
   - Write component tests
   - Setup Playwright for E2E tests

3. **CI/CD Integration**
   - Setup GitHub Actions
   - Run tests on pull requests
   - Add test coverage badges

4. **Performance Testing**
   - Setup load testing with Artillery
   - Identify bottlenecks
   - Optimize slow endpoints

---

**Testing is important for production-ready applications!** 🧪
