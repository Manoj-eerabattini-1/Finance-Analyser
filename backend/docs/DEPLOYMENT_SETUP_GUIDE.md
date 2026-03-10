# Deployment & Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Backend](#running-the-backend)
6. [Testing the API](#testing-the-api)
7. [Frontend Integration](#frontend-integration)
8. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **MongoDB**: v5.0 or higher
- **Git**: for version control

### Optional (for Enhanced Features)
- **OpenAI API Key**: For natural language goal interpretation (https://openai.com/api)
- **Google Gemini API Key**: Alternative LLM provider (https://makersuite.google.com)
- **Postman**: For API testing (https://www.postman.com)

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- Express.js - Web framework
- Mongoose - MongoDB ORM
- JWT - Authentication
- Zod - Input validation
- Axios - HTTP client
- Morgan - Logging
- CORS - Cross-origin support

### Step 2: Verify Installation

```bash
npm list
```

You should see ~50+ packages installed without errors.

### Step 3: Build TypeScript (Optional)

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

---

## Database Setup

### Option 1: Local MongoDB

#### On Windows:
```bash
# Install MongoDB Community Edition from:
# https://www.mongodb.com/try/download/community

# Start MongoDB service (if installed as service)
net start MongoDB

# Or run from command line
mongod
```

#### On macOS:
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### On Linux:
```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongod
```

#### Verify Connection:
```bash
# Open MongoDB shell
mongosh

# You should see the MongoDB shell prompt
>
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`
5. Add your IP address to IP Whitelist
6. Use the connection string in `.env` file

---

## Environment Configuration

### Step 1: Create .env File

Create a file named `.env` in the backend root directory:

```bash
cp .env.example .env
```

### Step 2: Configure Variables

Edit `.env` with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/smart-financial-goal

# Or for MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-financial-goal?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345!@#
JWT_EXPIRE=7d

# Frontend Configuration
CORS_ORIGIN=http://localhost:5173

# LLM APIs (Optional - for enhanced goal interpretation)
OPENAI_API_KEY=sk-... (get from https://openai.com/api)
GEMINI_API_KEY=... (get from https://makersuite.google.com)

# Logging
LOG_LEVEL=debug
```

### Important Notes:
- **In Production**: Change `NODE_ENV=production`
- **Change JWT_SECRET**: Use a complex, random string
- **Use Strong Password**: If using MongoDB with authentication
- **Never commit .env file**: Add to .gitignore

---

## Running the Backend

### Development Mode (with Hot Reload)

```bash
npm run dev
```

Output should look like:
```
🚀 Server running on http://localhost:5000
📊 Database connected: mongodb://localhost:27017/smart-financial-goal
✅ All systems operational
```

### Production Mode

```bash
npm run build
npm start
```

### Check Server Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Testing the API

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Save the returned `token` for subsequent requests.

**Create Transaction:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 50000,
    "description": "Monthly salary",
    "type": "income",
    "category": "Salary",
    "date": "2024-03-01"
  }'
```

**Get Monthly Report:**
```bash
curl -X GET "http://localhost:5000/api/reports/monthly?month=2&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Download Postman from https://www.postman.com
2. Import the collection: File → Import → Choose `POSTMAN_COLLECTION.json`
3. Update variables: Set `token` after login
4. Execute requests with one click

---

## Frontend Integration

### Connect Frontend to Backend

Update frontend API base URL in [src/api/client.ts](../../src/api/client.ts):

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Update Environment Variables

Create `.env` in frontend root:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### API Endpoints Reference

```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/profile

Transactions:
  POST   /api/transactions
  GET    /api/transactions
  GET    /api/transactions/summary
  DELETE /api/transactions/:id

Goals:
  POST   /api/goals
  GET    /api/goals
  GET    /api/goals/:id
  DELETE /api/goals/:id

Planner (NEW):
  POST   /api/planner/generate-plan
  GET    /api/planner/plans
  GET    /api/planner/plans/:id
  DELETE /api/planner/plans/:id

Reports (NEW):
  GET    /api/reports/monthly
  GET    /api/reports/spending-categories
  GET    /api/reports/savings-progress
  GET    /api/reports/summary

Health:
  GET    /health
```

### Example Frontend Call

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generate savings plan
async function generateSavingsPlan(goalId) {
  try {
    const response = await api.post('/planner/generate-plan', { goalId });
    return response.data.data;
  } catch (error) {
    console.error('Error generating plan:', error);
    throw error;
  }
}

// Get financial summary
async function getFinancialSummary() {
  try {
    const response = await api.get('/reports/summary');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}
```

---

## Production Deployment

### Option 1: Heroku Deployment

#### Step 1: Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### Step 2: Create Heroku App
```bash
heroku create your-app-name
```

#### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret
heroku config:set MONGODB_URI=your_atlas_connection_string
heroku config:set CORS_ORIGIN=https://your-frontend-url.com
```

#### Step 4: Deploy
```bash
git push heroku main
```

#### Step 5: Monitor Logs
```bash
heroku logs --tail
```

### Option 2: AWS EC2 Deployment

#### Step 1: Launch EC2 Instance
- OS: Ubuntu 22.04 LTS
- Instance type: t2.micro (eligible for free tier)
- Storage: 20GB
- Security group: Allow ports 80, 443, 5000

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### Step 3: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 4: Install MongoDB
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

#### Step 5: Clone Repository
```bash
git clone your-repo-url
cd backend
npm install
```

#### Step 6: Create .env
```bash
sudo nano .env
# Add your configuration
```

#### Step 7: Start with PM2
```bash
sudo npm install -g pm2
pm2 start src/index.ts --name "smart-financial-api"
pm2 startup
pm2 save
```

### Option 3: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/smart-financial-goal
      - NODE_ENV=production
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

#### Deploy
```bash
docker-compose up -d
```

### Option 4: DigitalOcean App Platform

1. Push code to GitHub
2. Connect DigitalOcean to GitHub
3. Create new app → Select repository
4. Add environment variables
5. Configure MongoDB instance
6. Deploy with one click

---

## Monitoring & Maintenance

### Common Issues & Solutions

**Issue**: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check connection string in .env

**Issue**: JWT Token Expired
```
Error: invalid signature / token expired
```
**Solution**: 
- Token expires after 7 days (configurable via JWT_EXPIRE)
- Frontend should redirect to login when token expires

**Issue**: CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: 
- Update CORS_ORIGIN in .env to match frontend URL
- For local development: `http://localhost:5173`
- For production: `https://your-domain.com`

### Health Check

```bash
# Check if API is running
curl http://localhost:5000/health

# Check database connection
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Logs & Debugging

View server logs:
```bash
# Development (with npm run dev)
# Logs appear in terminal

# Production (with PM2)
pm2 logs smart-financial-api

# Docker
docker-compose logs -f api
```

---

## Performance Tips

1. **Enable Compression**: Express compresses responses
2. **Use Connection Pooling**: Mongoose manages this
3. **Index Database**: Add indexes to frequently queried fields
4. **Cache Reports**: Cache 5-minute-old reports
5. **Use CDN**: For static assets (~upcoming~)
6. **Rate Limiting**: Implement for auth endpoints

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable CORS only for your domain
- [ ] Validate all inputs (Zod schemas used)
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Use environment variables (never commit .env)
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Enable rate limiting on auth endpoints

---

## Next Steps

1. ✅ Backend Setup Complete
2. → **Frontend Integration** (in my-money-mentor folder)
3. → Testing & QA
4. → User Acceptance Testing
5. → Production Deployment
6. → Monitoring & Maintenance

---

**Questions? Check the full API documentation in API_DOCUMENTATION.md** ✅
