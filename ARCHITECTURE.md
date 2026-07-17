# BookMate - Complete Application Structure

BookMate is a modern web application for sharing, lending, borrowing, and discovering books built with React and Next.js.

## Project Overview

### Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Context API for auth and global state

**Backend:**
- Next.js API routes
- PostgreSQL with Prisma ORM
- JWT authentication
- bcrypt for password hashing

## Complete Folder Structure

```
BookMate/
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── BookCard.jsx         # Book display card
│   │   │   ├── Button.jsx           # Custom button component
│   │   │   ├── Modal.jsx            # Modal dialog
│   │   │   ├── Loading.jsx          # Loading indicator
│   │   │   └── EmptyState.jsx       # Empty state UI
│   │   ├── pages/                   # Page components
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── Marketplace.jsx      # Book marketplace
│   │   │   ├── MyBooks.jsx          # User's book library
│   │   │   ├── BorrowRequests.jsx   # Borrow requests page
│   │   │   └── Profile.jsx          # User profile
│   │   ├── layouts/                 # Layout components
│   │   ├── services/                # API service layer
│   │   │   ├── authService.js       # Auth API calls
│   │   │   ├── bookService.js       # Book API calls
│   │   │   └── requestService.js    # Request API calls
│   │   ├── context/                 # Context providers
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useAsync.js          # Async operations
│   │   │   └── useForm.js           # Form handling
│   │   ├── routes/                  # Route configurations
│   │   ├── utils/                   # Utility functions
│   │   │   └── validation.js        # Validation helpers
│   │   ├── assets/                  # Images, icons, etc.
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── backend/                     # Next.js backend
│   │   ├── pages/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── register.js  # POST /auth/register
│   │   │   │   │   ├── login.js     # POST /auth/login
│   │   │   │   │   └── me.js        # GET /auth/me
│   │   │   │   ├── books/
│   │   │   │   │   ├── index.js     # GET/POST books
│   │   │   │   │   └── [id].js      # GET/PUT/DELETE book
│   │   │   │   └── requests/
│   │   │   │       ├── index.js     # GET/POST requests
│   │   │   │       └── [id].js      # PUT request status
│   │   │   ├── index.js             # Home page
│   │   │   └── _app.js              # Next.js app wrapper
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database schema
│   │   │   └── seed.js              # Seed data
│   │   ├── middleware/
│   │   │   └── auth.js              # Auth middleware
│   │   ├── services/
│   │   │   └── bookService.js       # Book business logic
│   │   ├── controllers/             # Request handlers
│   │   ├── utils/
│   │   │   └── validation.js        # Validation utilities
│   │   ├── lib/
│   │   │   └── auth.js              # JWT helpers
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── .env.example
│   │   ├── README.md
│   │   └── .gitignore
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── index.html                   # HTML entry point
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
```

## Database Schema (Prisma)

### User Model
```prisma
- id: String (UUID)
- firstName: String
- lastName: String
- email: String (unique)
- password: String (hashed)
- profileImage: String?
- createdAt: DateTime
- updatedAt: DateTime
- ownedBooks: Book[]
- borrowRequests: BorrowRequest[]
```

### Book Model
```prisma
- id: String (UUID)
- title: String
- author: String
- description: String
- category: String
- image: String?
- ownerId: String (FK User)
- status: BookStatus (AVAILABLE | BORROWED)
- createdAt: DateTime
- updatedAt: DateTime
- owner: User
- borrowRequests: BorrowRequest[]
```

### BorrowRequest Model
```prisma
- id: String (UUID)
- borrowerId: String (FK User)
- bookId: String (FK Book)
- status: BorrowRequestStatus (PENDING | APPROVED | REJECTED)
- requestDate: DateTime
- updatedAt: DateTime
- borrower: User
- book: Book
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user
```

### Books
```
GET    /api/books                  # List all books
POST   /api/books                  # Create new book
GET    /api/books/:id              # Get book by ID
PUT    /api/books/:id              # Update book
DELETE /api/books/:id              # Delete book
```

### Borrow Requests
```
GET    /api/requests               # List all requests
POST   /api/requests               # Create new request
PUT    /api/requests/:id           # Approve/reject request
```

## Setup Instructions

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd frontend/backend
npm install
cp .env.example .env

# Configure your PostgreSQL database URL in .env
# DATABASE_URL=postgresql://user:password@localhost:5432/bookmate

# Run migrations
npx prisma migrate dev

# Seed sample data
npm run seed

# Start development server
npm run dev
```

The backend API runs on `http://localhost:4000`

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. AuthContext persists login state
5. Token sent in Authorization header for protected routes
6. Protected routes check token validity

## Key Features

### Public Pages
- **Landing Page** - Hero, how it works, featured books
- **Login/Register** - User authentication

### Protected Pages
- **Dashboard** - Summary of user's books and activity
- **My Books** - Manage owned books (CRUD)
- **Marketplace** - Browse all available books, search and filter
- **Borrow Requests** - Manage pending/approved/rejected requests
- **Profile** - User information and settings

## Component Architecture

### UI Components (Reusable)
- `Button` - Custom button with variants
- `BookCard` - Displays book information
- `Modal` - Dialog for actions
- `Loading` - Loading indicator
- `EmptyState` - Empty state message
- `Navbar` - Navigation bar

### Context Providers
- `AuthContext` - Manages user auth state and JWT

### Custom Hooks
- `useAsync` - Handle async operations
- `useForm` - Form state management

## Styling

**Color Palette:**
- Primary: `#2563EB` (Blue)
- Secondary: `#F8FAFC` (Light Slate)
- Accent: `#F59E0B` (Amber)

**Tailwind CSS:** All components use Tailwind for responsive, utility-first styling

## Development Workflow

1. **Frontend Development:**
   ```bash
   npm run dev        # Start Vite dev server
   ```

2. **Backend Development:**
   ```bash
   cd backend
   npm run dev        # Start Next.js dev server
   ```

3. **Full Stack Development:**
   ```bash
   npm run dev:full   # Runs both frontend and backend
   ```

4. **Database Management:**
   ```bash
   # Create migrations
   npx prisma migrate dev --name "description"
   
   # Seed data
   npm run seed
   
   # View database GUI
   npx prisma studio
   ```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000/api
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/bookmate
JWT_SECRET=your-jwt-secret-key
```

## Future Features (Extensible Design)

The application is built to easily support:

1. **Ratings & Reviews** - Users can review books they've borrowed
2. **Notifications** - Real-time notifications for request status
3. **Messaging System** - Direct chat between users
4. **Wishlist** - Save books to borrow later
5. **AI Book Recommendations** - Personalized suggestions
6. **Exchange History** - Track lending history
7. **Admin Dashboard** - Moderation and analytics
8. **Social Features** - Follow users, see their libraries

## Best Practices Implemented

✅ Clean Architecture - Separation of concerns
✅ Reusable Components - DRY principle
✅ Protected Routes - Authentication check
✅ Error Handling - Try-catch with user feedback
✅ Loading States - Better UX
✅ Responsive Design - Mobile-first
✅ API Service Layer - Centralized API calls
✅ Environment Configuration - Secure credential handling
✅ Database Seeding - Sample data for development
✅ Code Organization - Logical folder structure
✅ Documentation - Comments and README files

## Running the Application

### Option 1: Separate Terminals

Terminal 1 (Frontend):
```bash
cd frontend
npm run dev
```

Terminal 2 (Backend):
```bash
cd frontend/backend
npm run dev
```

### Option 2: Single Command (if concurrently installed)
```bash
cd frontend
npm run dev:full
```

Access the application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Prisma Studio: `http://localhost:5555` (after running `npx prisma studio`)

## Testing the Application

### Sample User (from seed data)
- Email: `ava@bookmate.dev`
- Password: `Password123!`

Other seeded users:
- `noah@bookmate.dev`
- `maya@bookmate.dev`

All have the same password: `Password123!`

## Troubleshooting

**Database Connection Error:**
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Run `npx prisma migrate dev`

**API Not Found:**
- Ensure backend is running on port 4000
- Check VITE_API_URL in frontend .env

**Token Expired:**
- Clear localStorage and log in again
- JWT tokens expire after 7 days

**Port Already in Use:**
- Frontend default: 3000
- Backend default: 4000
- Change in vite.config.js or next.config.js

---

**BookMate** is production-ready and designed for easy extension with future features!
