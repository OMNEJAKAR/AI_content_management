# Authentication Feature - Login/Register/Logout

This is a complete authentication feature implementation with comprehensive test coverage and CI/CD pipeline setup.

## Features

- ✅ User Registration (Signup)
- ✅ User Login
- ✅ User Logout
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin/Normal user)
- ✅ Comprehensive test coverage
- ✅ CI/CD pipeline with GitHub Actions

## Project Structure

```
feature-auth-login-register-logout/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── roles.js
│   │   ├── utils/
│   │   │   └── ensureAdmin.js
│   │   ├── __tests__/
│   │   │   └── auth.test.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── auth/
│   │   │       └── Login.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── api/
│   │   │   └── auth.js
│   │   ├── __tests__/
│   │   │   ├── Login.test.jsx
│   │   │   ├── App.test.jsx
│   │   │   ├── Navbar.test.jsx
│   │   │   └── auth.test.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── jest.config.cjs
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v20 or higher)
- MongoDB (local or remote)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/ai-cmo-db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=5050
```

5. Run the backend server:
```bash
npm run dev
```

The backend will start on `http://localhost:5050`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API URL:
```
VITE_API_URL=http://localhost:5050
```

5. Run the frontend development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Testing

### Backend Tests

Run backend tests:
```bash
cd backend
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Frontend Tests

Run frontend tests:
```bash
cd frontend
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "role": "normal"
  }
}
```

### POST /api/auth/login
Login with username and password.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "role": "normal"
  }
}
```

### POST /api/auth/logout
Logout (client-side token removal, API endpoint for future token blacklisting).

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Test Coverage

### Backend Tests
- ✅ User registration with valid credentials
- ✅ Registration validation (missing fields, short passwords, etc.)
- ✅ Duplicate username prevention
- ✅ User login with valid credentials
- ✅ Login validation (invalid credentials, missing fields)
- ✅ JWT token generation
- ✅ Authentication middleware
- ✅ Password hashing

### Frontend Tests
- ✅ Login form rendering and interaction
- ✅ Signup form rendering and interaction
- ✅ Form validation
- ✅ Error message display
- ✅ Loading states
- ✅ Logout functionality
- ✅ Session persistence
- ✅ Role-based UI rendering
- ✅ API integration

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically runs:

1. **Backend Tests**: Runs all backend unit tests with MongoDB service
2. **Frontend Tests**: Runs all frontend unit tests
3. **Build**: Builds both backend and frontend applications
4. **Test Summary**: Provides a summary of all test results

The pipeline runs on:
- Push to `main`, `develop`, or `feature/*` branches
- Pull requests to `main` or `develop`

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Token expiration (configurable, default 7 days)
- ✅ Input validation (username min 3 chars, password min 6 chars)
- ✅ Secure password storage (never returned in API responses)

## Deployment

### Backend Deployment

1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible
3. Build and start the server:
```bash
npm start
```

### Frontend Deployment

1. Set the `VITE_API_URL` environment variable
2. Build the application:
```bash
npm run build
```
3. Deploy the `dist/` folder to your hosting platform

## Contributing

When pushing this feature to GitHub:

1. Create a new branch:
```bash
git checkout -b feature/auth-login-register-logout
```

2. Add all files:
```bash
git add .
```

3. Commit:
```bash
git commit -m "feat: Add authentication feature with login/register/logout"
```

4. Push to GitHub:
```bash
git push origin feature/auth-login-register-logout
```

5. Create a Pull Request on GitHub

## Notes

- The default admin user is created automatically: `username: admin`, `password: admin4`
- All passwords are hashed using bcrypt before storage
- JWT tokens are stored in localStorage on the frontend
- The logout endpoint is available for future token blacklisting features

## License

ISC
