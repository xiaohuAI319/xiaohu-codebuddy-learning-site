# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is 小虎CodeBuddy学习站 (Xiaohu CodeBuddy Learning Station) - an AI programming learning platform built with React + TypeScript frontend and Node.js + Express + TypeScript backend, using SQLite database with Sequelize ORM.

## Development Commands

### Root Level Commands
```bash
# Install all dependencies
npm run install:all          # Install both frontend and backend dependencies
npm run install:frontend     # Install frontend dependencies only
npm run install:backend      # Install backend dependencies only

# Development servers
npm run dev                  # Start both frontend and backend concurrently
npm run dev:frontend         # Start frontend only (port 3000)
npm run dev:backend          # Start backend only (port 5000)

# Build commands
npm run build                # Build both frontend and backend
npm run build:frontend       # Build frontend only
npm run build:backend        # Build backend only
```

### Backend Commands (from backend/ directory)
```bash
npm run dev                  # Start development server with nodemon
npm run build                # Compile TypeScript to JavaScript
npm run start                # Start production server
npm run test                 # Run Jest tests
npm run init-db              # Initialize database schema
```

### Frontend Commands (from frontend/ directory)
```bash
npm start                    # Start development server
npm run build                # Build production version
npm test                     # Run React tests
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + React Router + Axios
- **Backend**: Node.js + Express + TypeScript + Sequelize ORM + SQLite
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Database**: SQLite with Sequelize ORM

### Database Structure
The application uses SQLite with a comprehensive schema supporting:
- **Users**: User accounts with roles, membership levels, and authentication
- **MembershipTiers**: 5-level membership system with permissions
- **Works**: User submissions with layered content system
- **Categories/Bootcamps**: Content organization
- **Coupons/SerialCodes**: Payment and membership activation
- **OperationLog**: Audit trail for admin actions

### Key Architectural Features
1. **Layered Content System**: Works have 5 content levels (preview → basic → advanced → premium → sourceCode) with access control based on membership level
2. **Smart Content Filtering**: Automatic content filtering based on user membership level
3. **Admin System**: Complete admin dashboard with role-based access control
4. **Slug-based URLs**: Works use SEO-friendly slugs instead of numeric IDs in URLs

### Important Development Notes
- Database file: `backend/database/xiaohu-codebuddy.db` (note: hyphen, not underscore)
- Default admin account: admin@xiaohu.com / admin123456
- Frontend proxy setup: `frontend/src/setupProxy.js` proxies /api and /uploads to backend
- Port conflicts: Backend runs on port 5000, frontend on port 3000

## Code Structure

### Frontend (frontend/src)
- `components/`: Reusable React components (Layout, MembershipBadge, ProtectedRoute, etc.)
- `contexts/`: React contexts (AuthContext for user authentication)
- `pages/`: Page components (HomePage, WorksPage, AdminPage, etc.)
- `utils/`: Utility functions
- `types/`: TypeScript type definitions

### Backend (backend/src)
- `models/`: Sequelize models (User, Work, MembershipTier, etc.)
- `routes/`: Express API routes (auth, works, admin, membership, etc.)
- `middleware/`: Express middleware (auth, membership, rate limiting)
- `config/`: Configuration files (database, environment)
- `scripts/`: Database initialization scripts

### Testing
- Login/registration module is fully tested with 100% pass rate
- Admin backend system is developed but pending full testing
- Work upload, membership, and voting systems need testing

## Development Environment Setup

1. **Database Setup**:
   ```bash
   cd backend
   npm run install:backend
   npm run init-db
   ```

2. **Start Development Servers**:
   ```bash
   # From root
   npm run install:all
   npm run dev
   ```

3. **Access Points**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: SQLite file in `backend/database/`

## Common Development Patterns

### Authentication Flow
- Uses JWT tokens stored in localStorage
- AuthContext manages user state across the application
- ProtectedRoute component guards admin-only routes
- API calls include Authorization header with JWT token

### Content Access Control
- Works have 5 content levels with automatic filtering
- Content filtering happens in backend routes based on user membership level
- Frontend displays appropriate content based on received data

### Admin Features
- Complete admin dashboard with user management, work approval, and statistics
- Role-based access control (admin, coach, student, volunteer)
- Operation logging for audit purposes
- Batch operations for user and work management

## File Upload System
- Supports HTML file uploads and external links
- Cover images stored in `backend/uploads/`
- File serving through backend API with proper CORS handling
- Development vs production URL handling for uploaded files