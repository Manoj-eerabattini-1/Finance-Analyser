# Environment Configuration Guide

## Environment Variables

All environment variables are loaded from `.env` file. A template is provided in `.env.example`.

### Required Variables

#### Server Configuration
```env
PORT=5000                           # Server port (default: 5000)
NODE_ENV=development                # development | production | test
```

#### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
```

**Options:**
- **Local MongoDB**: `mongodb://localhost:27017/smart-financial-goal`
retryWrites=true&w=majority`

#### Authentication
```env
JWT_SECRET=your_secure_random_key_here
JWT_EXPIRE=7d
```

**Security Notes:**
- Generate a strong JWT_SECRET (min 32 characters)
- Change in production
- Example: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### CORS Configuration
```env
CORS_ORIGIN=http://localhost:5173
```

**For production**, set to your actual frontend domain:
```env
CORS_ORIGIN=https://yourdomain.com
```

#### Optional: LLM Integration
```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

These are optional but required if you implement NLP goal parsing.

### Logging
```env
LOG_LEVEL=debug                     # debug | info | warn | error
```

## Development Setup

### 1. Local MongoDB

#### Option A: Install MongoDB Locally
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download installer from mongodb.com
# Run installer and MongoDB will start automatically

# Linux (Ubuntu)
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Option B: Use Docker
```bash
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0

# Update .env
MONGODB_URI=mongodb://admin:password@localhost:27017/smart-financial-goal?authSource=admin
```

#### Option C: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env`:
```env

```

### 2. Environment File (.env)

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env

# On Windows VSCode
code .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Server
```bash
npm run dev
```

## Production Setup

### Environment Variables (.env)

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas (recommended for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-financial-goal?retryWrites=true&w=majority

# JWT - MUST be changed
JWT_SECRET=your_super_secure_random_key_minimum_32_characters_long
JWT_EXPIRE=7d

# CORS - set to your actual domain
CORS_ORIGIN=https://yourdomain.com

# Optional: LLM
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

LOG_LEVEL=error
```

### Build & Run
```bash
# Build
npm run build

# Run
npm start
```

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## MongoDB Setup Guide

### Create Database User (Production)

```javascript
// Connect to MongoDB
mongo "mongodb://localhost:27017"

// Switch to admin database
use admin

// Create admin user
db.createUser({
  user: "admin",
  pwd: passwordPrompt(),
  roles: ["root"]
})

// Switch to app database
use "smart-financial-goal"

// Create app user
db.createUser({
  user: "appuser",
  pwd: passwordPrompt(),
  roles: ["readWrite", "dbOwner"]
})
```

### Connection String Format

```
mongodb://<username>:<password>@<host>:<port>/<database>?authSource=admin&retryWrites=true&w=majority
```

## Deployment Examples

### 1. Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET="your-secure-secret"
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set CORS_ORIGIN="your-frontend-url"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### 2. AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create smart-financial-goal-api

# Set environment variables
eb setenv JWT_SECRET="your-secure-secret" MONGODB_URI="your-mongodb-uri"

# Deploy
eb deploy

# View logs
eb logs
```

### 3. Azure App Service

```bash
# Install Azure CLI
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create App Service plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1 --is-linux

# Create web app
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myBackendApp --runtime "NODE|18.0"

# Deploy from GitHub/Local
az webapp deployment
```

### 4. DigitalOcean (App Platform)

1. Push code to GitHub
2. Connect GitHub to DigitalOcean App Platform
3. Configure:
   - Runtime: Node.js 18
   - Build: `npm install && npm run build`
   - Run: `npm start`
4. Add environment variables
5. Deploy

### 5. Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Start
CMD ["npm", "start"]
```

#### .dockerignore
```
node_modules
dist
.env
.git
.gitignore
.DS_Store
npm-debug.log
```

#### Build & Run
```bash
# Build image
docker build -t smart-financial-api .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-secret" \
  smart-financial-api
```

## Environment by Stage

### Development (.env.local)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
JWT_SECRET=dev-secret-not-secure
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

### Staging (.env.staging)
```env
NODE_ENV=staging
PORT=5000
JWT_SECRET=staging-secure-secret-key
CORS_ORIGIN=https://staging.yourdomain.com
LOG_LEVEL=info
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=production-ultra-secure-secret-key
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

## Checklist

### Before Development
- [ ] MongoDB running (local or Atlas)
- [ ] Node.js v16+ installed
- [ ] `.env` file created from `.env.example`
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm run dev`)

### Before Production
- [ ] `.env` configured for production
- [ ] JWT_SECRET is secure (32+ random characters)
- [ ] CORS_ORIGIN set to actual frontend domain
- [ ] MONGODB_URI uses strong credentials
- [ ] NODE_ENV set to "production"
- [ ] All sensitive keys removed from code
- [ ] `.env` file NOT committed to git
- [ ] SSL/HTTPS configured
- [ ] Database has backups
- [ ] Error logging configured (e.g., Sentry)
- [ ] Rate limiting configured
- [ ] CORS properly restricted

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Cannot connect to MongoDB | URL incorrect | Verify MONGODB_URI format |
| Authentication failed | Wrong credentials | Check username/password |
| Port already in use | Another app on port | Change PORT or kill process |
| CORS error in frontend | Wrong CORS_ORIGIN | Set correct frontend URL |
| JWT token invalid | Expired or corrupted | Re-login for new token |
| Database queries slow | Database performance | Check MongoDB indexes |

---

Need help? Check [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
