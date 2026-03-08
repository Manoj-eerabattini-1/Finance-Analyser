# Database Schema Documentation

## User Schema

**Collection:** `users`

```typescript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, 6+ chars, hashed),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

### Indexes
- `email` - unique index

---

## Transaction Schema

**Collection:** `transactions`

```typescript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: User),
  type: String (required, enum: ["income", "expense"]),
  amount: Number (required, > 0),
  category: String (required),
  description: String (optional, max 500 chars),
  date: Date (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

### Indexes
- `userId` - for user queries
- `date` - for date range queries

---

## Goal Schema

**Collection:** `goals`

```typescript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: User),
  goalTitle: String (required, 3-200 chars),
  targetAmount: Number (required, > 0),
  deadline: Date (required, must be future date),
  currentSavings: Number (default: 0, >= 0),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

### Indexes
- `userId` - for user queries
- `deadline` - for sorting by deadline

---

## Derived Fields (Calculated on Read)

### Goals Additional Fields (calculated when fetching a single goal)

- `monthsLeft` - number of months until deadline
- `amountLeft` - targetAmount - currentSavings
- `monthlySavingsRequired` - amountLeft / monthsLeft

---

## Relationships

```
User (1) ─── (Many) Transaction
User (1) ─── (Many) Goal
```
