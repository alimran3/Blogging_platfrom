# Blog Platform - মনের কিছু কথা

A modern, full-stack blog platform with a beautiful UI and comprehensive admin panel.

## 🚀 Features

### User Features
- ✨ Create and publish blog posts
- 📝 Rich text editor with markdown support
- 🖼️ Image upload with automatic compression (max 2MB)
- 💬 Comment system with replies
- ❤️ Like and follow functionality
- 🔐 Secure authentication with hobby-based password recovery
- 👤 User profiles with bio and social links

### Admin Features
- 📊 Dashboard with statistics
- 👥 User management (role assignment, ban/unban)
- 📝 Blog management (view all, delete any)
- 💬 Comment management
- 🔒 Role-based access control (Admin, Moderator, User)

### Security Features
- 🔐 JWT authentication
- 🛡️ Hobby-based password recovery (no email required)
- 🚫 Rate limiting
- 🛡️ Helmet security headers
- ✅ Input validation

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- TanStack Query
- React Hook Form

**Backend:**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Socket.io
- Cloudinary
- Multer
- Sharp

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed:admin  # Create admin user
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 🔐 Default Admin Credentials

After running `npm run seed:admin`:

- **Email:** `adminimran@gmail.com`
- **Password:** `adminImran`
- **Security Hobby:** `coding`

## 🌐 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete deployment instructions.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/password-reset/verify-hobby` - Verify hobby for password reset
- `POST /api/password-reset/reset-password` - Reset password

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog (protected)
- `PUT /api/blogs/:id` - Update blog (protected)
- `DELETE /api/blogs/:id` - Delete blog (protected)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/users/:id/follow` - Follow user (protected)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role (admin only)
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/blogs` - Get all blogs
- `DELETE /api/admin/blogs/:id` - Delete any blog
- `GET /api/admin/comments` - Get all comments
- `DELETE /api/admin/comments/:id` - Delete any comment

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Developed with ❤️ for sharing stories and connecting people.
