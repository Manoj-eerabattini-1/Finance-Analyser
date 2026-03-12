import { z } from "zod";

// Used when frontend sends natural language input
export const createGoalSchema = z.object({
  // Natural language input from the chat-style UI
  naturalLanguageInput: z.string().min(3, "Please describe your goal").optional(),
  // OR structured fields (used when NLP parses it first)
  goalTitle: z.string().min(3).max(200).optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().optional(),
  currentSavings: z.number().min(0).optional().default(0),
}).refine(
  (data) => data.naturalLanguageInput || (data.goalTitle && data.targetAmount && data.deadline),
  { message: "Provide either a natural language description or structured goal data" }
);

export const updateGoalSchema = z.object({
  currentSavings: z.number().min(0, "Savings cannot be negative").optional(),
  goalTitle: z.string().min(3).max(200).optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;