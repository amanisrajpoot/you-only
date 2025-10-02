# 🚀 Chawkbazar Local Development Guide

## ✅ Project Setup Complete!

Your full-stack e-commerce application is now ready to run locally.

---

## 📦 Project Overview

### **Architecture**
- **Backend**: Node.js + Express REST API (Port: 8000)
- **Shop Frontend**: Next.js 14 + React 18 + TypeScript (Port: 3000)
- **Admin Frontend**: Next.js 13 + React 18 + TypeScript (Port: 3001)
- **Database**: Mock data in-memory (No database required for local development)
- **Authentication**: JWT-based auth with bcrypt password hashing

### **Tech Stack**
```
Backend:
├── Express.js 4.18
├── JWT Authentication
├── bcryptjs for password hashing
├── express-validator
├── CORS enabled
├── Helmet security
└── Rate limiting

Shop Frontend:
├── Next.js 14.0.3
├── React 18.3.1
├── TypeScript 5.3.2
├── Tailwind CSS 3.4.14
├── React Query 3.39.3
├── Framer Motion
├── next-i18next (i18n)
└── Jotai (state management)

Admin Frontend:
├── Next.js 13.5.6
├── React 18.3.1
├── TypeScript 5.6.3
├── Tailwind CSS 3.4.14
├── React Query 3.39.3
├── React Hook Form
└── ApexCharts
```

---

## 🎯 Quick Start

### **Option 1: Start All Services at Once**
```bash
./start-all.sh
```

### **Option 2: Start Services Individually**
```bash
# Terminal 1 - Backend
./start-backend.sh

# Terminal 2 - Shop Frontend
./start-shop.sh

# Terminal 3 - Admin Dashboard
./start-admin.sh
```

### **Option 3: Using npm/yarn directly**
```bash
# Backend
cd backend-express && npm run dev

# Shop (in new terminal)
cd shop && yarn dev

# Admin (in new terminal)
cd admin/rest && yarn dev
```

---

## 🌐 Application URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Health Check** | http://localhost:8000/health | System health status |
| **Shop (Customer)** | http://localhost:3000 | Customer-facing store |
| **Admin Dashboard** | http://localhost:3001 | Store management |

---

## 👥 Default User Accounts

### **Admin Account**
```
Email: admin@chawkbazar.com
Password: password
Role: super_admin
Permissions: [super_admin, store_owner, staff]
```

### **Store Owner**
```
Email: owner@example.com
Password: password
Role: store_owner
Permissions: [store_owner, staff]
```

### **Staff User**
```
Email: staff@example.com
Password: password
Role: staff
Permissions: [staff]
```

### **Customer**
```
Email: customer@example.com
Password: password
Role: customer
Permissions: [customer]
```

---

## 🔑 API Endpoints

### **Authentication**
```bash
# Register new user
POST /register
Body: { "name": "John", "email": "john@example.com", "password": "password123" }

# Login
POST /token
Body: { "email": "admin@chawkbazar.com", "password": "password" }

# Get current user
GET /me
Headers: { "Authorization": "Bearer <token>" }

# Logout
POST /logout
Headers: { "Authorization": "Bearer <token>" }
```

### **Products**
```bash
# Get all products
GET /products?limit=15&page=1

# Get single product
GET /products/{slug}

# Create product (Admin)
POST /products
Headers: { "Authorization": "Bearer <token>" }

# Update product (Admin)
PUT /products/{slug}
Headers: { "Authorization": "Bearer <token>" }

# Delete product (Admin)
DELETE /products/{id}
Headers: { "Authorization": "Bearer <token>" }
```

### **Other Endpoints**
```bash
GET /categories          # Get all categories
GET /types               # Get product types
GET /shops               # Get all shops
GET /orders              # Get orders
GET /settings            # Get settings
GET /popular-products    # Get popular products
GET /featured-categories # Get featured categories
GET /top-authors         # Get top authors
GET /top-manufacturers   # Get top manufacturers
```

---

## 📁 Project Structure

```
you-only/
├── backend-express/          # Express API Backend
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── products.js      # Product management
│   │   ├── categories.js    # Category management
│   │   ├── orders.js        # Order management
│   │   └── ... (40+ route files)
│   ├── middleware/          # Express middleware
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   └── .env                 # Backend environment variables
│
├── shop/                    # Customer-facing Next.js app
│   ├── src/
│   │   ├── pages/          # Next.js pages
│   │   ├── components/     # React components
│   │   ├── framework/      # API client & utils
│   │   ├── contexts/       # React contexts
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   ├── package.json        # Shop dependencies
│   └── .env.local          # Shop environment variables
│
├── admin/rest/             # Admin Dashboard Next.js app
│   ├── src/
│   │   ├── pages/         # Next.js pages
│   │   ├── components/    # React components
│   │   ├── data/          # API client & queries
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   ├── package.json       # Admin dependencies
│   └── .env.local         # Admin environment variables
│
├── start-all.sh           # Start all services
├── start-backend.sh       # Start backend only
├── start-shop.sh          # Start shop only
├── start-admin.sh         # Start admin only
├── package.json           # Root workspace config
└── README.md              # Project readme
```

---

## 🔧 Environment Variables

### **Backend (.env)**
```env
NODE_ENV=development
PORT=8000
APP_NAME="Chawkbazar API"
APP_URL=http://localhost:8000

JWT_SECRET=supersecretjwtkey-change-this-in-production
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003

# Database (Optional - uses mock data)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=chawkbazar_user
DB_PASSWORD=chawkbazar_password
DB_DATABASE=chawkbazar
```

### **Shop Frontend (.env.local)**
```env
NODE_ENV=development
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=chawkbazar-nextauth-secret-key-2024
```

### **Admin Frontend (.env.local)**
```env
NODE_ENV=development
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:8000
NEXT_PUBLIC_SHOP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=chawkbazar-admin-nextauth-secret-key-2024
```

---

## 🧪 Testing APIs with cURL

### **Health Check**
```bash
curl http://localhost:8000/health
```

### **Get Products**
```bash
curl http://localhost:8000/products
```

### **Login**
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chawkbazar.com","password":"password"}'
```

### **Get User Profile (with auth)**
```bash
TOKEN="your-jwt-token-here"
curl http://localhost:8000/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### **Port Already in Use**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### **Clear Node Modules and Reinstall**
```bash
# Backend
cd backend-express && rm -rf node_modules && npm install

# Frontend (from root)
yarn clean
yarn install
```

### **Backend Not Starting**
1. Check if port 8000 is available
2. Verify .env file exists in backend-express/
3. Check backend-express/server.js for syntax errors
4. Look at logs: `cd backend-express && npm run dev`

### **Frontend Not Starting**
1. Ensure backend is running first
2. Check .env.local files exist in shop/ and admin/rest/
3. Verify NEXT_PUBLIC_REST_API_ENDPOINT is set correctly
4. Clear Next.js cache: `rm -rf .next`

---

## 📝 Development Workflow

### **1. Start Development**
```bash
# Start all services
./start-all.sh
```

### **2. Make Changes**
- Backend: Edit files in `backend-express/` - auto-reloads with nodemon
- Frontend: Edit files in `shop/src/` or `admin/rest/src/` - auto-reloads with Next.js

### **3. Test Your Changes**
- Visit http://localhost:3000 for shop
- Visit http://localhost:3001 for admin
- Use browser DevTools to debug
- Check terminal for errors

### **4. Stop Services**
```bash
# If using start-all.sh, press Ctrl+C

# Or manually:
pkill -f "node.*server.js"  # Kill backend
pkill -f "next-server"       # Kill Next.js servers
```

---

## 🚀 Deployment

### **Current Deployment Setup**

The project is configured for deployment to:
- **Backend**: Railway.app
- **Frontend**: Vercel

### **Deployment Files**
```
backend-express/
├── Procfile              # Railway deployment
├── railway.json          # Railway configuration
└── package.json          # Start command: node server.js

Root:
├── vercel.json           # Vercel configuration
├── deploy.sh             # Deployment script (Linux/Mac)
├── deploy.ps1            # Deployment script (Windows)
└── DEPLOYMENT_GUIDE.md   # Detailed deployment guide
```

### **Quick Deploy**
```bash
# Deploy backend to Railway
cd backend-express
railway login
railway up

# Deploy shop to Vercel
cd shop
vercel --prod

# Deploy admin to Vercel
cd admin/rest
vercel --prod
```

---

## 📚 Additional Resources

- **Backend Documentation**: See route files in `backend-express/routes/`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Package.json Scripts**: Check root `package.json` for workspace commands

---

## 🎨 Features Available

### **Customer Shop (Port 3000)**
- ✅ Product browsing with filters
- ✅ Product search
- ✅ Shopping cart
- ✅ User authentication
- ✅ Order placement
- ✅ User profile
- ✅ Multi-language support (i18n)
- ✅ Responsive design

### **Admin Dashboard (Port 3001)**
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ User management
- ✅ Category management
- ✅ Shop settings
- ✅ Analytics dashboard
- ✅ Role-based access control

### **Backend API (Port 8000)**
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Rate limiting
- ✅ CORS enabled
- ✅ Security headers (Helmet)
- ✅ Error handling
- ✅ Health check endpoint
- ✅ 40+ API routes

---

## 🆘 Need Help?

1. Check the terminal output for error messages
2. Review the `.env` files for correct configuration
3. Ensure all dependencies are installed
4. Check that ports 8000, 3000, and 3001 are available
5. Review the DEPLOYMENT_GUIDE.md for production setup

---

**Happy Coding! 🎉**
