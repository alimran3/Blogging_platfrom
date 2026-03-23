# 🚀 Blog Platform - Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables

#### Server (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=generate-a-strong-secret-key-here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://your-frontend-domain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

#### Client (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 2. Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured (or allow access from anywhere: 0.0.0.0/0)
- [ ] Connection string tested

### 3. Cloudinary Setup
- [ ] Cloudinary account created
- [ ] Cloud name, API key, and API secret added to .env
- [ ] Upload presets configured (if using unsigned uploads)

### 4. Email Setup (for Password Reset)
- [ ] Gmail account with 2-Step Verification enabled
- [ ] App password generated from Google Account settings
- [ ] Email credentials added to .env

### 5. Admin User Setup
Run the admin seed script after deployment:
```bash
cd server
npm run seed:admin
```

**Default Admin Credentials:**
- Email: `adminimran@gmail.com`
- Password: `adminImran`
- Security Hobby: `coding`

## 🔧 Deployment Steps

### Backend Deployment

1. **Install Dependencies**
   ```bash
   cd server
   npm install --production
   ```

2. **Build (if using TypeScript)**
   ```bash
   npm run build
   ```

3. **Start Server**
   ```bash
   # Using PM2 (Recommended)
   pm2 start server.js --name blog-api
   
   # Or using Node directly
   NODE_ENV=production node server.js
   ```

4. **Verify Server**
   - Check `/api/health` endpoint
   - Test login endpoint
   - Test blog creation

### Frontend Deployment

1. **Update API URL**
   - Update `VITE_API_URL` in `.env` to production backend URL

2. **Build**
   ```bash
   cd client
   npm install
   npm run build
   ```

3. **Deploy dist folder**
   - Upload `dist` folder to your hosting (Vercel, Netlify, etc.)
   - Configure routing rules for SPA

## 🔐 Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production
- [ ] Remove console.logs from production
- [ ] Enable rate limiting (already configured)
- [ ] Set up MongoDB backup
- [ ] Configure firewall rules
- [ ] Use environment variables for all secrets

## 📊 Post-Deployment Testing

### Critical User Flows
- [ ] User Registration
- [ ] User Login
- [ ] Forgot Password (test with hobby: coding for admin)
- [ ] Create Blog Post
- [ ] Upload Cover Image
- [ ] Edit Blog Post
- [ ] Delete Blog Post
- [ ] Comment on Blog
- [ ] Like Blog
- [ ] Follow User
- [ ] Update Profile
- [ ] Upload Avatar

### Admin Features
- [ ] Access Admin Dashboard (/admin)
- [ ] View Statistics
- [ ] Manage Users
- [ ] Change User Roles
- [ ] Ban/Unban Users
- [ ] Delete Blogs
- [ ] Delete Comments

## 🐛 Known Issues & Fixes

### 1. Profile Images Not Showing
**Fixed:** All components now use ModernAvatarIcon fallback

### 2. Forgot Password Not Working
**Fixed:** Hobby-based verification implemented
- No email configuration required
- Admin hobby: `coding`

### 3. Cover Image Optional
**Fixed:** Cover image is now optional for blog posts

### 4. Avatar Icon Consistency
**Fixed:** All avatar icons now use the same modern design across:
- Profile pages
- Blog cards
- Comments
- Admin panel
- User lists

## 📝 Important URLs

- **Home:** `/`
- **Login/Signup:** `/auth`
- **Forgot Password:** `/forgot-password`
- **Create Blog:** `/create`
- **Dashboard:** `/dashboard`
- **Admin Panel:** `/admin` (admin/moderator only)
- **Profile:** `/profile/:id`

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check .env file exists and has all required variables
# Check MongoDB connection string
# Check port is not in use
netstat -ano | findstr :5000
```

### Frontend Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Images Not Uploading
- Check Cloudinary credentials
- Check file size limits (2MB enforced)
- Check network connectivity

### Password Reset Not Working
- Check hobby is set during registration
- Hobby matching is case-insensitive
- Admin hobby: `coding`

## 📞 Support

For issues or questions:
1. Check server logs
2. Check browser console
3. Verify environment variables
4. Test API endpoints with Postman

## 🎯 Production Recommendations

1. **Monitoring**
   - Set up error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)
   - Set up analytics (Google Analytics)

2. **Performance**
   - Enable CDN for static assets
   - Enable gzip/brotli compression
   - Optimize images before upload
   - Implement caching strategies

3. **Backup**
   - Daily MongoDB backups
   - Cloudinary backup strategy
   - Database export scripts

4. **Scaling**
   - Use load balancer for multiple instances
   - Redis for session management
   - CDN for static assets
   - Database indexing optimization

---

**Last Updated:** 2026-03-23
**Version:** 1.0.0
