# Smart Financial Goal Planning System - Backend

A production-ready backend for an **AI-powered financial goal planning application** that combines intelligent goal interpretation, income & expense tracking, and personalized financial recommendations.

## 🤖 Primary Feature: LLM-Enhanced Goal Planning

The core differentiator of this application is **AI-powered goal interpretation**:

When users create financial goals, the system:
1. **Interprets the goal** using OpenAI or Gemini APIs
2. **Refines the category** (Car, House, Education, Vacation, etc.)
3. **Generates personalized suggestions** based on the goal
4. **Calculates confidence level** (0-100) of the interpretation
5. **Provides budget breakdown** and timeline estimates

**Example:**
```
User creates: "Buy a car for ₹5,00,000 in 2 years"
         ↓
AI interprets and returns:
- Refined title
- Category: Vehicle
- Confidence: 95%
- Suggestions: Insurance, registration, maintenance costs
- Monthly savings required: ₹16,667
```

## ✨ Key Features

### 🧠 AI & Intelligence
- ✅ **LLM-Enhanced Goals** - OpenAI/Gemini API integration
- ✅ **Smart Interpretation** - NLP-powered goal parsing
- ✅ **Fallback Parsing** - Works without API keys (regex-based)
- ✅ **Personalized Suggestions** - AI-generated financial advice

### 💰 Financial Management
- ✅ **Goal Planning** - Create, track, and achieve financial goals
- ✅ **Income/Expense Tracking** - Categorized transaction management
- ✅ **Savings Analysis** - Monthly reports and progress tracking
- ✅ **Financial Insights** - Category breakdown and trend analysis
- ✅ **Savings Plans** - Generate alternative scenarios (accelerated, extended, reduced)

### 🔐 User & Security
- ✅ **Authentication** - JWT-based secure login/register
- ✅ **Input Validation** - Zod schemas for type-safe data
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Password Security** - bcryptjs hashing (10 salt rounds)

### 📊 Analytics & Reports
- ✅ **Monthly Reports** - Income, expenses, balance, savings rate
- ✅ **Category Analytics** - Break down spending by category
- ✅ **Progress Tracking** - Monitor goal achievement
- ✅ **Financial Summary** - Dashboard with all key metrics

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.1
- **Database**: MongoDB + Mongoose 7.5
- **AI Integration**: OpenAI API / Google Gemini
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod 3.22
- **HTTP Client**: Axios (for API calls)
- **Environment**: dotenv
- **Logging**: Morgan
- **Testing**: Vitest

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn or bun

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `CORS_ORIGIN`: Frontend URL

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get authenticated user profile

### Transaction Endpoints

- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/summary` - Get summary of transactions
- `DELETE /api/transactions/:id` - Delete a transaction

### Goals Endpoints

- `POST /api/goals` - Create a new goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get goal details
- `DELETE /api/goals/:id` - Delete a goal

## Project Structure

```
src/
├── models/           # Database schemas
├── controllers/      # Request handlers
├── routes/          # API routes
├── middleware/      # Express middleware
├── validators/      # Input validation schemas
├── utils/           # Utility functions
├── config/          # Configuration files
└── index.ts         # Application entry point
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## License

ISC
