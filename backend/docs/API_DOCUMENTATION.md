# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Transaction Endpoints

### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "income",
  "amount": 50000,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2024-01-15T10:30:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "userId": "60d5ec49c1234567890abcda",
    "type": "income",
    "amount": 50000,
    "category": "Salary",
    "description": "Monthly salary",
    "date": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Transactions
```http
GET /transactions?page=1&limit=10&type=income&category=Salary&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "userId": "60d5ec49c1234567890abcda",
        "type": "income",
        "amount": 50000,
        "category": "Salary",
        "description": "Monthly salary",
        "date": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Transaction Summary
```http
GET /transactions/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Summary retrieved successfully",
  "data": {
    "totalIncome": 50000,
    "totalExpenses": 15000,
    "balance": 35000,
    "categoryBreakdown": {
      "Salary": { "income": 50000, "expense": 0 },
      "Food": { "income": 0, "expense": 5000 },
      "Transport": { "income": 0, "expense": 10000 }
    }
  }
}
```

### Delete Transaction
```http
DELETE /transactions/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

## Goals Endpoints

### Create Goal
```http
POST /goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalTitle": "Buy a car",
  "targetAmount": 500000,
  "deadline": "2026-12-31T23:59:59Z",
  "currentSavings": 50000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "userId": "60d5ec49c1234567890abcda",
    "goalTitle": "Buy a car",
    "targetAmount": 500000,
    "currentSavings": 50000,
    "deadline": "2026-12-31T23:59:59Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get All Goals
```http
GET /goals?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Goals retrieved successfully",
  "data": {
    "goals": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "userId": "60d5ec49c1234567890abcda",
        "goalTitle": "Buy a car",
        "targetAmount": 500000,
        "currentSavings": 50000,
        "deadline": "2026-12-31T23:59:59Z",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Goal Details
```http
GET /goals/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Goal retrieved successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "userId": "60d5ec49c1234567890abcda",
    "goalTitle": "Buy a car",
    "targetAmount": 500000,
    "currentSavings": 50000,
    "deadline": "2026-12-31T23:59:59Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "monthsLeft": 22,
    "amountLeft": 450000,
    "monthlySavingsRequired": 20454.55
  }
}
```

### Delete Goal
```http
DELETE /goals/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error
