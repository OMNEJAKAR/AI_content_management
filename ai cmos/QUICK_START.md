# Quick Start Guide

## Prerequisites
- Node.js 20+ installed
- MongoDB running (local or remote)
- Git installed

## Step-by-Step Setup

### 1. Navigate to the feature folder
```bash
cd feature-auth-login-register-logout
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm test  # Run tests to verify setup
npm run dev  # Start backend server
```

### 3. Frontend Setup (in a new terminal)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL (default: http://localhost:5050)
npm test  # Run tests to verify setup
npm run dev  # Start frontend server
```

### 4. Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Create Account" to register a new user
3. After registration, login with your credentials
4. Test logout functionality

### 5. Run All Tests

**Backend:**
```bash
cd backend
npm test
npm run test:coverage
```

**Frontend:**
```bash
cd frontend
npm test
npm run test:coverage
```

## Pushing to GitHub

### Initial Setup (if starting fresh)
```bash
git init
git add .
git commit -m "feat: Add authentication feature with login/register/logout"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### For Feature Branch
```bash
git checkout -b feature/auth-login-register-logout
git add .
git commit -m "feat: Add authentication feature with login/register/logout"
git push origin feature/auth-login-register-logout
```

Then create a Pull Request on GitHub.

## CI/CD Pipeline

The GitHub Actions workflow will automatically:
1. Run backend tests with MongoDB service
2. Run frontend tests
3. Build both applications
4. Provide test summary

Make sure your GitHub repository has Actions enabled!

## Troubleshooting

### Backend issues:
- Check MongoDB is running: `mongod --version`
- Verify .env file has correct MONGODB_URI
- Check port 5050 is not in use

### Frontend issues:
- Verify .env file has correct VITE_API_URL
- Check backend is running on the specified URL
- Check browser console for errors

### Test failures:
- Ensure MongoDB is accessible for backend tests
- Check all dependencies are installed (`npm install`)
- Verify environment variables are set correctly
