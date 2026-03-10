# Backend Development Guide

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.ts          # Configuration management
│   │   └── database.ts        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts  # Auth logic
│   │   ├── transactionController.ts
│   │   └── goalController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts  # JWT verification
│   │   ├── errorHandler.ts    # Error handling
│   │   └── validateRequest.ts # Input validation
│   ├── models/
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   └── Goal.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── transactionRoutes.ts
│   │   └── goalRoutes.ts
│   ├── validators/
│   │   ├── authValidator.ts
│   │   ├── transactionValidator.ts
│   │   └── goalValidator.ts
│   ├── utils/
│   │   ├── apiResponse.ts     # Response formatting
│   │   └── auth.ts            # Auth utilities
│   └── index.ts               # Application entry point
├── .env.example              # Environment variables template
├── .env.local               # Local development env
├── package.json
├── tsconfig.json
├── README.md
├── API_DOCUMENTATION.md
└── DATABASE_SCHEMA.md
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# IMPORTANT: Change JWT_SECRET to a secure random string
```

### 3. Start MongoDB
```bash
# Using local MongoDB
mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 5. Verify Installation
```bash
# Should return 200 with server info
curl http://localhost:5000/health
```

## Development Workflow

### Making Changes

1. **Add a new endpoint:**
   - Create validator in `validators/`
   - Create controller function in `controllers/`
   - Create route in `routes/`
   - Add route to main `index.ts`

2. **Modify a model:**
   - Update schema in `models/`
   - Ensure backward compatibility
   - Update validators if needed

3. **Add middleware:**
   - Create in `middleware/`
   - Apply in relevant routes

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

Output will be in `dist/` directory.

### Starting Production Server
```bash
npm start
```

## Common Tasks

### Connect Frontend
In your frontend `.env`, set:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Add Authentication to Routes
```typescript
router.get("/protected", authMiddleware, yourHandler);
```

### Add Validation
```typescript
router.post("/", validateRequest(yourSchema), yourHandler);
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify connection string format

### Authentication Failed
- Verify JWT_SECRET is set
- Check token format: `Authorization: Bearer <token>`
- Ensure token hasn't expired

### Validation Errors
- Check request body matches schema
- Verify Content-Type: application/json header
- Review error messages in response

### Port Already in Use
```bash
# Change PORT in .env or
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

## Production Checklist

- [ ] Change NODE_ENV to "production"
- [ ] Use secure JWT_SECRET
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Enable HTTPS
- [ ] Add request rate limiting
- [ ] Set up proper logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Add health checks and monitoring
- [ ] Set up CI/CD pipeline

## Next Steps

1. **Add NLP Integration** - Connect to OpenAI/Gemini API for goal interpretation
2. **Add Analytics** - Implement financial reports and insights
3. **Add File Upload** - Support document/receipt uploads
4. **Add Notifications** - Send goal reminders and alerts
5. **Add Data Export** - Export transactions and reports
6. **Add Testing** - Unit and integration tests
7. **Add API Documentation** - Interactive Swagger docs
