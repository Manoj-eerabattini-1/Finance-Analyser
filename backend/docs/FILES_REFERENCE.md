# Backend Files Quick Reference

## 📄 Configuration & Setup Files

| File | Purpose | Key Content |
|------|---------|-------------|
| `package.json` | Dependencies & scripts | Express, Mongoose, JWT, Zod, TypeScript |
| `tsconfig.json` | TypeScript config | ESM modules, strict mode |
| `.env.example` | Environment template | All required variables documented |
| `.env.local` | Local development | Pre-configured for local MongoDB |
| `.gitignore` | Git ignore rules | node_modules, dist, .env files |
| `eslint.config.js` | Linting config | TypeScript ESLint rules |

## 🔐 Authentication System

| File | Exports | Key Functions |
|------|---------|----------------|
| `src/models/User.ts` | User schema | IUser interface, validation |
| `src/validators/authValidator.ts` | Zod schemas | registerSchema, loginSchema |
| `src/controllers/authController.ts` | Controllers | register, login, getProfile |
| `src/routes/authRoutes.ts` | Routes | /auth/register, /auth/login, /auth/profile |
| `src/utils/auth.ts` | Auth utilities | hashPassword, comparePassword, generateToken, verifyToken |
| `src/middleware/authMiddleware.ts` | Middleware | Verify JWT tokens, attach userId |

## 💰 Transaction Management

| File | Exports | Key Functions |
|------|---------|----------------|
| `src/models/Transaction.ts` | Transaction schema | ITransaction interface |
| `src/validators/transactionValidator.ts` | Validation | createTransactionSchema |
| `src/controllers/transactionController.ts` | Controllers | createTransaction, getTransactions, getTransactionSummary, deleteTransaction |
| `src/routes/transactionRoutes.ts` | Routes | /transactions endpoints |

**Features:**
- Filter by type (income/expense)
- Filter by category
- Date range filtering
- Pagination
- Summary with category breakdown

## 🎯 Financial Goals

| File | Exports | Key Functions |
|------|---------|----------------|
| `src/models/Goal.ts` | Goal schema | IGoal interface, deadline validation |
| `src/validators/goalValidator.ts` | Validation | createGoalSchema |
| `src/controllers/goalController.ts` | Controllers | createGoal, getGoals, getGoal, deleteGoal |
| `src/routes/goalRoutes.ts` | Routes | /goals endpoints |

**Features:**
- Automatic calculation of months left
- Monthly savings required calculation
- Deadline validation (future dates only)
- Progress tracking

## 🛠️ Middleware & Configuration

| File | Purpose | Responsibilities |
|------|---------|------------------|
| `src/middleware/authMiddleware.ts` | Authentication | JWT verification, userId attachment |
| `src/middleware/errorHandler.ts` | Error handling | Global error catching, response formatting |
| `src/middleware/validateRequest.ts` | Validation | Input validation with Zod |
| `src/config/database.ts` | DB connection | MongoDB connection & error handling |
| `src/config/config.ts` | Configuration | Centralized config object |

## 🔧 Utilities

| File | Exports | Functions |
|------|---------|-----------|
| `src/utils/auth.ts` | Auth utils | hashPassword, comparePassword, generateToken, verifyToken |
| `src/utils/apiResponse.ts` | Response utils | sendResponse, ApiError class |
| `src/utils/constants.ts` | Constants | Transaction categories, validation limits |
| `src/utils/helpers.ts` | Helpers | asyncHandler, date calculations, validation helpers |

## 📚 Documentation

| File | Audience | Content |
|------|----------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Everyone | Complete overview of what was built |
| `QUICK_START.md` | New developers | 5-minute setup guide |
| `API_DOCUMENTATION.md` | Frontend devs | All endpoints with request/response examples |
| `DATABASE_SCHEMA.md` | Database devs | MongoDB schema definitions & relationships |
| `DEVELOPMENT_GUIDE.md` | Backend devs | In-depth development guide |
| `ENVIRONMENT_SETUP.md` | DevOps/Deployment | Env config, deployment options |
| `README.md` | Project overview | Features, tech stack, prerequisites |

## 📊 Endpoint Summary

### Authentication (3)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/profile` - Get user info (protected)

### Transactions (4)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - List with filters & pagination
- `GET /api/transactions/summary` - Get analytics
- `DELETE /api/transactions/:id` - Remove transaction

### Goals (4)
- `POST /api/goals` - Create goal
- `GET /api/goals` - List with pagination
- `GET /api/goals/:id` - Get with calculations
- `DELETE /api/goals/:id` - Remove goal

### Health (1)
- `GET /health` - Server status

**Total: 12 endpoints**

## 🔍 File Relationships

```
Entry Point: src/index.ts
    ├── src/config/database.ts (MongoDB connection)
    ├── src/middleware/errorHandler.ts (Global error handler)
    ├── src/routes/authRoutes.ts
    │   ├── authController.ts
    │   ├── authValidator.ts
    │   └── authMiddleware.ts
    ├── src/routes/transactionRoutes.ts
    │   ├── transactionController.ts
    │   ├── transactionValidator.ts
    │   └── authMiddleware.ts
    └── src/routes/goalRoutes.ts
        ├── goalController.ts
        ├── goalValidator.ts
        └── authMiddleware.ts

Database Models: src/models/
    ├── User.ts
    ├── Transaction.ts
    └── Goal.ts
```

## 🚀 Getting Started Checklist

- [ ] Read `IMPLEMENTATION_SUMMARY.md`
- [ ] Follow `QUICK_START.md`
- [ ] Set up MongoDB (see `ENVIRONMENT_SETUP.md`)
- [ ] Create `.env` file
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test with `curl` or Postman (see `API_DOCUMENTATION.md`)
- [ ] Connect frontend to `http://localhost:5000/api`

## 💡 Key Concepts

### Authentication Flow
1. User POSTs to `/auth/register` → User created, JWT returned
2. User POSTs to `/auth/login` → JWT returned
3. User includes JWT in `Authorization: Bearer <token>` header
4. `authMiddleware` verifies token, attaches `userId` to request
5. Protected route handlers access `req.userId`

### Data Validation
1. Route receives request
2. `validateRequest` middleware calls Zod parser
3. If invalid, Zod error → error handler → 400 response
4. If valid, parsed data in `req.body` → controller

### Error Handling
1. Error thrown in any handler
2. Caught by `express-async-errors`
3. Passed to `errorHandler` middleware
4. Formatted & sent with appropriate status code

## 📦 Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mongoose | ^8.0.0 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.1.2 | JWT creation/verification |
| zod | ^3.22.4 | Schema validation |
| dotenv | ^16.3.1 | Environment variables |
| cors | ^2.8.5 | CORS middleware |
| morgan | ^1.10.0 | Request logging |
| axios | ^1.6.2 | HTTP client (for LLM APIs) |

---

**Ready to develop! 🚀**

Next: Read `QUICK_START.md` or `API_DOCUMENTATION.md`
