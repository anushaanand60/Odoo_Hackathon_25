# 🎯 SkillSwap - Peer-to-Peer Skill Exchange Platform

A modern, full-stack web application that connects people who want to learn new skills with those who can teach them. Built with React, Node.js, PostgreSQL, and deployed with cloud-first architecture.

## 🌟 Features

### 👤 User Management
- **User Registration & Authentication** - Secure JWT-based authentication
- **Profile Management** - Comprehensive user profiles with photos (Cloudinary integration)
- **Skill Listings** - Add skills you can teach and skills you want to learn
- **Project Showcase** - Display your projects linked to specific skills
- **Availability Scheduling** - Set your availability for skill exchanges

### 🔍 Discovery & Matching
- **Smart Search** - Find users by skills, location, or availability
- **Skill Autocomplete** - Intelligent skill suggestions with trending skills
- **Advanced Filters** - Filter by skill type, location, user ratings
- **Top Users** - Discover highly-rated skill teachers

### 💬 Swap Requests
- **Request System** - Send and receive skill exchange requests
- **Status Tracking** - Track pending, accepted, rejected, and completed swaps
- **Messaging** - Include personal messages with requests
- **Smart Matching** - Users can rediscover each other after completing ratings

### ⭐ Rating & Review System
- **Mutual Ratings** - Rate and review users after completed swaps
- **Rating Statistics** - View detailed rating breakdowns and averages
- **Review Management** - Edit and delete your own ratings
- **Trust Building** - Build reputation through positive exchanges

### 🛡️ Admin Panel
- **User Management** - Ban/unban users, manage roles, monitor activity
- **Content Moderation** - Approve/reject skills, flag inappropriate content
- **Report System** - Handle user reports for spam, harassment, fake profiles
- **Platform Messages** - Send announcements and updates to users
- **Analytics Dashboard** - User growth, engagement metrics, export capabilities
- **Audit Logs** - Track all admin actions for accountability

### 🎨 User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Collapsible Sidebar** - Modern navigation with smooth animations
- **Dark Theme** - Beautiful gradient-based dark UI
- **Real-time Updates** - Live status updates and notifications
- **Smooth Animations** - Framer Motion powered interactions

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Modern database ORM
- **PostgreSQL** - Robust relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Cloudinary** - Image storage and optimization

### Infrastructure
- **Docker** - Containerization for development
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **PostgreSQL Cloud** - Database hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 16+ (or Docker)
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd skillswap
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Setup

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL container
docker-compose up -d

# Run database migrations
npx prisma migrate dev
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb skillswap

# Update .env with your database URL
# Run migrations
npx prisma migrate dev
```

### 4. Environment Configuration
Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://skillswap:passskilswap@localhost:5432/skillswap"

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server
PORT=8000

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Node Environment
NODE_ENV=development
```

### 5. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 6. Start Development Servers
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory, new terminal)
npm run dev
```

### 7. Create Admin User (Optional)
```bash
cd backend
node scripts/createAdmin.js
```

Visit `http://localhost:5173` to access the application!

## 📱 Usage Guide

### For Regular Users
1. **Sign Up** - Create your account with email and password
2. **Complete Profile** - Add your photo, location, and availability
3. **Add Skills** - List skills you can teach and want to learn
4. **Discover Users** - Search for people with skills you want to learn
5. **Send Requests** - Request skill exchanges with other users
6. **Complete Swaps** - Meet up and exchange skills
7. **Rate & Review** - Rate your experience after the swap

### For Admins
1. **Access Admin Panel** - Navigate to `/admin` (admin users only)
2. **Monitor Users** - View user activity, ban problematic users
3. **Moderate Content** - Review and approve/reject skill listings
4. **Handle Reports** - Process user reports and take action
5. **Send Messages** - Broadcast platform announcements
6. **View Analytics** - Monitor platform growth and engagement

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
4. Deploy with these settings:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Backend (Render)
1. Create PostgreSQL database on Render
2. Create Web Service on Render
3. Set environment variables (same as development)
4. Deploy with these settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

### Database Migration
```bash
# Run this after deploying backend
npx prisma migrate deploy
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile/update` - Update profile
- `POST /api/profile/upload-photo` - Upload profile photo

### Skills
- `POST /api/skills/add` - Add new skill
- `DELETE /api/skills/:id` - Remove skill
- `GET /api/search/skills` - Get all skills
- `GET /api/search/trending-skills` - Get trending skills

### Search
- `GET /api/search/users` - Search users
- `GET /api/search/users/:id` - Get user by ID

### Swap Requests
- `POST /api/requests/create` - Create swap request
- `GET /api/requests/my-requests` - Get user's requests
- `PUT /api/requests/:id/respond` - Respond to request
- `DELETE /api/requests/:id` - Cancel request

### Ratings
- `POST /api/ratings/submit` - Submit rating
- `GET /api/ratings/user/:id` - Get user ratings
- `GET /api/ratings/stats/:id` - Get rating statistics

### Admin (Protected)
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Manage users
- `POST /api/admin/messages` - Send platform messages
- `GET /api/admin/reports` - View reports
- `GET /api/admin/analytics` - Platform analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our Discord server for community support

## 🎯 Roadmap

- [ ] Real-time messaging system
- [ ] Video call integration for remote skill exchanges
- [ ] Mobile app (React Native)
- [ ] Advanced matching algorithms
- [ ] Skill certification system
- [ ] Points and rewards system
- [ ] Group skill sessions
- [ ] Integration with calendar apps

## 🏆 Acknowledgments

- Built with modern React and Node.js best practices
- UI inspired by modern design systems
- Icons by Lucide React
- Animations powered by Framer Motion
- Image optimization by Cloudinary

---

**Made with ❤️ by the SkillSwap Team**

*Connecting learners and teachers, one skill at a time.* 