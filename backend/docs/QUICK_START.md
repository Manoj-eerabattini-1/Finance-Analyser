# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js v16+ installed
- MongoDB running locally or MongoDB Atlas account
- npm or yarn or bun

### Step 1: Setup Backend
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start MongoDB (if local)
```bash
# Using mongod command (if installed locally)
mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### Step 4: Start Backend Server
```bash
npm run dev
```

Output should show:
```
[timestamp] Server running on port 5000
MongoDB connected: localhost
```

### Step 5: Test the API
```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🔗 Connect Frontend

### Update Frontend .env
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Update API Client (in frontend)
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## 📝 Example API Calls

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "token": "eyJhbGc..."
  }
}
```

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "type": "income",
    "amount": 50000,
    "category": "Salary",
    "description": "Monthly salary"
  }'
```

### Create Goal
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "goalTitle": "Save for car",
    "targetAmount": 500000,
    "deadline": "2026-12-31T23:59:59Z",
    "currentSavings": 50000
  }'
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT in `.env` or kill process: `lsof -i :5000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| MongoDB connection failed | Ensure MongoDB is running: `mongod` or use Atlas |
| CORS error | Ensure CORS_ORIGIN in `.env` matches frontend URL |
| Token invalid | Token may have expired; login again |
| Validation errors | Check request body format against README |

## 📚 Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database schema details
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - In-depth dev guide
- [README.md](./README.md) - Project overview

## ⚡ Commands Reference

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build TypeScript to JavaScript
npm start               # Run production server

# Code Quality
npm run lint            # Run ESLint
npm test                # Run tests

# Database
npm run seed            # Seed database (if available)
npm run migrate         # Run migrations (if available)
```

## 🎯 Next Steps

1. ✅ Backend is running
2. ○ Connect frontend
3. ○ Test authentication flow
4. ○ Implement transaction features
5. ○ Implement goals features
6. ○ Add NLP integration for goal parsing
7. ○ Deploy to production

---

**Need Help?** Check the full [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
