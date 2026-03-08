import axios from "axios";

/**
 * LLM Service for integrating with external APIs
 * Supports OpenAI and Gemini APIs
 */

interface GoalInterpretationResult {
  goalTitle: string;
  targetAmount: number;
  estimatedDeadlineMonths: number;
  category: string;
  confidence: number;
  rawInterpretation: string;
}

/**
 * Use OpenAI API to interpret a goal from natural language
 * Example: "I want to save ₹5,00,000 for a car in 2 years"
 */
export const interpretGoalWithOpenAI = async (
  goalDescription: string
): Promise<GoalInterpretationResult> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const prompt = `
Parse the following financial goal and extract structured information:
"${goalDescription}"

Return a JSON object with:
- goalTitle (string): Short title for the goal
- targetAmount (number): Amount in rupees (extract or estimate)
- estimatedDeadlineMonths (number): Months to achieve goal
- category (string): One of [Car, House, Education, Vacation, Emergency Fund, Investment, Wedding, Retirement, Business, Other]
- confidence (number): 0-100 confidence in the interpretation
- rawInterpretation (string): Your understanding of the goal

Return ONLY valid JSON, no markdown.`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      goalTitle: parsed.goalTitle || "Financial Goal",
      targetAmount: parsed.targetAmount || 100000,
      estimatedDeadlineMonths: parsed.estimatedDeadlineMonths || 12,
      category: parsed.category || "Other",
      confidence: parsed.confidence || 50,
      rawInterpretation: parsed.rawInterpretation || content,
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to interpret goal with OpenAI");
  }
};

/**
 * Use Gemini API to interpret a goal from natural language
 */
export const interpretGoalWithGemini = async (
  goalDescription: string
): Promise<GoalInterpretationResult> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const prompt = `
Parse the following financial goal and extract structured information:
"${goalDescription}"

Return a JSON object with:
- goalTitle (string): Short title for the goal
- targetAmount (number): Amount in rupees (extract or estimate)
- estimatedDeadlineMonths (number): Months to achieve goal
- category (string): One of [Car, House, Education, Vacation, Emergency Fund, Investment, Wedding, Retirement, Business, Other]
- confidence (number): 0-100 confidence in the interpretation
- rawInterpretation (string): Your understanding of the goal

Return ONLY valid JSON, no markdown.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(content);

    return {
      goalTitle: parsed.goalTitle || "Financial Goal",
      targetAmount: parsed.targetAmount || 100000,
      estimatedDeadlineMonths: parsed.estimatedDeadlineMonths || 12,
      category: parsed.category || "Other",
      confidence: parsed.confidence || 50,
      rawInterpretation: parsed.rawInterpretation || content,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to interpret goal with Gemini");
  }
};

/**
 * Choose the best available LLM and interpret goal
 */
export const interpretGoal = async (
  goalDescription: string
): Promise<GoalInterpretationResult> => {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      return await interpretGoalWithOpenAI(goalDescription);
    } catch (error) {
      console.warn("OpenAI API failed, trying Gemini...");
    }
  }

  // Fall back to Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      return await interpretGoalWithGemini(goalDescription);
    } catch (error) {
      console.warn("Gemini API also failed");
    }
  }

  // If no API keys configured, return default interpretation
  console.warn("No LLM API configured, using fallback parsing");
  return fallbackGoalInterpretation(goalDescription);
};

/**
 * Fallback goal interpretation using regex patterns
 * Used when no LLM API is available
 */
function fallbackGoalInterpretation(
  description: string
): GoalInterpretationResult {
  // Try to extract amount (rupees)
  const amountMatch = description.match(/₹?(\d+(?:,?\d+)*)/);
  const targetAmount = amountMatch
    ? parseInt(amountMatch[1].replace(/,/g, ""))
    : 100000;

  // Try to extract timeframe
  const timeMatch = description.match(/(\d+)\s*(year|month|week|day)s?/i);
  let estimatedDeadlineMonths = 12;
  if (timeMatch) {
    const value = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith("year")) {
      estimatedDeadlineMonths = value * 12;
    } else if (unit.startsWith("month")) {
      estimatedDeadlineMonths = value;
    } else if (unit.startsWith("week")) {
      estimatedDeadlineMonths = Math.ceil(value / 4);
    } else if (unit.startsWith("day")) {
      estimatedDeadlineMonths = 1;
    }
  }

  // Determine category
  const lowerDesc = description.toLowerCase();
  let category = "Other";
  if (lowerDesc.includes("car")) category = "Car";
  else if (lowerDesc.includes("house") || lowerDesc.includes("home"))
    category = "House";
  else if (lowerDesc.includes("education") || lowerDesc.includes("study"))
    category = "Education";
  else if (lowerDesc.includes("vacation") || lowerDesc.includes("travel"))
    category = "Vacation";
  else if (lowerDesc.includes("emergency")) category = "Emergency Fund";
  else if (lowerDesc.includes("invest")) category = "Investment";
  else if (lowerDesc.includes("wedding")) category = "Wedding";
  else if (lowerDesc.includes("retire")) category = "Retirement";
  else if (lowerDesc.includes("business")) category = "Business";

  return {
    goalTitle: `Save for ${category}`,
    targetAmount,
    estimatedDeadlineMonths,
    category,
    confidence: 40,
    rawInterpretation: `Fallback parsing: Goal appears to be saving ₹${targetAmount.toLocaleString("en-IN")} for ${category} in ${estimatedDeadlineMonths} months`,
  };
}

/**
 * Generate financial suggestions using LLM
 */
export const generateFinancialSuggestions = async (
  income: number,
  expenses: number,
  savingsGoal: number
): Promise<string[]> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return generateFallbackSuggestions(income, expenses, savingsGoal);
    }

    const prompt = `
Given:
- Monthly Income: ₹${income.toLocaleString("en-IN")}
- Monthly Expenses: ₹${expenses.toLocaleString("en-IN")}
- Savings Goal: ₹${savingsGoal.toLocaleString("en-IN")}

Generate 3 practical financial suggestions to achieve this goal. Be specific and actionable.
Return as a JSON array of strings.`;

    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [content];
    }
  } catch (error) {
    console.warn("LLM suggestion generation failed");
  }

  return generateFallbackSuggestions(income, expenses, savingsGoal);
};

/**
 * Generate fallback suggestions without LLM
 */
function generateFallbackSuggestions(
  income: number,
  expenses: number,
  savingsGoal: number
): string[] {
  const availableSavings = income - expenses;
  const monthsNeeded = Math.ceil(savingsGoal / availableSavings);

  const suggestions = [];

  if (availableSavings < savingsGoal / 12) {
    suggestions.push(
      `Your current savings capacity (₹${availableSavings.toLocaleString("en-IN")}/month) falls short. Consider reducing discretionary expenses by 15-20%.`
    );
  }

  if (expenses > income * 0.7) {
    suggestions.push(
      `Your expense-to-income ratio is high (${Math.round((expenses / income) * 100)}%). Focus on optimizing major expense categories like rent, food, and utilities.`
    );
  }

  if (monthsNeeded <= 12) {
    suggestions.push(
      `At your current rate, you can achieve this goal in approximately ${monthsNeeded} months. Stay disciplined with your budget.`
    );
  } else {
    suggestions.push(
      `Consider extending your deadline or increasing your income to make this goal more achievable within a reasonable timeframe.`
    );
  }

  return suggestions;
}
