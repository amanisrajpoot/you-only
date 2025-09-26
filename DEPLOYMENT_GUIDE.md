# 🚀 Quick Deployment Guide

## Backend Deployment (Railway)

### Step 1: Deploy Backend
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose `backend-express` folder as root directory
6. Railway will automatically detect Node.js and deploy
7. Copy the generated URL (e.g., `https://your-app.railway.app`)

### Step 2: Update Environment Variables
In Railway dashboard, add these environment variables:
```
NODE_ENV=production
PORT=3000
```

## Frontend Deployment (Vercel)

### Step 1: Deploy Shop Frontend
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → Import your repository
4. Choose `shop` folder as root directory
5. Set build command: `yarn build`
6. Set output directory: `.next`
7. Add environment variable:
   ```
   NEXT_PUBLIC_REST_API_ENDPOINT=https://your-backend-url.railway.app
   ```
8. Deploy!

### Step 2: Deploy Admin Frontend
1. In Vercel, create another project
2. Choose `admin/rest` folder as root directory
3. Set build command: `yarn build`
4. Set output directory: `.next`
5. Add environment variable:
   ```
   NEXT_PUBLIC_REST_API_ENDPOINT=https://your-backend-url.railway.app
   ```
6. Deploy!

## Alternative: Render (Full Stack)

### Deploy Everything on Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Create 3 services:

#### Backend Service:
- **Type**: Web Service
- **Build Command**: `cd backend-express && npm install`
- **Start Command**: `cd backend-express && node server.js`
- **Root Directory**: `backend-express`

#### Shop Frontend:
- **Type**: Static Site
- **Build Command**: `cd shop && yarn install && yarn build`
- **Publish Directory**: `shop/.next`
- **Root Directory**: `shop`

#### Admin Frontend:
- **Type**: Static Site
- **Build Command**: `cd admin/rest && yarn install && yarn build`
- **Publish Directory**: `admin/rest/.next`
- **Root Directory**: `admin/rest`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_REST_API_ENDPOINT=https://your-backend-url.railway.app
```

## Quick Commands

### Deploy to Railway (Backend)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
cd backend-express
railway up
```

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy shop
cd shop
vercel --prod

# Deploy admin
cd ../admin/rest
vercel --prod
```

## Expected URLs
- **Backend**: `https://your-app.railway.app`
- **Shop**: `https://your-shop.vercel.app`
- **Admin**: `https://your-admin.vercel.app`

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure backend URL is correct in frontend env
2. **Build Failures**: Check Node.js version compatibility
3. **Environment Variables**: Ensure all required vars are set
4. **Database**: Use Railway's PostgreSQL or external database

### Support:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)
