import { Request, Response, NextFunction } from "express";
import axios from "axios";
import Transaction from "../models/Transaction.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import { CurrencyType, formatCurrency } from "../utils/currencyFormatter.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function buildSystemPrompt(userId: any, currency: CurrencyType): Promise<string> {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const transactions = await Transaction.find({ userId, date: { $gte: threeMonthsAgo } });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const avgMonthlyIncome = Math.round(totalIncome / 3);
  const avgMonthlyExpenses = Math.round(totalExpenses / 3);
  const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpenses;
  const savingsRate = avgMonthlyIncome > 0 ? Math.round((avgMonthlySavings / avgMonthlyIncome) * 100) : 0;

  const categoryBreakdown: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => { categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount; });

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ${formatCurrency(Math.round(amt / 3), currency)}/month`)
    .join(", ");

  const goals = await Goal.find({ userId });
  const goalsText = goals.length > 0
    ? goals.map((g) => {
        const progress = g.targetAmount > 0 ? Math.round((g.currentSavings / g.targetAmount) * 100) : 0;
        const monthsLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const monthlyNeeded = monthsLeft > 0 ? Math.round((g.targetAmount - g.currentSavings) / monthsLeft) : 0;
        return `  - "${g.goalTitle}": Target ${formatCurrency(g.targetAmount, currency)}, Saved ${formatCurrency(g.currentSavings, currency)} (${progress}%), ${monthsLeft} months left, needs ${formatCurrency(monthlyNeeded, currency)}/month`;
      }).join("\n")
    : "  No active goals yet.";

  const currencySymbol = currency === "INR" ? "₹" : "$";
  const currencyName = currency === "INR" ? "Indian Rupees (₹)" : "US Dollars ($)";
  const hasData = transactions.length > 0;

  return `You are a smart, empathetic, and realistic financial planning assistant embedded in a personal finance app.

## USER'S REAL FINANCIAL DATA (last 3 months):
- Currency: ${currencyName}
- Average Monthly Income: ${formatCurrency(avgMonthlyIncome, currency)}
- Average Monthly Expenses: ${formatCurrency(avgMonthlyExpenses, currency)}  
- Average Monthly Savings: ${formatCurrency(avgMonthlySavings, currency)}
- Savings Rate: ${savingsRate}%
- Top Expense Categories: ${topCategories || "No expense data yet"}
- Data available: ${hasData ? `Yes (${transactions.length} transactions in last 3 months)` : "No transaction data yet"}

## USER'S ACTIVE GOALS:
${goalsText}

## YOUR PERSONALITY & APPROACH:
- You are warm, honest, and practical — not a yes-man
- You always ground your advice in the user's REAL numbers above
- If a goal is unrealistic given their income, say so clearly and kindly, then suggest a realistic alternative
- If they have no transaction data yet, ask them to share their monthly income/expenses so you can give accurate advice
- Never make up or assume financial numbers — always reference the data above or ask the user

## REALISM CHECK RULES (apply these every time):
1. Any goal requiring monthly savings > 50% of their average monthly savings capacity is AGGRESSIVE — flag it
2. Any goal requiring monthly savings > 80% of savings capacity is UNREALISTIC — push back and suggest extending the timeline or reducing target
3. If savings capacity (income - expenses) is negative or zero, tell them honestly and focus on expense reduction first
4. When suggesting savings amounts, always state what % of their income/savings it represents
5. Always mention the tradeoff: "This means ${currencySymbol}X/month which is Y% of your monthly savings"

## WHAT YOU CAN DO:
1. Create financial goals (extract from natural language and save to database)
2. Log income transactions (when user mentions receiving money)
3. Log expense transactions (when user mentions spending money)
4. Add progress/funds to an existing goal
5. Give personalized financial advice based on REAL data
6. Run "what if" scenarios: "What if I save X/month?" or "How long to reach Y?"
7. Warn about unrealistic goals and suggest realistic alternatives
8. Analyze spending patterns and give actionable advice

## RESPONSE STYLE:
- Be concise. Use bullet points for lists of items
- For calculations, show your working: "At ${currencySymbol}X/month savings, you can save ${currencySymbol}Y in Z months"
- When validating a goal, always show: Target ÷ Timeline = Monthly Required, then compare to their actual capacity
- End with a question or encouragement to keep the conversation going

## ACTION FORMAT:
When performing an action, add this block at the VERY END of your message (after everything else):

For creating a goal:
ACTION:{"type":"create_goal","goalTitle":"string","targetAmount":number,"deadlineMonths":number}

For logging income:
ACTION:{"type":"add_transaction","transactionType":"income","amount":number,"category":"string","description":"string"}

For logging an expense:
ACTION:{"type":"add_transaction","transactionType":"expense","amount":number,"category":"string","description":"string"}

For adding funds to an existing goal (use exact goal title from the list above):
ACTION:{"type":"update_goal","goalTitle":"string","addAmount":number}

IMPORTANT: Only include ONE action block per response. Only include it when you are genuinely performing an action — NOT for advice, questions, or analysis.`;
}

export const chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throw new ApiError(400, "Message is required");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, "AI service not configured. Please add GEMINI_API_KEY to backend .env");
    }

    const user = await User.findById(req.userId);
    const currency: CurrencyType = (user?.currency as CurrencyType) || "INR";
    const systemPrompt = await buildSystemPrompt(req.userId, currency);

    // Build Gemini contents array from conversation history
    const contents: any[] = (conversationHistory as ChatMessage[]).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add current message
    contents.push({ role: "user", parts: [{ text: message }] });

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }
    );

    const rawReply: string =
      geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Please try again.";

    // Extract ACTION block from end of reply
    const actionMatch = rawReply.match(/ACTION:(\{[^}]+\}|\{[\s\S]*?\})/);
    let action: any = null;
    let cleanReply = rawReply.replace(/ACTION:\{[\s\S]*?\}/, "").trim();

    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
      } catch {
        console.warn("Failed to parse LLM action JSON:", actionMatch[1]);
      }
    }

    // Execute action on MongoDB
    let actionResult: any = null;
    if (action) {
      try {
        if (action.type === "create_goal") {
          const deadlineDate = new Date();
          deadlineDate.setMonth(deadlineDate.getMonth() + Math.max(1, action.deadlineMonths || 12));

          const goal = new Goal({
            userId: req.userId,
            goalTitle: action.goalTitle,
            targetAmount: action.targetAmount,
            deadline: deadlineDate,
            currentSavings: 0,
          });
          await goal.save();
          actionResult = {
            type: "goal_created",
            goalTitle: action.goalTitle,
            targetAmount: action.targetAmount,
          };

        } else if (action.type === "add_transaction") {
          const transaction = new Transaction({
            userId: req.userId,
            type: action.transactionType,
            amount: action.amount,
            category: action.category || "Other",
            description: action.description || message.substring(0, 100),
            date: new Date(),
          });
          await transaction.save();
          actionResult = {
            type: "transaction_created",
            transactionType: action.transactionType,
            amount: action.amount,
            category: action.category,
          };

        } else if (action.type === "update_goal") {
          const goal = await Goal.findOne({
            userId: req.userId,
            goalTitle: { $regex: new RegExp(action.goalTitle, "i") },
          });
          if (goal) {
            goal.currentSavings = Math.min(goal.currentSavings + action.addAmount, goal.targetAmount);
            await goal.save();
            actionResult = {
              type: "goal_updated",
              goalTitle: goal.goalTitle,
              newSavings: goal.currentSavings,
            };
          }
        }
      } catch (actionErr) {
        console.error("Action execution failed:", actionErr);
        // Still return the reply even if action fails
      }
    }

    sendResponse(res, 200, true, "Chat response generated", {
      reply: cleanReply,
      action: actionResult,
    });
  } catch (error) {
    next(error);
  }
};