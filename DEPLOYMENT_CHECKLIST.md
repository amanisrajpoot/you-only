# ✅ Production Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] All environment variables are set correctly
- [ ] JWT secrets are changed from defaults
- [ ] Database connection strings configured (if using real DB)
- [ ] API endpoints updated for production URLs
- [ ] CORS origins configured for production domains
- [ ] Rate limiting configured appropriately

### Security
- [ ] Remove or disable all console.log statements
- [ ] Update all default passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure security headers (Helmet)
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Configure CSP (Content Security Policy)
- [ ] Review exposed API endpoints
- [ ] Implement proper authentication on all protected routes
- [ ] Enable API key rotation if applicable

### Code Quality
- [ ] All tests passing
- [ ] No critical linting errors
- [ ] Code reviewed
- [ ] Dependencies updated
- [ ] Security audit passed (`npm audit`, `yarn audit`)
- [ ] Remove unused dependencies
- [ ] Optimize bundle sizes

### Performance
- [ ] Images optimized
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] Caching configured
- [ ] CDN setup for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Lazy loading implemented

---

## Backend Deployment

### Railway.app
- [ ] Create Railway account
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Deploy: `cd backend-express && railway up`
- [ ] Set environment variables in Railway dashboard
- [ ] Configure custom domain (optional)
- [ ] Enable auto-deploy from GitHub
- [ ] Configure health checks
- [ ] Set up monitoring and alerts

### Alternative: Render.com
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy backend service

### Alternative: Docker/VPS
- [ ] Build Docker image
- [ ] Push to container registry
- [ ] Deploy to VPS/cloud provider
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates
- [ ] Configure auto-restart on failure

---

## Frontend Deployment

### Shop (Vercel)
- [ ] Create Vercel account
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `cd shop && vercel --prod`
- [ ] Set environment variables:
  - `NEXT_PUBLIC_REST_API_ENDPOINT`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- [ ] Configure custom domain
- [ ] Enable auto-deploy from GitHub
- [ ] Configure build settings
- [ ] Test production build locally first

### Admin (Vercel)
- [ ] Deploy: `cd admin/rest && vercel --prod`
- [ ] Set environment variables:
  - `NEXT_PUBLIC_REST_API_ENDPOINT`
  - `NEXT_PUBLIC_SHOP_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- [ ] Configure custom domain
- [ ] Enable auto-deploy from GitHub
- [ ] Restrict access (IP whitelist or auth)

---

## Database Setup (Optional)

### MySQL/PostgreSQL
- [ ] Create production database
- [ ] Set up connection pooling
- [ ] Configure backups
- [ ] Set up read replicas (if needed)
- [ ] Run migrations
- [ ] Seed initial data
- [ ] Configure SSL connection

### MongoDB Atlas (Alternative)
- [ ] Create MongoDB Atlas cluster
- [ ] Whitelist application IP addresses
- [ ] Create database user
- [ ] Configure connection string
- [ ] Set up backups

---

## Post-Deployment

### Verification
- [ ] Backend health check passing
- [ ] Shop frontend loads
- [ ] Admin frontend loads
- [ ] Login works for all user types
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout flow works
- [ ] Admin CRUD operations work
- [ ] API endpoints respond correctly
- [ ] SSL certificates valid
- [ ] CORS working correctly

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up application monitoring (New Relic, Datadog)
- [ ] Configure log aggregation
- [ ] Set up alerts for:
  - High error rates
  - Slow response times
  - Server downtime
  - High memory/CPU usage

### Performance Testing
- [ ] Run load tests
- [ ] Check page load times
- [ ] Test API response times
- [ ] Verify caching works
- [ ] Test under high traffic

### Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbooks for common issues
- [ ] Document rollback procedure
- [ ] Update API documentation

---

## CI/CD Setup

### GitHub Actions
- [ ] Configure workflow file (`.github/workflows/ci.yml`)
- [ ] Set up build pipeline
- [ ] Configure test pipeline
- [ ] Set up deployment pipeline
- [ ] Add required secrets:
  - `RAILWAY_TOKEN`
  - `VERCEL_TOKEN`
  - `DOCKER_USERNAME`
  - `DOCKER_PASSWORD`
- [ ] Test automated deployments

---

## Backup & Recovery

### Backups
- [ ] Database backups configured
- [ ] File storage backups (if applicable)
- [ ] Environment variables documented
- [ ] Code repository backed up

### Disaster Recovery
- [ ] Documented rollback procedure
- [ ] Tested restore from backup
- [ ] Documented recovery time objective (RTO)
- [ ] Documented recovery point objective (RPO)

---

## Legal & Compliance

- [ ] Privacy policy in place
- [ ] Terms of service in place
- [ ] GDPR compliance (if applicable)
- [ ] Cookie consent implemented
- [ ] Data retention policies defined

---

## Final Checks

### Before Going Live
- [ ] All staging tests passed
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Team trained on production system
- [ ] Support documentation ready
- [ ] Monitoring dashboards set up
- [ ] Incident response plan ready
- [ ] Communication plan for users

### Go-Live
- [ ] Deploy during low-traffic period
- [ ] Monitor closely for first 24 hours
- [ ] Have rollback plan ready
- [ ] Team on standby
- [ ] Announce maintenance window if needed

### Post Go-Live
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Fix critical issues immediately
- [ ] Plan for iterative improvements

---

## Quick Deployment Commands

### Backend (Railway)
```bash
cd backend-express
railway login
railway up
```

### Shop (Vercel)
```bash
cd shop
vercel --prod
```

### Admin (Vercel)
```bash
cd admin/rest
vercel --prod
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Rollback Procedure

### Immediate Rollback
```bash
# Railway
railway rollback

# Vercel
vercel rollback

# Docker
docker-compose down
docker-compose -f docker-compose.prod.yml up -d --build <old-version>
```

### Gradual Rollback
- Route 10% of traffic to old version
- Monitor metrics
- Gradually increase if stable
- Full rollback if issues persist

---

## Support Contacts

**Emergency Contacts:**
- DevOps Lead: [Contact Info]
- Backend Lead: [Contact Info]
- Frontend Lead: [Contact Info]

**Service Providers:**
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- [Database Provider] Support: [Link]

---

## Success Metrics

Track these after deployment:
- Uptime percentage (target: 99.9%)
- Average response time (target: <200ms)
- Error rate (target: <0.1%)
- User satisfaction score
- Page load times
- Conversion rates

---

**Remember:** It's better to delay deployment than to deploy with known issues!

Good luck! 🚀
