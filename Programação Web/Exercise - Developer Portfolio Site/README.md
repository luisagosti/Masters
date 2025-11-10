# Personal Developer Portfolio - Full Stack Application

A modern, full-stack portfolio website built with React and Node.js featuring user authentication, role-based access control, and dynamic content management. This application showcases professional identity, skills, and projects while demonstrating secure back-end development practices.

---

## Project Overview

This project evolved from a simple React portfolio into a comprehensive full-stack application with JWT-based authentication, MySQL database integration, and admin functionality. It demonstrates both front-end design skills and back-end security best practices, including password hashing, protected routes, and role-based authorization.

---

## Key Features

### Public Features
- **Responsive Portfolio Display**: Modern, minimalist design showcasing projects, skills, and experience
- **Smooth Navigation**: Single-page application with smooth scrolling between sections
- **Mobile-Friendly**: Fully responsive layout across all device sizes
- **User Registration**: Public registration system for new users
- **User Authentication**: Secure login with JWT tokens

### Authenticated User Features
- **Personal Dashboard**: View portfolio statistics and metrics
- **Protected Routes**: Access to authenticated-only content
- **Profile Management**: View current user information

### Admin Features (Role-Based)
- **User Management (CRUD)**:
  - Create new users with role assignment
  - View all registered users
  - Edit user information (name, email, password, role)
  - Delete users (soft delete)
- **Enhanced Dashboard**: Access to admin-specific statistics
- **User Analytics**: View user roles, activity, and system health

---

## Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |
| Fetch API | HTTP requests |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MySQL 2 | Database driver |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variables |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guest') DEFAULT 'guest',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year VARCHAR(4) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    link VARCHAR(500) DEFAULT '#',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Technologies & Other Tables
- `technologies` - Technology stack items
- `project_technologies` - Many-to-many relationship
- `experiences` - Work experience entries
- `skills` - Skills and proficiencies
- `contact_messages` - Contact form submissions

---

## API Endpoints

### Authentication Routes (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and receive JWT |
| GET | `/auth/me` | Yes | Get current user info |

### User Management Routes (`/users`) - Admin Only
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | Get all users |
| GET | `/users/:id` | Admin | Get user by ID |
| POST | `/users` | Admin | Create new user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user (soft) |

### Project Routes (`/projects`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects` | No | Get all active projects |
| GET | `/projects/:id` | No | Get project by ID |
| POST | `/projects` | Admin | Create project |
| PUT | `/projects/:id` | Admin | Update project |
| DELETE | `/projects/:id` | Admin | Delete project |

### Dashboard Routes (`/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | Yes | Get user dashboard |
| GET | `/dashboard/analytics` | Admin | Get detailed analytics |

---

## Project Structure

```
portfolio-app/
├── my-web-server/              # Backend
│   ├── config/
│   │   └── db.js               # Database configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── usersController.js  # User CRUD operations
│   │   ├── projectsController.js
│   │   ├── dashboardController.js
│   │   └── homeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── roleMiddleware.js   # Role-based access
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js       # User management routes
│   │   ├── projectRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── homeRoutes.js
│   ├── utils/
│   │   └── generateToken.js    # JWT token generation
│   ├── database_schema.sql     # Database schema
│   ├── seedDatabase.js         # Database seeding script
│   ├── server.js               # Express app entry
│   ├── .env                    # Environment variables
│   └── package.json
│
└── src/                        # Frontend
    ├── App.js                  # Main React component
    ├── index.js
    ├── index.css               # Tailwind imports
    └── reportWebVitals.js
```

---

## Security Features

### 1. Password Security
- **bcryptjs hashing**: All passwords hashed with salt rounds of 10
- **No plaintext storage**: Passwords never stored in plain text
- **Secure comparison**: bcrypt.compare() for password verification

### 2. JWT Authentication
- **Token-based auth**: Stateless authentication using JSON Web Tokens
- **1-hour expiration**: Tokens expire after 1 hour
- **Secure payload**: Contains only necessary user data (id, email, name, role)
- **Bearer token format**: Industry-standard `Authorization: Bearer <token>`

### 3. Authorization Middleware
- **Role-based access**: Separate permissions for admin and guest users
- **Protected routes**: Middleware prevents unauthorized access
- **Token verification**: All protected routes verify JWT validity

### 4. Environment Variables
- **Sensitive data protection**: Database credentials and JWT secret in .env
- **Not committed**: .env file excluded from version control
- **Required variables**:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_password
  DB_NAME=portfolio_db
  JWT_SECRET=your_secret_key
  PORT=3000
  ```

### 5. Input Validation
- **Required field checks**: Validation on all user inputs
- **Email uniqueness**: Prevents duplicate email registrations
- **SQL injection prevention**: Parameterized queries throughout

### 6. Soft Deletes
- **Data preservation**: Users marked inactive instead of deleted
- **Audit trail**: Maintains historical data
- **Self-protection**: Admins cannot delete their own accounts

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/luisagosti/Masters/tree/main/Programa%C3%A7%C3%A3o%20Web/Exercise%20-%20Developer%20Portfolio%20Site
   cd portfolio-app/my-web-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create MySQL database**
   ```bash
   mysql -u root -p
   CREATE DATABASE portfolio_db;
   ```

4. **Run database schema**
   ```bash
   mysql -u root -p portfolio_db < database_schema.sql
   ```

5. **Create .env file**
   ```bash
   # Create .env in my-web-server directory
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=portfolio_db
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   ENVIRONMENT=development
   ```

6. **Seed the database** (optional but recommended)
   ```bash
   node seedDatabase.js
   ```

7. **Start the server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start React app**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3001`

---

## Default Test Accounts

After running the seed script, these accounts are available:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@portfolio.com | admin123 | admin | Full admin access |
| guest@portfolio.com | guest123 | guest | Standard user access |

---

## Testing the Application

### Using Postman

1. **Register a new user**
   ```
   POST http://localhost:3000/auth/register
   Body: {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Login**
   ```
   POST http://localhost:3000/auth/login
   Body: {
     "email": "admin@portfolio.com",
     "password": "admin123"
   }
   Response: { "token": "eyJhbGc..." }
   ```

3. **Access protected route**
   ```
   GET http://localhost:3000/dashboard
   Headers: Authorization: Bearer <your_token>
   ```

4. **Create user (admin only)**
   ```
   POST http://localhost:3000/users
   Headers: Authorization: Bearer <admin_token>
   Body: {
     "name": "New User",
     "email": "newuser@example.com",
     "password": "password123",
     "role": "guest"
   }
   ```

5. **Get all users (admin only)**
   ```
   GET http://localhost:3000/users
   Headers: Authorization: Bearer <admin_token>
   ```

6. **Update user (admin only)**
   ```
   PUT http://localhost:3000/users/4
   Headers: Authorization: Bearer <admin_token>
   Body: {
     "name": "Updated Name",
     "role": "admin"
   }
   ```

7. **Delete user (admin only)**
   ```
   DELETE http://localhost:3000/users/4
   Headers: Authorization: Bearer <admin_token>
   ```

---

## Design & User Experience

### Color Palette
- **Primary**: `#323232` (Dark Grey)
- **Secondary**: `#DDD0C8` (Warm Beige)
- **Background**: `#FAF8F7` (Off-White)

### Typography
- **System Fonts**: -apple-system, BlinkMacSystemFont, Segoe UI
- **Font Weight**: Light (300) for elegant, modern feel
- **Tracking**: Wide letter-spacing for uppercase text

### Layout Principles
- **Whitespace**: Generous padding for breathing room
- **Grid System**: Tailwind's 12-column grid
- **Responsive Breakpoints**: Mobile-first approach
- **Smooth Animations**: Subtle hover effects and transitions

---

## Assignment Completion Checklist

- [x] **Database Creation**: All necessary tables created with proper relationships
- [x] **User Table**: Includes authentication fields and role management
- [x] **Database Population**: Seed script populates all tables with sample data
- [x] **User Registration**: New users can register with automatic role assignment
- [x] **User Authentication**: JWT-based login system implemented
- [x] **Authorization by Role**: Middleware enforces admin vs guest permissions
- [x] **Password Hashing**: bcrypt used for all password operations
- [x] **Token Security**: JWTs handled safely with HttpOnly best practices
- [x] **Environment Variables**: .env file used for all sensitive data
- [x] **API Endpoints**: /users, /auth, /projects, /dashboard all functional
- [x] **Front-End Integration**: React dynamically interacts with all API endpoints
- [x] **Modular Structure**: Clean separation of controllers, routes, middleware
- [x] **Testing**: All routes tested and verified via Postman and front-end
- [x] **GitHub Repository**: Project hosted with clear commit history
- [x] **README Documentation**: Comprehensive documentation of all endpoints and features

---

## Common Issues & Troubleshooting

### Database Connection Errors
- Verify MySQL is running: `mysql.server start` (macOS) or `sudo service mysql start` (Linux)
- Check credentials in .env file
- Ensure database exists: `SHOW DATABASES;`

### JWT Token Errors
- Check JWT_SECRET is set in .env
- Verify token format: `Bearer <token>`
- Token may be expired (1 hour lifespan)

### CORS Errors
- Verify frontend URL in server.js cors configuration
- Check browser console for specific CORS error
- Ensure credentials: true is set

### Port Already in Use
- Kill process on port 3000: `lsof -ti:3000 | xargs kill`
- Or change PORT in .env file

---

## License & Credits

**Developer**: Luis Alexandre Agostinho  
**Educational Institution**: Universidade Autonoma de Lisboa
**Course**: Web Programming  
**Year**: 2025

All assets are royalty-free or self-created.  
This project was developed for educational purposes to demonstrate full-stack development skills, authentication systems, and secure coding practices.

---

## Contact

- **Email**: llagostinho01@gmail.com
- **LinkedIn**: [linkedin.com/in/luisagosti](https://www.linkedin.com/in/luisagosti)
- **GitHub**: [github.com/luisagosti](https://github.com/luisagosti)
