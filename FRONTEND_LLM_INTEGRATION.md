# Frontend Integration Guide - LLM-Enhanced Goals

## Overview

This guide shows frontend developers how to integrate and display LLM-enhanced goal data returned from the backend. When goals are created, they now include intelligent AI insights that should be prominently displayed to users.

---

## 📡 Expected Response Structure

When creating a goal, the backend now returns an `llmEnhanced` field with AI insights:

```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f9",
    "userId": "user-id",
    "goalTitle": "Buy a car",
    "targetAmount": 500000,
    "currentSavings": 100000,
    "deadline": "2026-12-31",
    "createdAt": "2026-03-08T10:30:00Z",
    "updatedAt": "2026-03-08T10:30:00Z",
    
    "llmEnhanced": {
      "confidence": 95,
      "refinedCategory": "Car",
      "rawInterpretation": "Purchase a personal vehicle",
      "estimatedDeadlineMonths": 22,
      "suggestions": [
        "Budget ₹50,000-75,000 for insurance annually",
        "Include registration fees (~₹25,000)",
        "Reserve ₹10,000/year for maintenance",
        "Monthly savings target: ₹16,667"
      ]
    }
  }
}
```

---

## 🎨 UI Components to Create/Update

### 1. Goal Card with AI Insights

**Display all goal information including AI suggestions:**

```tsx
// components/dashboard/GoalCard.tsx
import React from 'react';
import { Goal } from '../../types/finance';

interface GoalCardProps {
  goal: Goal & { llmEnhanced?: any };
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { llmEnhanced } = goal;
  const progressPercent = (goal.currentSavings / goal.targetAmount) * 100;

  return (
    <div className="goal-card border rounded-lg p-6 bg-white shadow-md">
      {/* Goal Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{goal.goalTitle}</h3>
          {llmEnhanced && (
            <p className="text-sm text-gray-600 mt-1">
              {llmEnhanced.rawInterpretation}
            </p>
          )}
        </div>
      </div>

      {/* AI Confidence Badge (if available) */}
      {llmEnhanced && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
            🤖 AI Confidence: {llmEnhanced.confidence}%
          </span>
          {llmEnhanced.refinedCategory && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
              Category: {llmEnhanced.refinedCategory}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>Savings Progress</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-600">Current</p>
          <p className="text-lg font-bold">₹{goal.currentSavings?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Target</p>
          <p className="text-lg font-bold">₹{goal.targetAmount?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Remaining</p>
          <p className="text-lg font-bold">
            ₹{(goal.targetAmount - goal.currentSavings)?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI Suggestions */}
      {llmEnhanced?.suggestions && llmEnhanced.suggestions.length > 0 && (
        <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>💡</span> AI-Powered Financial Tips
          </h4>
          <ul className="space-y-2">
            {llmEnhanced.suggestions.map((suggestion, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex gap-2">
                <span className="text-blue-600">▸</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deadline Info */}
      <div className="text-sm text-gray-600 flex justify-between">
        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
        {llmEnhanced?.estimatedDeadlineMonths && (
          <span>Months Left: {llmEnhanced.estimatedDeadlineMonths}</span>
        )}
      </div>
    </div>
  );
};
```

---

### 2. Goal Creation Form with AI Preview

**Show AI enhancement after form submission:**

```tsx
// components/dashboard/GoalCreationForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface CreateGoalResponse {
  success: boolean;
  data: {
    goalTitle: string;
    targetAmount: number;
    llmEnhanced: {
      confidence: number;
      refinedCategory: string;
      rawInterpretation: string;
      suggestions: string[];
    };
  };
}

export const GoalCreationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    goalTitle: '',
    targetAmount: '',
    deadline: '',
    currentSavings: '',
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post<CreateGoalResponse>(
        'http://localhost:5000/api/goals',
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: (response) => {
      setAiData(response.data.llmEnhanced);
      setShowPreview(true);
      
      // Optional: Clear form after successful creation
      setTimeout(() => {
        setFormData({
          goalTitle: '',
          targetAmount: '',
          deadline: '',
          currentSavings: '',
        });
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGoalMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="goal-creation-form max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create a New Financial Goal</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Goal Title
          </label>
          <input
            type="text"
            name="goalTitle"
            value={formData.goalTitle}
            onChange={handleChange}
            placeholder="e.g., Buy a car, Save for house..."
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Be descriptive! The AI will analyze your goal better.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount (₹)
            </label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="500000"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Savings (₹)
          </label>
          <input
            type="number"
            name="currentSavings"
            value={formData.currentSavings}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={createGoalMutation.isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {createGoalMutation.isPending ? '🤖 AI is analyzing...' : 'Create Goal'}
        </button>
      </form>

      {/* AI Enhancement Preview */}
      {showPreview && aiData && (
        <div className="mt-8 pt-8 border-t-2">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🤖</span> AI-Powered Analysis
          </h3>

          <div className="space-y-4">
            {/* Confidence Score */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900">AI Confidence Score</span>
                <span className="text-2xl font-bold text-blue-600">{aiData.confidence}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${aiData.confidence}%` }}
                />
              </div>
            </div>

            {/* Category & Interpretation */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">AI-Identified Category</p>
              <p className="text-lg font-bold text-purple-700">{aiData.refinedCategory}</p>
              <p className="text-sm text-gray-700 mt-2">{aiData.rawInterpretation}</p>
            </div>

            {/* Financial Suggestions */}
            {aiData.suggestions && aiData.suggestions.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">💡 Smart Suggestions</h4>
                <ul className="space-y-2">
                  {aiData.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-800 flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadline Analysis */}
            {aiData.estimatedDeadlineMonths && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Estimated Timeline</p>
                <p className="text-lg font-bold text-orange-700">
                  {aiData.estimatedDeadlineMonths} months
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowPreview(false)}
            className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close Preview
          </button>
        </div>
      )}

      {/* Loading State */}
      {createGoalMutation.isPending && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin">🤖</div>
          <p className="text-gray-600 mt-2">AI is analyzing your goal...</p>
        </div>
      )}

      {/* Error Handling */}
      {createGoalMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p>Failed to create goal. Please try again.</p>
        </div>
      )}
    </div>
  );
};
```

---

### 3. Goals List with AI Insights

**Display multiple goals with AI information:**

```tsx
// components/dashboard/GoalsList.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GoalCard } from './GoalCard';

export const GoalsList: React.FC = () => {
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/goals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div className="text-center p-8">Loading your financial goals...</div>;
  }

  if (!goalsData || goalsData.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No goals yet. Create your first goal to get AI insights!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Financial Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goalsData.map((goal) => (
          <GoalCard key={goal._id} goal={goal} />
        ))}
      </div>
    </div>
  );
};
```

---

## 🔌 API Integration Examples

### Axios Setup with Proper Headers

```typescript
// utils/axiosConfig.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Create Goal Mutation Hook

```typescript
// hooks/useCreateGoal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/axiosConfig';

interface CreateGoalInput {
  goalTitle: string;
  targetAmount: number;
  deadline: string;
  currentSavings?: number;
}

interface CreateGoalResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    goalTitle: string;
    targetAmount: number;
    llmEnhanced?: {
      confidence: number;
      refinedCategory: string;
      rawInterpretation: string;
      suggestions: string[];
      estimatedDeadlineMonths: number;
    };
  };
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: CreateGoalInput) => {
      const response = await apiClient.post<CreateGoalResponse>(
        '/goals',
        goalData
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Refresh goals list
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      // Optional: Show success toast
      console.log('Goal created with AI insights!', data.data.llmEnhanced);
    },
  });
};
```

---

## 📊 Type Definitions

### Update your TypeScript types to include llmEnhanced field

```typescript
// types/finance.ts
export interface Goal {
  _id: string;
  userId: string;
  goalTitle: string;
  targetAmount: number;
  currentSavings?: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  
  // 🤖 NEW: AI Enhancement Field
  llmEnhanced?: {
    confidence: number;           // 0-100
    refinedCategory: string;      // Auto-detected category
    rawInterpretation: string;    // AI's interpretation of the goal
    suggestions: string[];        // Array of financial tips
    estimatedDeadlineMonths: number; // Estimated months to deadline
  };
}

export type CreateGoalInput = Omit<Goal, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'llmEnhanced'>;
export type CreateGoalResponse = { success: boolean; data: Goal };
```

---

## 🎨 CSS Classes to Add

If using Tailwind CSS (already in the project):

```css
/* Custom styles for LLM features */
.goal-card {
  @apply border-l-4 border-l-blue-500;
  transition: box-shadow 0.3s ease;
}

.goal-card:hover {
  @apply shadow-lg;
}

.ai-badge {
  @apply inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold;
}

.suggestion-item {
  @apply flex gap-2 p-2 rounded hover:bg-gray-50;
}

.confidence-high {
  @apply bg-green-100 text-green-800;
}

.confidence-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.confidence-low {
  @apply bg-red-100 text-red-800;
}

.ai-enhancement-section {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200;
}
```

---

## ⚡ Error Handling

Handle cases where LLM enhancement might fail gracefully:

```typescript
// Handle missing llmEnhanced field
const displayLLMData = (goal: Goal) => {
  if (!goal.llmEnhanced) {
    return (
      <div className="text-gray-500 text-sm">
        AI enhancement was skipped or unavailable. 
        (Backend may be offline or API key missing)
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded">
      {/* Display llmEnhanced data */}
    </div>
  );
};
```

---

## 🧪 Testing LLM Integration

### Test with curl to verify backend

```bash
# Create a goal
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "goalTitle": "Save for a dream vacation in Europe",
    "targetAmount": 300000,
    "deadline": "2027-06-30",
    "currentSavings": 50000
  }'

# Response should include llmEnhanced field
```

### React component test example

```typescript
// __tests__/GoalCard.test.tsx
import { render, screen } from '@testing-library/react';
import { GoalCard } from './GoalCard';

it('displays AI suggestions when available', () => {
  const mockGoal = {
    _id: '123',
    userId: 'user123',
    goalTitle: 'Buy a car',
    targetAmount: 500000,
    currentSavings: 100000,
    deadline: '2026-12-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    llmEnhanced: {
      confidence: 95,
      refinedCategory: 'Car',
      rawInterpretation: 'Purchase a personal vehicle',
      suggestions: [
        'Budget ₹50,000 for insurance',
        'Include registration fees',
      ],
      estimatedDeadlineMonths: 22,
    },
  };

  render(<GoalCard goal={mockGoal} />);
  
  screen.getByText('AI Confidence: 95%');
  screen.getByText('Category: Car');
  screen.getByText('Budget ₹50,000 for insurance');
});
```

---

## 🚀 Next Steps

1. **Update GoalCard Component**: Display llmEnhanced data
2. **Update GoalCreationForm**: Show AI enhancement after creation
3. **Add Loading States**: Show "AI is analyzing..." during creation
4. **Add Error Handling**: Handle cases where LLM fails gracefully
5. **Update Types**: Add llmEnhanced to Goal interface
6. **Test End-to-End**: Create a goal and verify AI suggestions appear

---

## 📝 Example: Complete Goal with All AI Data

```json
{
  "_id": "65a1b2c3d4e5f9",
  "userId": "user-12345",
  "goalTitle": "Save for a dream vacation in Europe for 2 weeks",
  "targetAmount": 800000,
  "currentSavings": 100000,
  "deadline": "2027-06-30",
  "createdAt": "2026-03-08T10:30:00.000Z",
  "updatedAt": "2026-03-08T10:30:15.000Z",
  
  "llmEnhanced": {
    "confidence": 92,
    "refinedCategory": "Vacation",
    "rawInterpretation": "International vacation to Europe for 2 weeks with budget accommodation",
    "estimatedDeadlineMonths": 15,
    "suggestions": [
      "Book flights 2-3 months in advance for 20-30% savings",
      "Budget €100-150/day for accommodation (including tax)",
      "Travel insurance: ~₹8,000-12,000 for Europe",
      "Daily expenses (food/activities): €50-75 per person",
      "Currency buffer: Keep 10% extra for exchange fluctuations",
      "Monthly savings needed: ₹46,667"
    ]
  }
}
```

---

**This completes the frontend integration needed to showcase your Smart Goal Planning with AI as the primary feature! 🎉**

For questions on display formatting or component structure, refer to your existing components in the dashboard folder as reference.
